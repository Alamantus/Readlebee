import html from 'choo/html';

import { ShelvesController } from './controller';  // The controller for this view, where processing should happen.
import { shelfView } from './shelf';
import { shelvesView } from './shelves';

// This is the view function that is exported and used in the view manager.
export const shelvesView = (state, emit, i18n) => {
  const controller = new ShelvesController(state, i18n);

  // Returning an array in a view allows non-shared parent HTML elements.
  // This one doesn't have the problem right now, but it's good to remember.
  return [
    (controller.targetShelf !== null
      ? shelfView(controller, emit)
      : shelvesView(controller, emit)
    ),
  ];
}