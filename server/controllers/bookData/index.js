const Inventaire = require('./Inventaire');

class BooksController {
  constructor(bookSource, bookURI, language) {
    this.source = bookSource;
    this.Inventaire = new Inventaire(bookURI, language);
    this.openLibrary = 'https://openlibrary.org';
    this.bookBrainz = 'https://bookbrainz.org';
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

  handleOpenLibraryEntity(entityObject) {
    return {
      name: (
        typeof entityObject.title_suggest !== 'undefined'
          ? entityObject.title_suggest
          : null
      ),
      description: (
        typeof entityObject.author_name !== 'undefined'
          ? `${entityObject.type} by ${entityObject.author_name.map(name => name.trim()).join(', ')}`
          : null
      ),
      link: (
        typeof entityObject.key !== 'undefined'
          ? `${this.openLibrary}${entityObject.key}`
          : null
      ),
      uri: (
        typeof entityObject.key !== 'undefined'
          ? entityObject.key.substr(entityObject.key.lastIndexOf('/') + 1)
          : null
      ),
      coverId: (
        typeof entityObject.cover_i !== 'undefined'
          ? entityObject.cover_i.toString()
          : false
      ),
    };
  }

  async createBookReference (bookReferencesModel, source, uri) {
    const inventaire = new Inventaire(this.language);
    const bookData = await inventaire.getBookData(uri);
    return await bookReferencesModel.create({
      name: bookData.name,
      description: bookData.description,
      sources: {
        [source]: uri,
      },
      covers: (bookData.covers ? bookData.covers : []).map(cover => {
        return {
          sourceId: uri,
          url: cover.url,
        };
      }),
      locale: this.language,
    });
  }
}

module.exports = BooksController;