const Inventaire = require('./bookData/Inventaire');
const SearchController = require('./search');

class BookReferenceController {
  constructor(sequelizeModels, language) {
    this.models = sequelizeModels;
    this.lang = language;
  }

  async createOrUpdateReference(source, sourceId) {
    const searchController = new SearchController(this.models);
    const existingReference = searchController.searchReferencesBySourceCode(source, sourceId);

    if (existingReference.id !== null) {
      return existingReference;
    }

    let dataClass;
    switch (source) {
      case 'openlibrary': {
        // break;
      }
      case 'inventaire':
      default: {
        dataClass = new Inventaire(this.lang);
        break;
      }
    }

    // Get formatted book data from source
    const bookData = await dataClass.getBookData(sourceId);

    if (typeof bookData.uri !== 'undefined') {
      // Check for references by exact name and author from source
      const matchingReference = await searchController.searchReferencesForExactMatch(bookData.name, bookData.description);

      if (matchingReference.id !== null) {
        // If a match is found, update the sources of reference in the database and return it.
        return await this.addSourceToReference(matchingReference, source, sourceId);
      }

      return await this.createReference(bookData, source, sourceId);
    }

    return {
      error: true,
    }
  }

  async createReference(bookData, source, sourceId) {
    const newReference = await this.models.BookReference.create({
      name: bookData.name,
      description: bookData.description,
      sources: {
        [source]: sourceId,
      },
      covers: bookData.covers,
      locale: this.lang,
    });
    newReference.totalInteractions = 0;
    newReference.numReviews = 0;
    newReference.averageRating = null;
    newReference.Interactions = [];
    newReference.Reviews = [];
    newReference.Ratings = [];
    return newReference;
  }

  async addSourceToReference(reference, source, sourceId) {
    const updatedSources = Object.assign({ [source]: sourceId }, reference.sources);
    return await reference.update({
      sources: updatedSources,
    }).then(() => {
      reference.sources = updatedSources;
      return reference;
    });
  }
}

module.exports = BookReferenceController;