import html from 'choo/html';

import { SearchController } from './controller';  // The controller for this view, where processing should happen.
import { resultDetails } from './resultDetails';

// This is the view function that is exported and used in the view manager.
export const searchView = (state, emit, i18n) => {
  const controller = new SearchController(state, emit, i18n);
  const { __ } = controller.i18n;

  if (controller.state.lastSearch !== state.query.for) {
    controller.search();
  }

  // Returning an array in a view allows non-shared parent HTML elements.
  // This one doesn't have the problem right now, but it's good to remember.
  return [
    html`<section>
      <h1 class="title">${__('search.header')}</h1>
      
      <article>
        <div class="flex">
          <div class="two-third-700">
            <h2>
              ${controller.doneSearching
                ? html`<span>${__('search.results_header')}</span> <code>${controller.state.lastSearch}</code>`
                : html`<span>${__('search.loading')}</span>`
              }
            </h2>
          </div>
          <div class="one-third-700">
          ${controller.doneSearching
            ? html`<span class="pull-right" data-tooltip=${__('interaction.reload')}>
              <button class="pseudo" onclick=${() => controller.search()}>
                <i class="icon-reload"></i>
              </button>
            </span>`
            : html`<i class="icon-loading animate-spin"></i>`
          }
          </div>
        </div>

        ${!controller.doneSearching || controller.results.works < 1
          ? [
            html`<h3>${__('search.no_results')}</h3>`,
            html`<a class="button" href="https://wiki.inventaire.io/wiki/How-to-contribute" target="_blank">
              ${__('search.no_results_suggestion')}
            </a>`
          ]
          : controller.results.works.map(result => {
            return html`<div class="flex search-result">
              <div class="two-third-800 half-500">
                <h3 class="title">${result.name}</h3>
                ${result.description ? html`<h4 class="subtitle">${result.description}</h4>` : null}
              </div>
              <div class="third-800 half-500">
                ${resultDetails(controller, result, emit)}
              </div>
            </div>`;
          })
        }
      </article>
    </section>`,
  ];
}