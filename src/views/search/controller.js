import { ViewController } from '../controller';

export class SearchController extends ViewController {
  constructor(state) {
    // Super passes state, view name, and default state to ViewController,
    // which stores state in this.appState and the view controller's state to this.state
    super(state, 'search', {
      done: false,
      results: [],
    });

    // If using controller methods in an input's onchange or onclick instance,
    // either bind the class's 'this' instance to the method first...
    // or use `onclick=${() => controller.submit()}` to maintain the 'this' of the class instead.
  }

  get results() {
    return [...this.state.results];
  }

  search(term) {
    return fetch('http://openlibrary.org/search.json?q=' + encodeURIComponent(term))
      .then(res => res.json())
      .then(response => {
        if (response.hasOwnProperty('docs')) {
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

          this.state.results = results;
          this.state.done = true;
        }
      });
  }
}