import { ViewController } from '../controller';

export class SearchController extends ViewController {
  constructor(state, emit, i18n) {
    // Super passes state, view name, and default state to ViewController,
    // which stores state in this.appState and the view controller's state to this.state
    super(state, i18n, 'search', {
      lastSearch: '',
      lastSource: 'inventaire',
      lastBy: 'title',
      searchSource: 'inventaire',
      searchBy: 'title',
      done: true,
      results: [],
      openModal: null,
    });

    this.emit = emit;

    // If using controller methods in an input's onchange or onclick instance,
    // either bind the class's 'this' instance to the method first...
    // or use `onclick=${() => controller.submit()}` to maintain the 'this' of the class instead.
  }

  get doneSearching() {
    return this.state.done;
  }

  get results() {
    return this.state.results;
  }

  get hasQuery() {
    return this.appState.query.hasOwnProperty('for') && this.appState.query.for.trim() !== '';
  }

  get queryIsNew() {
    return this.state.lastSearch !== this.appState.query.for.trim()
      || this.state.lastSource !== this.state.searchSource
      || this.state.lastBy !== this.state.searchBy;
  }

  get openModal() {
    return this.state.openModal;
  }

  set openModal(modalId) {
    this.state.openModal = modalId;
  }

  search() {
    if (this.hasQuery) {
      this.state.done = false;
      this.emit('render', () => {
        this.state.lastSearch = this.appState.query.for;
        this.state.lastSource = this.state.searchSource;
        this.state.lastBy = this.state.searchBy;
  
        const searchTerm = this.appState.query.for.trim();
  
        return fetch(`/api/search?for=${searchTerm}&by=${this.state.searchBy}&lang=${this.appState.language}&source=${this.state.searchSource}`)
          .then(response => response.json())
          .then(responseJSON => {
            this.state.results = responseJSON;
            this.state.done = true;
          })
          .then(() => this.emit('render'));
      });
    }
  }

  getCovers(inventaireURI) {
    // This should only be callable after results are displayed.
    const workIndex = this.results.works.findIndex(work => work.uri === inventaireURI);
    if (workIndex > -1) { // This should never be false, but just in case...
      if (typeof this.state.results.works[workIndex].covers === 'undefined') {
        // Only fetch covers if not already fetched.
        return fetch(`/api/books/covers?uri=${inventaireURI}&lang=${this.appState.language}`)
          .then(response => response.json())
          .then(responseJSON => {
            this.state.results.works[workIndex].covers = responseJSON;
          });
      }
    }

    return Promise.resolve();
  }
}