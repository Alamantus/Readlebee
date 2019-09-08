import html from 'choo/html';

// We'll see if code splitting is worth it in the end or if we should combine everything into `src/index.scss`
import { SearchController } from './controller';  // The controller for this view, where processing should happen.

// This is the view function that is exported and used in the view manager.
export const searchView = (state, emit) => {
  const controller = new SearchController(state);

  if (!controller.state.done && controller.hasQuery) {
    controller.searchOpenLibrary(state.query.for).then(() => {
      emit('render');
    });
  }

  // Returning an array in a view allows non-shared parent HTML elements.
  // This one doesn't have the problem right now, but it's good to remember.
  return [
    html`<section>
      <h2 class="subtitle">An attempt at a viable alternative to Goodreads</h2>

      <article>
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