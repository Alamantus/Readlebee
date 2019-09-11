const fetch = require('node-fetch');

class SearchController {
  constructor(searchTerm, language = 'en') {
    this.term = searchTerm;
    this.lang = language;
  }
  
  get hasQuery() {
    return typeof this.term !== 'undefined' && this.term !== '';
  }

  searchInventaire() {
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
        const humans = responseJSON.humans.map(human => {
          const hasLabels = typeof human.labels !== 'undefined';
          const hasDescriptions = typeof human.descriptions !== 'undefined';
          const hasImage = typeof human.image !== 'undefined';
          return {
            name: (
              hasLabels && typeof human.labels[this.lang] !== 'undefined'
              ? human.labels[this.lang]
              : (
                hasLabels && Object.keys(human.labels).length > 0
                ? human.labels[Object.keys(human.labels)[0]]
                : null
              )
            ),
            description: (
              hasDescriptions && typeof human.descriptions[this.lang] !== 'undefined'
              ? human.descriptions[this.lang]
              : (
                hasDescriptions && Object.keys(human.descriptions).length > 0
                ? human.descriptions[Object.keys(human.descriptions)[0]]
                : null
              )
            ),
            link: (
              typeof human.uri !== 'undefined'
              ? `https://inventaire.io/entity/${human.uri}`
              : null
            ),
            image: (
              hasImage && typeof human.image.url !== 'undefined'
              ? human.image
              : null
            ),
          };
        });
        
        const series = responseJSON.series.map(serie => {
          const hasLabels = typeof serie.labels !== 'undefined';
          const hasDescriptions = typeof serie.descriptions !== 'undefined';
          return {
            name: (
              hasLabels && typeof serie.labels[this.lang] !== 'undefined'
              ? serie.labels[this.lang]
              : (
                hasLabels && Object.keys(serie.labels).length > 0
                ? serie.labels[Object.keys(serie.labels)[0]]
                : null
              )
            ),
            description: (
              hasDescriptions && typeof serie.descriptions[this.lang] !== 'undefined'
              ? serie.descriptions[this.lang]
              : (
                hasDescriptions && Object.keys(serie.descriptions).length > 0
                ? serie.descriptions[Object.keys(serie.descriptions)[0]]
                : null
              )
            ),
            link: (
              typeof serie.uri !== 'undefined'
              ? `https://inventaire.io/entity/${serie.uri}`
              : null
            ),
          };
        });

        const works = responseJSON.works.map(work => {
          const hasLabels = typeof work.labels !== 'undefined';
          const hasDescriptions = typeof work.descriptions !== 'undefined';
          const hasImage = typeof work.image !== 'undefined';
          return {
            name: (
              hasLabels && typeof work.labels[this.lang] !== 'undefined'
              ? work.labels[this.lang]
              : (
                hasLabels && Object.keys(work.labels).length > 0
                ? work.labels[Object.keys(work.labels)[0]]
                : null
              )
            ),
            description: (
              hasDescriptions && typeof work.descriptions[this.lang] !== 'undefined'
              ? work.descriptions[this.lang]
              : (
                hasDescriptions && Object.keys(work.descriptions).length > 0
                ? work.descriptions[Object.keys(work.descriptions)[0]]
                : null
              )
            ),
            link: (
              typeof work.uri !== 'undefined'
              ? `https://inventaire.io/entity/${work.uri}`
              : null
            ),
            image: (
              hasImage && typeof work.image.url !== 'undefined'
              ? human.image
              : null
            ),
            // Ratings and review count will be added here
          };
        });

        return {
          humans,
          series,
          works,
        }
      });
    }
  }

  async getInventaireCovers(inventaireURI) {
    if (!inventaireURI) {
      return Promise.resolve([]);
    }

    // Note: property `wdt:P629` is a given entity (uri)'s list of editions (ISBNs).
    const editionsRequest = fetch(`https://inventaire.io/api/entities?action=reverse-claims&uri=${encodeURIComponent(inventaireURI)}&property=wdt:P629`)
    editionsRequest.catch(exception => {
      console.error(exception);
      return {
        error: exception,
        message: `An error occurred when trying to reach the Inventaire API for URI ${inventaireURI}.`,
      }
    });

    const editionsJson = editionsRequest.then(response => response.json());
    editionsJson.catch(exception => {
      console.error(exception);
      return {
        error: exception,
        message: 'An error occurred when trying read the response from Inventaire as JSON.',
      }
    });

    const editions = await editionsJson;
    const editionURIs = typeof editions.uris !== 'undefined' ? editions.uris.join('|') : false;

    if (editionURIs === false) {
      return Promise.resolve([]);
    }

    const isbnsRequest = fetch(`https://inventaire.io/api/entities?action=by-uris&uris=${encodeURIComponent(editionURIs)}`);
    isbnsRequest.catch(exception => {
      console.error(exception);
      return {
        error: exception,
        message: `An error occurred when trying to reach the Inventaire API for URI ${inventaireURI}.`,
      }
    });

    const isbnsJson = isbnsRequest.then(response => response.json());
    isbnsJson.catch(exception => {
      console.error(exception);
      return {
        error: exception,
        message: 'An error occurred when trying read the response from Inventaire as JSON.',
      }
    });
    
    return isbnsJson.then(responseJSON => {
      if (typeof responseJSON.entities === 'undefined') {
        return [];
      }

      return Object.keys(responseJSON.entities).filter(key => {
        const entity = responseJSON.entities[key];
        return entity.originalLang === this.lang && typeof entity.claims !== undefined && typeof entity.claims['invp:P2'] !== undefined ;
      }).map(key => {
        const entity = responseJSON.entities[key];
        return {
          uri: entity.uri,
          cover: `https://inventaire.io/img/entities/${entity.claims['invp:P2'][0]}`,
        }
      });
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