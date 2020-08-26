const Inventaire = require('./bookData/Inventaire');
const SearchController = require('./search');

class BookReferenceController {
  constructor(sequelizeModels, language) {
    this.models = sequelizeModels;
    this.lang = language;
  }

  static formatReferenceSources(reference) {
    const referenceSources = Object.keys(reference.sources);
    const reformattedSources = referenceSources.map(source => {
      const uri = reference.sources[source];
      let link;
      switch (source) {
        default:
        case 'inventaire': {
          link = `${Inventaire.url}/entity/${uri}`
          break;
        }
      }
      return {
        source,
        uri,
        link,
      }
    });

    reference.sources = reformattedSources;

    return reference;
  }

  async createOrUpdateReference(source, sourceId, skipSearchBySourceCodes = false) {
    const searchController = new SearchController(this.models);
    if (!skipSearchBySourceCodes) {
      const existingReferences = await searchController.searchReferencesBySourceCodes(source, [sourceId]);

      if (existingReferences.length > 0) {
        return existingReferences[0];
      }
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

    if (typeof bookData.sources[0].uri !== 'undefined') {
      // Check for references by exact name and author from source
      const matchingReferences = await searchController.searchReferencesForExactMatch(bookData.name, bookData.description);

      if (matchingReferences.length > 0) {
        // If a match is found, update the sources of reference in the database and return it.
        return await this.addSourceToReference(matchingReferences[0], source, sourceId);
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
    // newReference.totalInteractions = 0;
    // newReference.numReviews = 0;
    // newReference.averageRating = null;
    // newReference.Interactions = [];
    // newReference.Reviews = [];
    // newReference.Ratings = [];
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