const fetch = require('node-fetch');

class SearchController {
  constructor(searchTerm) {
    this.term = searchTerm;
  }
  
  get hasQuery() {
    return typeof this.term !== 'undefined' && this.term !== '';
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

  async searchOpenLibrary() {
    if (!this.hasQuery) {
      return [];
    }

    return fetch('http://openlibrary.org/search.json?q=' + encodeURIComponent(this.term))
      .then(res => res.json())
      .then(response => {
        if (!response.hasOwnProperty('docs')) {
          return [];
        }
        // Format the response into usable objects
        const docs = response.docs.map(doc => {
          return {
            title: doc.title_suggest.trim(),
            authors: doc.hasOwnProperty('author_name') ? doc.author_name.map(name => name.trim()) : [],
            cover: doc.hasOwnProperty('cover_i') ? `//covers.openlibrary.org/b/id/${doc.cover_i}-S.jpg` : false,
          };
        });

        // Filter out duplicate items with the same title and author
        const results = docs.filter((doc, index, allDocs) => {
          return typeof allDocs.find((filterResult, filterIndex) => {
            return index !== filterIndex && filterResult.title === doc.title
              && JSON.stringify(filterResult.authors) === JSON.stringify(doc.authors);
          }) === 'undefined';
        }).map(result => {
          // Find any duplicates in case they have different cover data
          const duplicates = docs.filter(doc => {
            return doc.title.toLowerCase() === result.title.toLowerCase() && JSON.stringify(doc.authors) === JSON.stringify(result.authors);
          });
          result.covers = [];
          duplicates.forEach(duplicate => {
            if (duplicate.cover !== false) {
              result.covers.push(duplicate.cover);
            }
          });
          return result;
        });

        return results;
      }).catch(error => {
        console.log(error);
        return [];
      });
  }
}

module.exports = SearchController;