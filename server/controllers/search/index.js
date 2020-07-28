const fetch = require('node-fetch');
const { Op, fn, col } = require('sequelize');

const BooksController = require('../bookData');
const { quickSearchInventaire } = require('./Inventaire');

const defaultSearchOptions = {
  searchBy: 'name', // A column name in the BookReference model, mainly 'name' or 'description'
  source: 'inventaire',
  language: 'en',
}

class SearchController {
  constructor(sequelizeModels) {
    this.models = sequelizeModels;
  }

  get bookReferenceSearchAttributes() {
    return {
      include: [
        {
          as: 'Interactions',
          model: this.models.Review,
          attributes: ['id'],
          required: false,
        },
        {
          as: 'Reviews',
          model: this.models.Review,
          attributes: ['id'],
          required: false,
        },
        {
          as: 'Ratings',
          model: this.models.Review,
          attributes: ['rating'],
          required: false,
        },
      ],  // These are all subsets of Review model specified in BookReference associations
      attributes: [
        [col('BookReference.id'), 'id'],
        'name',
        'description',
        'sources',
        'covers',
        [fn('COUNT', col('Interactions.id')), 'totalInteractions'],
        [fn('COUNT', col('Reviews.id')), 'numReviews'],
        [fn('AVG', col('Ratings.rating')), 'averageRating'],
      ],
      order: [[col('totalInteractions'), 'DESC']],
      group: [
        col('BookReference.id'),
        col('Interactions.id'),
        col('Reviews.id'),
        col('Ratings.id'),
      ],
    };
  }

  async search(searchTerm, options = defaultSearchOptions) {
    const searchBy = options.searchBy.replace('title', 'name').replace('author', 'description');
    const { source, language } = options;
    
    const bookReferences = await this.searchReferences(searchTerm, options);
    let searchResults;
    switch (source) {
      case 'openlibrary': {
        searchResults = await this.searchOpenLibrary(searchBy);
        break;
      }
      case 'inventaire':
      default: {
        searchResults = await quickSearchInventaire(searchTerm, language);
        break;
      }
    }

    // Add any search results that match refs with the same URI and delete from results array
    const urisToCheck = searchResults.filter(
      result => !bookReferences.some(ref => result.uri === ref.sources[source])
    ).map(result => result.uri);

    let extraReferences = [];
    if (urisToCheck.length > 0) {
      // Need to figure this out
      extraReferences = await this.searchReferencesBySourceCodes(source, urisToCheck);
    }
    return [
      ...bookReferences,
      ...extraReferences,
      ...searchResults.filter(  // Only show the rest of the search results
        result => !extraReferences.some(
          ref => result.uri === ref.sources[source]
        )
      ),
    ];
  }

  async searchReferences(searchTerm, options = defaultSearchOptions) {
    const searchBy = options.searchBy.replace('title', 'name').replace('author', 'description');
    const { language } = options;

    const { BookReference } = this.models;

    const exact = await BookReference.findAll({
      where: {
        [Op.and]: [ // All of the contained cases are true
          {
            [searchBy]: searchTerm, // searchBy is exactly searchTerm
          },
          {
            locale: language,
          },
        ]
      },
      ...this.bookReferenceSearchAttributes,
    }).then(  // Empty results give 1 empty model in an array, so filter those out
      references => references.filter(ref => typeof ref.id !== 'undefined' && ref.id !== null)
    );

    if (exact.length > 0) {
      return exact;
    }
    
    // If no exact matches are found, return any approximate ones.
    return await BookReference.findAll({
      where: {
        [Op.and]: [ // All of the contained cases are true
          {
            [searchBy]: {  // `name` or `description`
              [Op.substring]: searchTerm, // LIKE '%searchTerm%'
            },
          },
          {
            locale: language,
          },
        ]
      },
      ...this.bookReferenceSearchAttributes,
    }).then(  // Empty results give 1 empty model in an array, so filter those out
      references => references.filter(ref => typeof ref.id !== 'undefined' && ref.id !== null)
    );
  }

  async searchReferencesBySourceCode(source, sourceId) {
    const sourceJSONKey = `"${source}"`;  // Enable searching withing JSON column.
    return await this.models.BookReference.findOne({
      where: {
        sources: {
          [sourceJSONKey]: {  // Where the object key is the source
            [Op.eq]: sourceId,
          },
        },
      },
      ...this.bookReferenceSearchAttributes,
    }).then(  // Empty results give 1 empty model in an array, so filter those out
      references => references.filter(ref => typeof ref.id !== 'undefined' && ref.id !== null)
    );
  }

