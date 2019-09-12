const fetch = require('node-fetch');

class BooksController {
  constructor(inventaireDomain, bookURI, language) {
    this.inventaire = inventaireDomain;
    this.uri = bookURI;
    this.lang = language;
  }

  getBookData() {
    const bookData = this.getBookDataFromInventaire();
    const communityData = this.getCommunityData();

    return {
      ...bookData,
      ...communityData,
    }
  }

  getCommunityData(maxReviews) {
    if (process.NODE_ENV !== 'production') {
      return this.getFakeData(maxReviews);
    }

    return {};
  }

  getFakeData(maxReviews) {
    const faker = require('faker');
    const numberOfReviews = Math.floor(Math.random() * 100);
    const reviews = [];
    for (let i = 0; i < numberOfReviews; i++) {
      const reviewerName = Math.random() < 0.5
        ? faker.fake('{{name.firstName}} {{name.lastName}}')
        : faker.fake('{{hacker.adjective}}{{hacker.noun}}');
      reviews.push({
        reviewer: {
          name: reviewerName,
          handle: faker.fake('@{{internet.userName}}@{{internet.domainName}}'),
        },
        date: faker.date.past(),
        rating: parseFloat((Math.random() * 5).toFixed(1)),
        review: faker.lorem.paragraph(),
        hearts: Math.floor(Math.random() * 1000),
      });
    }

    const averageRating = parseFloat((reviews.reduce((total, review) => {
      return total + review.rating;
    }, 0) / numberOfReviews).toFixed(1));

    reviews.sort((a, b) => {
      if (a.hearts === b.hearts) return 0;
      return a.hearts > b.hearts ? -1 : 1;
    });

    return {
      averageRating,
      numberOfReviews,
      reviews: typeof maxReviews !== 'undefined' ? reviews.slice(0, maxReviews - 1) : reviews,
    }
  }

  handleInventaireEntity(entityObject) {
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
          ? `${this.inventaire}/entity/${entityObject.uri}`
          : null
      ),
      uri: (
        typeof entityObject.uri !== 'undefined'
          ? entityObject.uri
          : null
      ),
    };
  }

  async getBookDataFromInventaire() {
    if (this.uri) {
      const request = fetch(`${this.inventaire}/api/entities?action=by-uris&uris=${encodeURIComponent(this.uri)}`)
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

      if (typeof bookData.entities !== 'undefined' && typeof bookData.entities[this.uri] !== 'undefined') {
        const bookData = this.handleInventaireEntity(bookData.entities[this.uri], this.lang);
        bookData['covers'] = await this.getInventaireCovers();

        return bookData;
      }
    }

    return {
      name: 'No URI provided',
    };
  }

  async getInventaireCovers() {
    if (!this.uri) {
      return Promise.resolve([]);
    }

    // Note: property `wdt:P629` is a given entity (uri)'s list of editions (ISBNs).
    const editionsRequest = fetch(`${this.inventaire}/api/entities?action=reverse-claims&uri=${encodeURIComponent(this.uri)}&property=wdt:P629`)
    editionsRequest.catch(exception => {
      console.error(exception);
      return {
        error: exception,
        message: `An error occurred when trying to reach the Inventaire API for URI ${this.uri}.`,
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

    const isbnsRequest = fetch(`${this.inventaire}/api/entities?action=by-uris&uris=${encodeURIComponent(editionURIs)}`);
    isbnsRequest.catch(exception => {
      console.error(exception);
      return {
        error: exception,
        message: `An error occurred when trying to reach the Inventaire API for URI ${this.uri}.`,
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
          url: typeof entity.claims['invp:P2'] !== 'undefined' ? `${this.inventaire}/img/entities/${entity.claims['invp:P2'][0]}` : null,
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

module.exports = BooksController;