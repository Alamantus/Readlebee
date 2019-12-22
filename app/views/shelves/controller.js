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

  getUserShelves () {
    return [
      {id:1,name:'Test Shelf',isDeletable:false,isPublilc:false},
      {id:1,name:'Deletable Shelf',isDeletable:true,isPublilc:false},
      {id:1,name:'Public Shelf',isDeletable:true,isPublilc:true},
    ];
    // return fetch('/api/shelves/get').then(response => response.json);
  }
}