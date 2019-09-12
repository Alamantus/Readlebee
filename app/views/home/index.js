import html from 'choo/html';

import './styles.scss'; // Creates a separate CSS file, but allows better code splitting.
// We'll see if code splitting is worth it in the end or if we should combine everything into `src/index.scss`
import { HomeController } from './controller';  // The controller for this view, where processing should happen.

// This is the view function that is exported and used in the view manager.
export const homeView = (state, emit) => {
  const controller = new HomeController(state);
  const { i18n } = controller;

  // Returning an array in a view allows non-shared parent HTML elements.
  // This one doesn't have the problem right now, but it's good to remember.
  return [
    html`<section>
      <h2 class="subtitle">${i18n.__('home.subtitle')}</h2>

      <article class="flex two">
        <div class="half">
          <div class="card">
            <header>
              <p>${i18n.__('home.temp_left')}</p>
            </header>
          </div>
        </div>
        <div class="half">
          <div class="card">
            <header>
              <p>${i18n.__('home.temp_right')}</p>
            </header>
          </div>
        </div>
      </article>

      <article class="test">
        ${controller.messages.map(message => {
          return html`<p>${message}</p>`;
        })}
      </article>
    </section>`,
  ];
}