const html = require('choo/html');

const { HomeController } = require('./controller');  // The controller for this view, where processing should happen.
const { loggedOutView } = require('./loggedOut');
const { loggedInView } = require('./loggedIn');

// This is the view function that is exported and used in the view manager.
const homeView = (state, emit, i18n) => {
  const controller = new HomeController(state, i18n);

  // Returning an array in a view allows non-shared parent HTML elements.
  // This one doesn't have the problem right now, but it's good to remember.
  return [
    (!controller.isLoggedIn
      ? loggedOutView(controller, emit)
      : loggedInView(controller, emit)
    ),
  ];
}

module.exports = { homeView };
