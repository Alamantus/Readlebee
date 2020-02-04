const fetch = require('node-fetch');

class Inventaire {
  constructor(bookURI, language) {
    this.url = 'https://inventaire.io';
    this.uri = bookURI;
    this.lang = language;
  }

  handleQuickEntity(entityObject) {
    return {
      name: (
        typeof entityObject.label !== 'undefined'
          ? entityObject.label
          : null
      ),
      description: (
        typeof entityObject.description !== 'undefined'
          ? entityObject.description
          : null
      ),
      link: (
        typeof entityObject.uri !== 'undefined'
          ? `${this.url}/entity/${entityObject.uri}`
          : null
      ),
      uri: (
        typeof entityObject.uri !== 'undefined'
          ? entityObject.uri
          : null
      ),
      covers: (
        typeof entityObject.image !== 'undefined'
          ? entityObject.image.map(imageId => {
            return {
              uri: imageId.toString(),
              url: `${this.url}/img/entities/${imageId}`,
            }
          })
          : []
      ),
    };
  }

  handleEntity(entityObject) {
    const hasLabels = typeof entityObject.labels !== 'undefined';
    const hasDescriptions = typeof entityObject.descriptions !== 'undefined';

    return {
      name: (
        hasLabels && typeof entityObject.labels[this.lang] !== 'undefined'
          ? entityObject.labels[this.lang]
          : (
            hasLabels && Object.keys(entityObject.labels).length > 0
              ? entityObject.labels[Object.keys(entityObject.labels)[0]]
              : null
          )
      ),
      description: (
        hasDescriptions && typeof entityObject.descriptions[this.lang] !== 'undefined'
          ? entityObject.descriptions[this.lang]
          : (
            hasDescriptions && Object.keys(entityObject.descriptions).length > 0
              ? entityObject.descriptions[Object.keys(entityObject.descriptions)[0]]
              : null
          )
      ),
      link: (
        typeof entityObject.uri !== 'undefined'
          ? `${this.url}/entity/${entityObject.uri}`
          : null
      ),
      uri: (
        typeof entityObject.uri !== 'undefined'
          ? entityObject.uri
          : null
      ),
    };
  }

  async getBookData(uri) {
    if (uri) {
      const request = fetch(`${this.url}/api/entities?action=by-uris&uris=${encodeURIComponent(uri)}`)
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

      const bookData = await json;

      if (typeof bookData.entities !== 'undefined' && typeof bookData.entities[uri] !== 'undefined') {
        const bookData = this.handleEntity(bookData.entities[uri], this.lang);
        bookData['covers'] = await this.getCovers();

        return bookData;
      }
    }

    return {
      name: 'No URI provided',
    };
  }

  async getCovers(uri) {
    if (!uri) {
      return Promise.resolve([]);
    }

    // Note: property `wdt:P629` is a given entity (uri)'s list of editions (ISBNs).
    const editionsRequest = fetch(`${this.url}/api/entities?action=reverse-claims&uri=${encodeURIComponent(uri)}&property=wdt:P629`)
    editionsRequest.catch(exception => {
      console.error(exception);
      return {
        error: exception,
        message: `An error occurred when trying to reach the Inventaire API for URI ${uri}.`,
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

    const isbnsRequest = fetch(`${this.url}/api/entities?action=by-uris&uris=${encodeURIComponent(editionURIs)}`);
    isbnsRequest.catch(exception => {
      console.error(exception);
      return {
        error: exception,
        message: `An error occurred when trying to reach the Inventaire API for URI ${uri}.`,
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

      const covers = Object.keys(responseJSON.entities).filter(key => {
        const entity = responseJSON.entities[key];
        return entity.originalLang === this.lang && typeof entity.claims !== undefined && typeof entity.claims['invp:P2'] !== undefined;
      }).map(key => {
        const entity = responseJSON.entities[key];
        return {
          uri: entity.uri,
          url: typeof entity.claims['invp:P2'] !== 'undefined' ? `${this.url}/img/entities/${entity.claims['invp:P2'][0]}` : null,
          publishDate: typeof entity.claims['wdt:P577'] !== 'undefined' ? entity.claims['wdt:P577'][0] : null,
        }
      });

      covers.sort((a, b) => {
        if (a.publishDate === b.publishDate) return 0;
        if (!a.publishDate && !!b.publishDate) return 1;
        if (!!a.publishDate && !b.publishDate) return 1;
        return a.publishDate < b.publishDate ? -1 : 1;
      });

      return covers;
    });
  }
}

module.exports = Inventaire;