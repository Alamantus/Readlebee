const html = require('choo/html');

const { ShelvesController } = require('./controller');  // The controller for this view, where processing should happen.
const { shelfView } = require('./shelf');
const { userShelvesView } = require('./userShelves');

// This is the view function that is exported and used in the view manager.
const shelvesView = (state, emit, i18n) => {
  const controller = new ShelvesController(state, i18n);

  // Returning an array in a view allows non-shared parent HTML elements.
  // This one doesn't have the problem right now, but it's good to remember.
  return [
    (controller.targetShelf !== null
      ? shelfView(controller, emit)
      : userShelvesView(controller, emit)
    ),
  ];
}

module.exports = { shelvesView };
