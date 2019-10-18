import html from 'choo/html';

import { HomeController } from './controller';  // The controller for this view, where processing should happen.
import { loggedOutView } from './loggedOut';
import { loggedInView } from './loggedIn';

// This is the view function that is exported and used in the view manager.
export const homeView = (state, emit, i18n) => {
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