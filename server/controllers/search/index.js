const fetch = require('node-fetch');
const { Op, fn } = require('sequelize');

const BooksController = require('../bookData');
const { quickSearchInventaire } = require('./Inventaire');

const defaultSearchOptions = {
  searchBy: 'name', // A column name in the BookReference model, mainly 'name' or 'description'
  source: 'inventaire',
  language: 'en',
}

class SearchController {
  constructor(sequelizeModels, searchTerm, options = defaultSearchOptions) {
    this.models = sequelizeModels;
    this.searchTerm = searchTerm;
    this.searchBy = options.searchBy;
    this.source = options.source;
    this.lang = options.language;
  }
  
  get hasQuery() {
    return typeof this.searchTerm !== 'undefined' && this.searchTerm !== '';
  }

  get includeQuery() {
    return [
      {
        model: this.models.Review,
        where: { text: { [Op.not]: null } },
        attributes: [[fn('COUNT', 'id'), 'total']],  // Get the total number of text reviews
        as: 'reviews',
      },
      {
        model: this.models.Review,
        where: { rating: { [Op.not]: null } },
        attributes: [[fn('AVG', 'rating'), 'average']], // Get the average star rating
        as: 'rating',
      },
    ]
  }

  get orderQuery() {
    return [{
      model: this.models.Review,
      attributes: [[fn('COUNT', 'id'), 'total']],  // Get the total number of text reviews
    }, 'total', 'DESC'];  // Order references from most to least interaction
  }

  async search() {
    const bookReferences = await this.searchReferences();
    let searchResults;
    switch (this.source) {
      case 'openlibrary': {
        searchResults = await this.searchOpenLibrary(this.searchBy);
        break;
      }
      case 'inventaire':
      default: {
        searchResults = await quickSearchInventaire(this.searchTerm, this.lang);
        break;
      }
    }

    // Add any search results that match refs with the same URI and delete from results array
    searchResults.forEach((result, i) => {
      // If the result is not already in bookReferences
      if (!bookReferences.some(ref => result.uri === ref.sources[this.source])) {
        // Check if the URI is already in references table
        const reference = await this.searchReferencesBySourceCode(this.source, result.uri);
        if (reference) {
          bookReferences.push(reference);
          searchResults[i] = null;
        }
      } else {  // If the result is already in references, null it out.
        searchResults[i] = null;
      }
    });
    
    return [
      ...bookReferences,
      ...searchResults.filter(result => result !== null),
    ];
  }

  async searchReferences() {
    const { BookReference, Review } = this.models;

    // const includeQuery = [{
    //   model: Review,
    //   include: [
    //     {
    //       model: Reaction.scope('Review'),
    //       group: ['reactionType'],
    //       attributes: ['reactionType', [fn('COUNT', 'reactionType'), 'count']]
    //     },
    //   ],
    //   order: [{
    //     model: Reaction.scope('Review'),
    //     attributes: [[fn('COUNT', 'id'), 'total']],
    //     limit: 1,
    //   }, 'total', 'DESC'],
    //   limit: 5,
    // }];

    const exact = await BookReference.findAll({
      where: {
        [Op.and]: [ // All of the contained cases are true
          {
            [this.searchBy]: this.searchTerm, // searchBy is exactly searchTerm
          },
          {
            locale: this.lang,
          },
        ]
      },
      include: includeQuery(Review),
      order: orderQuery(Review),
    });

    if (exact.length > 0) {
      return exact;
    }

    // If no exact matches are found, return any approximate ones.
    return await BookReference.findAll({
      where: {
        [Op.and]: [ // All of the contained cases are true
          {
            [this.searchBy]: {  // `name` or `description`
              [Op.substring]: this.searchTerm, // LIKE '%searchTerm%'
            },
          },
          {
            locale: this.lang,
          },
        ]
      },
      include: this.includeQuery,
      order: this.orderQuery,
    });
  }

  async searchReferencesBySourceCode(source, sourceId) {
    const sourceJSONKey = `"${source}"`;  // Enable searching withing JSON column.
    return await this.models.BookReference.findOne({
      where: {
        source: {
          [sourceJSONKey]: {  // Where the object key is the source
            [Op.eq]: sourceId,
          },
        },
      },
      include: this.includeQuery,
    });
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
    if (!this.hasQuery) {
      return [];
    }

    const query = this.mediaWikiQuery('https://en.wikibooks.org/w/api.php', {
      action: 'query',
      list: 'search',
      srsearch: this.searchTerm,
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

  async searchOpenLibrary(searchBy = 'title') {
    if (!this.hasQuery) {
      return [];
    }

    return fetch(`https://openlibrary.org/search.json?${searchBy}=${encodeURIComponent(this.searchTerm)}`)
      .then(res => res.json())
      .then(response => {
        if (!response.hasOwnProperty('docs')) {
          return [];
        }

        const booksController = new BooksController('openLibrary', undefined, this.lang);
        
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