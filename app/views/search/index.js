import html from 'choo/html';

import { SearchController } from './controller';  // The controller for this view, where processing should happen.
import { resultDetails } from './resultDetails';

// This is the view function that is exported and used in the view manager.
export const searchView = (state, emit) => {
  const controller = new SearchController(state);
  const { i18n } = controller;

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
              <div class="two-third-800 half-500">
                <h3 class="title">${result.name}</h3>
                ${result.description ? html`<h4 class="subtitle">${result.description}</h4>` : null}
              </div>
              <div class="third-800 half-500">
                ${resultDetails(controller, result, emit)}
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
              <div class="two-third-800 half-500">
                <h3 class="title">${result.name}</h3>
                ${result.description ? html`<h4 class="subtitle">${result.description}</h4>` : null}
              </div>
              <div class="third-800 half-500">
                <span class="tooltip-left" data-tooltip=${i18n.__('search.see_details_tooltip')}>
                  <a class="small pseudo button" href=${result.link} target="_blank">
                    ${i18n.__('search.see_inventaire_details')}
                  </a>
                </span>
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
              <div class="sixth">
                ${result.image ? html`<img src=${result.image.url} class="search-image">` : null}
              </div>
              <div class="half-800 two-third">
                <h3 class="title">${result.name}</h3>
                ${result.description ? html`<h4 class="subtitle">${result.description}</h4>` : null}
              </div>
              <div class="third-800">
                <span class="tooltip-left" data-tooltip=${i18n.__('search.see_details_tooltip')}>
                  <a class="small pseudo button" href=${result.link} target="_blank">
                    ${i18n.__('search.see_inventaire_details')}
                  </a>
                </span>
              </div>
            </div>`;
          }),
        ]}
      </article>
    </section>`,
  ];
}