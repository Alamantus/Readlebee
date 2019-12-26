import { ViewController } from '../controller';

export class ShelvesController extends ViewController {
  constructor(state, i18n) {
    // Super passes state, view name, and default state to ViewController,
    // which stores state in this.appState and the view controller's state to this.state
    super(state, i18n, 'shelves', {
      openModal: null,  // state value for edit modals
      myShelves: [],  // array of objects in sort order with name, id, and deletability.
      loadedShelves: {  // object key is shelf id with name and shelfItems
        0: {
          name: 'Test Shelf',
          user: {
            userName: 'testinTesterton',
            displayName: 'Testin Testerton',
          },
          shelfItems: [
            {
              name: 'Book Title',
              author: 'Someone Talented',
              coverURL: 'https://picnicss.com/web/img/optimised.svg',
              coverEdition: 'Special Edition',
              rating: 4,
              review: 'The Special Edition of Book Title by Someone Talented is my favorite thing in the whole world. I think and dream about it constantly and there is nothing better in the whole world.',
            }
          ]
        },
      },
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

  getUserShelves () {
    return fetch('/api/shelves/get').then(response => response.json()).then(shelves => {
      this.state.myShelves = shelves;
    });
  }

  getTargetShelf () {
    return fetch('/api/shelf/get/' + this.targetShelf).then(response => response.json()).then(shelf => {
      this.state.loadedShelves[this.targetShelf] = shelf;
    });
  }
}