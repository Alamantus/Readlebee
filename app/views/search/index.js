import html from 'choo/html';

import { I18n } from '../../i18n';
import { SearchController } from './controller';  // The controller for this view, where processing should happen.

// This is the view function that is exported and used in the view manager.
export const searchView = (state, emit) => {
  const i18n = new I18n(state);
  const controller = new SearchController(state);

  if (controller.state.lastSearch !== state.query.for) {
    console.log('searching!');
    controller.search().then(() => {
      emit('render');
    });
  }

  // Returning an array in a view allows non-shared parent HTML elements.
  // This one doesn't have the problem right now, but it's good to remember.
  return [
    html`<section>
      <h2 class="subtitle">${i18n.__('search.header')}</h2>

      <article>
        ${controller.state.done ? 'Done searching' : 'Loading...'}

        ${controller.results.map(result => {
          return html`<div class="card">
            <header>
              ${result.covers.map(cover => {
                return html`<img src=${cover} />`;
              })}
              <h1 class="title">${result.title}</h1>
              ${result.authors.map(author => {
                return html`<h2 class="subtitle">${author}</h2>`;
              })}
            </header>
          </div>`;
        })}
      </article>
    </section>`,
  ];
}