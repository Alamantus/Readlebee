import { ViewController } from '../controller';
import { ShelvesController } from '../shelves/controller';

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
      showShelves: false,
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

  get hasFetchedShelves() {
    return typeof this.appState.viewStates.shelves !== 'undefined'
    && typeof this.appState.viewStates.shelves.myShelves !== 'undefined'
    && this.appState.viewStates.shelves.myShelves.length > 0;
  }

  get shelves() {
    if (this.hasFetchedShelves) {
      return this.appState.viewStates.shelves.myShelves;
    }
    return [];
  }

  set openModal(modalId) {
    this.state.openModal = modalId;
  }

  search() {
    if (this.hasQuery) {
      this.state.done = false;
      this.emit(this.appState.events.RENDER, () => {
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
          .then(() => this.emit(this.appState.events.RENDER));
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

  generateTabsCSS() {
    // The built-in tabs from Picnic only includes 4 tabs.
    // This makes only as many tabs as necessary for covers by looking at the covers in the search results.
    const tabClassesNeeded = new Set();
    for (let i = 0; i < this.state.results.length; i++) {
      tabClassesNeeded.add(this.state.results[i].covers.length);
    }
    let css = '';
    for (let numberOfTabs of tabClassesNeeded) {
      const numberSplit = (numberOfTabs).toString().split('');
      // Using `\3` before the first digit allows you to use numbers as CSS classes. Any subsequent digits are grouped after a space
      const cssClassNumber = `\\3${numberSplit[0]}${numberSplit.length > 1 ? ' ' + numberSplit.slice(1).join('') : ''}`
      const tabClassName = `.tabs.${cssClassNumber}`;
      css += `${tabClassName} > .row {
        width: ${100 * (numberOfTabs)}%; left: ${-100 * (numberOfTabs - 1)}%;
      }`;

      for (let x = 0; x < (numberOfTabs - 1); x++) {
        css += `${tabClassName} > input:nth-of-type(${x + 1}):checked ~ .row {
          margin-left: ${(100 * (numberOfTabs)) - (100 * (x + 1))}%;
        }`;
      }

      css += `${tabClassName} > label img {
        width: ${Math.floor(100 / (numberOfTabs)) - 2}%; margin: 4% 0 4% 4%;
      }`
    }
    return css;
  }

  showShelves () {
    const shelfController = new ShelvesController(this.appState, this.i18n);
    let shelvesPromise;
    if (shelfController.state.myShelves.length < 1) {
      console.log('getting');
      shelvesPromise = shelfController.getUserShelves();
    } else {
      shelvesPromise = Promise.resolve();
    }
    shelvesPromise.then(() => {
      console.log(shelfController.state.myShelves);
      this.showShelves = true;
      this.emit(this.appState.events.RENDER);
    });
  }

  addToShelf(bookData, shelfId) {
    const shelfController = new ShelvesController(this.appState, this.i18n);
    shelfController.addItemToShelf(bookData, shelfId).then(result => {
      console.log(result);
      this.showShelves = false;
      this.emit(this.appState.events.RENDER);
    });
  }
}