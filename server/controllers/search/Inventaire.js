const fetch = require('node-fetch');

const Inventaire = require('../bookData/Inventaire');

function quickSearchInventaire(searchTerm, language) {
  const request = fetch(`${Inventaire.url}/api/search?types=works&search=${encodeURIComponent(searchTerm)}&lang=${encodeURIComponent(language)}&limit=10`)
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

  // Map the results to the correct format.
  return json.then(responseJSON => responseJSON.results.map(work => Inventaire.handleQuickEntity(work)));
}

function searchInventaire(searchTerm, language) {
  if (this.hasQuery) {
    const request = fetch(`${Inventaire.url}/api/entities?action=search&search=${encodeURIComponent(searchTerm)}&lang=${encodeURIComponent(language)}`)
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
      return responseJSON.results.map(async work => {
        const inventaire = new Inventaire(langauge);
        const bookData = Inventaire.handleEntity(work, language);
        bookData['covers'] = await inventaire.getCovers(bookData.sources[0].uri);
        return bookData;
      });
    });
  }
}

module.exports = {
  quickSearchInventaire,
  searchInventaire,
};