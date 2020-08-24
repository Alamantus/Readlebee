const fetch = require('node-fetch');

class Inventaire {
  constructor(language = 'en') {
    this.lang = language;
  }

  static get url() {
    return 'https://inventaire.io';
  }

  static getLink(uri) {
    return `${Inventaire.url}/entity/${uri}`;
  }

  static handleQuickEntity(entityObject) {
    return {
      id: null,
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
      sources: [
        {
          source: 'inventaire',
          uri: (
            typeof entityObject.uri !== 'undefined'
              ? entityObject.uri
              : null
          ),
          link: (
            typeof entityObject.uri !== 'undefined'
              ? `${Inventaire.url}/entity/${entityObject.uri}`
              : null
          ),
        },
      ],
      covers: (
        typeof entityObject.image !== 'undefined'
          ? entityObject.image.map(imageId => {
            return {
              sourceId: imageId.toString(),
              url: `${Inventaire.url}/img/entities/${imageId}`,
            }
          })
          : []
      ),
    };
  }

  static handleEntity(entityObject, language) {
    const hasLabels = typeof entityObject.labels !== 'undefined';
    const hasDescriptions = typeof entityObject.descriptions !== 'undefined';

    return {
      name: (
        hasLabels && typeof entityObject.labels[language] !== 'undefined'
          ? entityObject.labels[language]
          : (
            hasLabels && Object.keys(entityObject.labels).length > 0
              ? entityObject.labels[Object.keys(entityObject.labels)[0]]
              : null
          )
      ),
      description: (
        hasDescriptions && typeof entityObject.descriptions[language] !== 'undefined'
          ? entityObject.descriptions[language]
          : (
            hasDescriptions && Object.keys(entityObject.descriptions).length > 0
              ? entityObject.descriptions[Object.keys(entityObject.descriptions)[0]]
              : null
          )
      ),
      sources: [
        {
          source: 'inventaire',
          uri: (
            typeof entityObject.uri !== 'undefined'
              ? entityObject.uri
              : null
          ),
          link: (
            typeof entityObject.uri !== 'undefined'
              ? `${Inventaire.url}/entity/${entityObject.uri}`
              : null
          ),
        },
      ],
    };
  }

  async getBookData(uri) {
    if (uri) {
      const request = fetch(`${Inventaire.url}/api/entities?action=by-uris&uris=${encodeURIComponent(uri)}`)
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

      let bookData = await json;

      if (typeof bookData.entities !== 'undefined' && typeof bookData.entities[uri] !== 'undefined') {
        bookData = Inventaire.handleEntity(bookData.entities[uri], this.lang);
        bookData['covers'] = await this.getCovers(bookData.sources[0].uri);

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
    const editionsRequest = fetch(`${Inventaire.url}/api/entities?action=reverse-claims&value=${encodeURIComponent(uri)}&property=wdt:P629`)
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

    const isbnsRequest = fetch(`${Inventaire.url}/api/entities?action=by-uris&uris=${encodeURIComponent(editionURIs)}`);
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
          sourceId: entity.uri,
          url: typeof entity.claims['invp:P2'] !== 'undefined' ? `${Inventaire.url}/img/entities/${entity.claims['invp:P2'][0]}` : null,
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