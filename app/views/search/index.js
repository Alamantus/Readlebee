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
      <h1 class="title">${i18n.__('search.header')}</h1>

      <article>
        ${controller.doneSearching ? null : html`<h2><i class="icon-loading animate-spin"></i></h2>`}

        ${controller.results.works < 1
        ? null
        : [
          html`<h2>${i18n.__('search.books_header')}</h2>`,
          controller.results.works.map(result => {
            return html`<div class="flex search-result">
              <div class="sixth-500">
                ${result.image ? html`<img src=${result.image.url} class="search-image">` : null}
              </div>
              <div class="half-500">
                <h3 class="title">${result.name}</h3>
                ${result.description ? html`<h4 class="subtitle">${result.description}</h4>` : null}
                <span data-tooltip=${i18n.__('interaction.heart')}>
                  <button class="pseudo">
                    <i class="pseudo icon-heart-outline"></i>
                  </button>
                </span>
                <span data-tooltip=${i18n.__('interaction.add')}>
                  <button class="pseudo">
                    <i class="pseudo icon-plus"></i>
                  </button>
                </span>
              </div>
              <div class="third-500">
                <a class="small pseudo button" href=${result.link} target="_blank">See details on Inventaire</a>
              </div>
            </div>`;
          }),
        ]}

        ${controller.results.series.length < 1
        ? null
        : [
          html`<h2>${i18n.__('search.series_header')}</h2>`,
          controller.results.series.map(result => {
            return html`<div class="flex search-result">
              <div class="sixth-500">
                ${result.image ? html`<img src=${result.image.url} class="search-image">` : null}
              </div>
              <div class="half-500">
                <h3 class="title">${result.name}</h3>
                ${result.description ? html`<h4 class="subtitle">${result.description}</h4>` : null}
              </div>
              <div class="third-500">
                <a href=${result.link} target="_blank">See details on Inventaire</a>
              </div>
            </div>`;
          }),
        ]}

        ${controller.results.humans.length < 1
        ? null
        : [
          html`<h2>${i18n.__('search.people_header')}</h2>`,
          controller.results.humans.map(result => {
            return html`<div class="flex search-result">
              <div class="sixth-500">
                ${result.image ? html`<img src=${result.image.url} class="search-image">` : null}
              </div>
              <div class="half-500">
                <h3 class="title">${result.name}</h3>
                ${result.description ? html`<h4 class="subtitle">${result.description}</h4>` : null}
              </div>
              <div class="third-500">
                <a href=${result.link} target="_blank">See details on Inventaire</a>
              </div>
            </div>`;
          }),
        ]}
      </article>
    </section>`,
  ];
}