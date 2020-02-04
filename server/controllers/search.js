const fetch = require('node-fetch');

const BooksController = require('./books');

class SearchController {
  constructor(searchTerm, language = 'en') {
    this.term = searchTerm;
    this.lang = language;
  }
  
  get hasQuery() {
    return typeof this.term !== 'undefined' && this.term !== '';
  }

  quickSearchInventaire() {
    if (this.hasQuery) {
      const request = fetch(`https://inventaire.io/api/search?types=works&search=${encodeURIComponent(this.term)}&lang=${encodeURIComponent(this.lang)}&limit=10`)
      request.catch(exception => {
        console.error(exception);
        return {
          error: exception,
          message: 'An error occurred when trying to reach the Inventaire API.',
        }
      });
      const json = request.then(response => response.json());
      json.catch(exception => {
        console.error(exception);
        return {
          error: exception,
          message: 'An error occurred when trying read the response from Inventaire as JSON.',
        }
      });
      return json.then(responseJSON => {
        const booksController = new BooksController('inventaire', undefined, this.lang);
        
        return responseJSON.results.map(work => {
          const bookData = booksController.Inventaire.handleQuickEntity(work);
          booksController.uri = bookData.uri; // Update booksController.uri for each book when fetching community data.
          const communityData = booksController.getCommunityData(5);
          
          return {
            ...bookData,
            ...communityData,
          }
        });
      });
    }
  }

  searchInventaire(searchBy = 'title') {
    if (this.hasQuery) {
      const request = fetch(`https://inventaire.io/api/entities?action=search&search=${encodeURIComponent(this.term)}&lang=${encodeURIComponent(this.lang)}`)
      request.catch(exception => {
        console.error(exception);
        return {
          error: exception,
          message: 'An error occurred when trying to reach the Inventaire API.',
        }
      });
      const json = request.then(response => response.json());
      json.catch(exception => {
        console.error(exception);
        return {
          error: exception,
          message: 'An error occurred when trying read the response from Inventaire as JSON.',
        }
      });
      return json.then(responseJSON => {
        const booksController = new BooksController('inventaire', undefined, this.lang);
        return responseJSON.works.map(work => {
          const bookData = booksController.Inventaire.handleEntity(work);
          const communityData = booksController.getCommunityData(5);
          
          return {
            ...bookData,
            ...communityData,
          }
        });
      });
    }
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
      srsearch: this.term,
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

    return fetch(`https://openlibrary.org/search.json?${searchBy}=${encodeURIComponent(this.term)}`)
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