import { ViewController } from '../controller';

export class ShelvesController extends ViewController {
  constructor(state, i18n) {
    // Super passes state, view name, and default state to ViewController,
    // which stores state in this.appState and the view controller's state to this.state
    super(state, i18n, 'shelves', {
      openModal: null,  // state value for edit modals
      myShelves: [],  // array of objects in sort order with name, id, and deletability.
      loadedShelves: {},  // object key is shelf id with name and shelfItems
    });

    // If using controller methods in an input's onchange or onclick instance,
    // either bind the class's 'this' instance to the method first...
    // or use `onclick=${() => controller.submit()}` to maintain the 'this' of the class instead.
  }

  get openModal () {
    return this.state.openModal;
  }
  set openModal (modalId) {
    this.state.openModal = modalId;
  }

  get targetShelf () {
    return typeof this.appState.query.shelf !== 'undefined' ? parseInt(this.appState.query.shelf) : null;
  }

  get targetDomain () {
    return typeof this.appState.query.domain !== 'undefined' ? parseInt(this.appState.query.domain) : null;
  }

  getUserShelves () {
    return fetch('/api/shelf/getAll').then(response => response.json()).then(shelves => {
      this.state.myShelves = shelves;
    });
  }

  getTargetShelf () {
    const target = this.targetShelf + '/' + (this.targetDomain !== null ? `${this.targetDomain}` : '');
    return fetch('/api/shelf/get/' + target).then(response => response.json()).then(shelf => {
      this.state.loadedShelves[this.targetShelf] = shelf;
    });
  }

  async addItemToShelf (book, shelfId) {
    let bookId;
    if (typeof book.source !== 'undefined' && typeof book.uri !== 'undefined') {
      const bookSearchResult = await fetch('/api/books/getId', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(book),
      }).then(response => response.json());
      
      if (typeof bookSearchResult.error !== 'undefined') {
        console.error(bookSearchResult);
        return bookSearchResult;
      }

      bookId = bookSearchResult;
    } else {
      bookId = book.id;
    }

    return fetch('/api/shelf/addItem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shelfId,
        bookId,
      }),
    })
  }
}