  async searchReferencesBySourceCodes(source, sourceIds) {
    const sourceJSONKey = `"${source}"`;  // Enable searching withing JSON column.
    return await this.models.BookReference.findAll({
      where: {
        [Op.or]: sourceIds.map(sourceId => ({
          sources: {
            [sourceJSONKey]: sourceId,
          },
        })),
      },
      ...this.bookReferenceSearchAttributes,
    }).then(  // Empty results give 1 empty model in an array, so filter those out
      references => references.filter(ref => typeof ref.id !== 'undefined' && ref.id !== null)
    );
  }

  /**
   * Query a MediaWiki api.php instance with the given options
   */
  mediaWikiQuery(endpoint, options) {
    /**
     * Create a uniquely-named callback that will process the JSONP results
     */
    var createCallback = function (k) {
      var i = 1;
      var callbackName;
      do {
        callbackName = 'searchCallback' + i;
        i = i + 1;
      } while (window[callbackName])
      window[callbackName] = k;
      return callbackName;
    }

    /**
     * Flatten an object into a URL query string.
     * For example: { foo: 'bar', baz: 42 } becomes 'foo=bar&baz=42'
     */
    var queryStr = function (options) {
      var query = [];
      for (var i in options) {
        if (options.hasOwnProperty(i)) {
          query.push(encodeURIComponent(i) + '=' + encodeURIComponent(options[i]));
        }
      }
      return query.join('&');
    }

    /**
     * Build a function that can be applied to a callback.  The callback processes
     * the JSON results of the API call.
     */
    return function (k) {
      options.format = 'json';
      options.callback = createCallback(k);
      var script = document.createElement('script');
      script.id = 'searchResults';
      script.src = endpoint + '?' + queryStr(options);
      var head = document.getElementsByTagName('head')[0];
      head.appendChild(script);
    };

  }

  async searchWikiBooks(term) {
    if (!term) {
      return [];
    }

    const query = this.mediaWikiQuery('https://en.wikibooks.org/w/api.php', {
      action: 'query',
      list: 'search',
      srsearch: term,
      srprop: '',
    });
    query(response => {
      console.log(response);
      const searchScript = document.getElementById('searchResults');
      searchScript.parentNode.removeChild(searchScript);
      for (let property in window) {
        if (property.includes('searchCallback')) {
          delete window[property];
        }
      }

      const bookResults = [];
      const pageids = response.query.search.map(item => item.pageid);
      const propsQuery = this.mediaWikiQuery('https://en.wikibooks.org/w/api.php', {
        action: 'query',
        pageids: pageids.join('|'),
        prop: 'categories|pageprops',
      });
      propsQuery(propsResponse => {
        console.log(propsResponse);
        for (let pageid in propsResponse.query.pages) {
          if (propsResponse.query.pages[pageid].hasOwnProperty('categories')) {

          }
        }
      });
      return bookResults;
    });
  }

  async searchOpenLibrary(searchTerm, searchBy = 'title') {
    if (!searchTerm) {
      return [];
    }

    return fetch(`https://openlibrary.org/search.json?${searchBy}=${encodeURIComponent(searchTerm)}`)
      .then(res => res.json())
      .then(response => {
        if (!response.hasOwnProperty('docs')) {
          return [];
        }

        const booksController = new BooksController('openLibrary');
        
        // Format the response into usable objects
        const docs = response.docs.map(doc => {
          return booksController.handleOpenLibraryEntity(doc);
        });

        let results = [];
        // Filter out duplicate items with the same title and author
        docs.forEach(doc => {
          const existingDoc = results.find((filterResult) => {
            return filterResult.title === doc.title && filterResult.description === doc.description;
          });

          if (!existingDoc) {
            results.push(doc);
          }
        });

        results = results.map(result => {
          // Find any duplicates in case they have different cover data
          const duplicates = docs.filter(doc => {
            return doc.name.toLowerCase() === result.name.toLowerCase() && doc.description === result.description;
          });
          result.covers = [];
          duplicates.forEach(duplicate => {
            if (duplicate.coverId !== false) {
              result.covers.push({
                uri: duplicate.coverId,
                url: `//covers.openlibrary.org/b/id/${duplicate.coverId}-M.jpg`,
              });
            }
          });
          delete result.coverId;
          return result;
        }).map(bookData => {
          // Use bookController to get community data
          booksController.uri = bookData.uri; // Update booksController.uri for each book when fetching community data.
          const communityData = booksController.getCommunityData(5);
  
          return {
            ...bookData,
            ...communityData,
          };
        });

        return results;
      }).catch(error => {
        console.log(error);
        return [];
      });
  }
}

module.exports = SearchController;