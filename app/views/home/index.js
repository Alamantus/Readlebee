import html from 'choo/html';

import { HomeController } from './controller';  // The controller for this view, where processing should happen.
import { loggedOutView } from './loggedOut';

// This is the view function that is exported and used in the view manager.
export const homeView = (state, emit) => {
  const controller = new HomeController(state);

  // Returning an array in a view allows non-shared parent HTML elements.
  // This one doesn't have the problem right now, but it's good to remember.
  return [
    (!controller.isLoggedIn
      ? loggedOutView(controller, emit)
      : html`<p>lol wut how are u logged in</p>`
    ),
  ];
}