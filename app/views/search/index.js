import html from 'choo/html';

import { SearchController } from './controller';  // The controller for this view, where processing should happen.
import { resultDetails } from './resultDetails';
import { modal } from '../partials/modal';

// This is the view function that is exported and used in the view manager.
export const searchView = (state, emit, i18n) => {
  const controller = new SearchController(state, emit, i18n);
  const { __ } = controller.i18n;

  if (controller.hasQuery && controller.queryIsNew) {
    controller.search();
  } else if (controller.state.lastSearch !== '') {
    controller.appState.query.for = controller.state.lastSearch;
  }

  // Returning an array in a view allows non-shared parent HTML elements.
  // This one doesn't have the problem right now, but it's good to remember.
  return [
    html`<h1 class="title">${__('search.header')}</h1>`,

    html`<section class="flex">
        <label class="three-fourth">
          <input type="text" name="search"
            aria-label=${i18n.__('search.placeholder')}
            placeholder=${i18n.__('search.placeholder')}
            value=${controller.state.lastSearch}
            onchange=${e => {
              emit('pushState', '/search?for=' + encodeURIComponent(e.target.value.trim()));
            }}
            ${!controller.doneSearching ? 'disabled' : null}
          >
        </label>
        <button class="fourth" style="margin-top:0;height:2.1em;"
          onclick=${() => emit('pushState', '/search?for=' + encodeURIComponent(controller.appState.query.for))}
          ${!controller.doneSearching ? 'disabled' : null}
        >
          ${!controller.doneSearching
            ? html`<i class="icon-loading animate-spin"></i>`
            : __('search.button_text')
          }
        </button>
      </section>`,

    // Search Options Section
    html`<section>
      <header class="flex two four-800">
        <div>
          <h3>Search Options</h3>
        </div>
        <div>
          <button class="pseudo" onclick=${() => {
            controller.state.expandSearchOptions = !controller.state.expandSearchOptions;
            emit('render');
          }}>
            ${controller.state.expandSearchOptions !== true ? '+ Expand' : '- Collapse'}
          </button>
        </div>
      </header>
      <footer class="flex one two-700" ${controller.state.expandSearchOptions !== true ? 'hidden' : null}>
        <div>
          ${modal('searchSourceInfo', controller, [
            html`<p>
              This refers to where the search tries to look for data.
            </p>`,
            html`<ul>
              <li>
                <a href="https://inventaire.io" target="_blank">
                  Inventaire
                </a>
              </li>
              <li>
                <a href="https://openlibrary.org" target="_blank">
                  Open Library
                </a>
              </li>
              <li>
                <a href="https://bookbrainz.org/" target="_blank">
                  BoookBrainz
                </a>
              </li>
            </ul>`,
          ], {
            buttonText: 'What\'s This?',
            buttonClasses: 'small marginless pseudo button pull-right',
            headerText: 'What does "Search Source" mean?',
          })}
          <label>
            Search Source
            <select onchange=${event => {
              controller.state.searchSource = event.target.value;
            }}>
              <option value="inventaire" ${controller.state.searchSource === 'inventaire' ? 'selected' : null}>
                Inventaire
              </option>
              <option value="openLibrary" ${controller.state.searchSource === 'openLibrary' ? 'selected' : null}>
                Open Library
              </option>
              <option value="bookBrainz" ${controller.state.searchSource === 'bookBrainz' ? 'selected' : null}>
                BookBrainz
              </option>
            </select>
          </label>
        </div>
        <div>
            Search By<br>
            <label>
              <input type="radio" name="searchBy" value="title"
                ${controller.state.searchBy === 'title' ? 'checked' : null}
                onchange=${(event) => {
                  if (event.target.checked) {
                    controller.state.searchBy = event.target.value;
                  }
                }}
              >
              <span class="checkable">Title</span>
            </label>
            <label>
              <input type="radio" name="searchBy" value="author"
                ${controller.state.searchBy === 'author' ? 'checked' : null}
                onchange=${(event) => {
                  if (event.target.checked) {
                    controller.state.searchBy = event.target.value;
                  }
                }}
              >
              <span class="checkable">Author</span>
            </label>
        </div>
      </footer>
    </section>`,
      
    // Search Results section
    html`<section>
      <h2>
        ${controller.hasQuery && !controller.doneSearching
          ? html`<span>${__('search.loading')}</span> <i class="icon-loading animate-spin"></i>`
          : null
        }
      </h2>

      ${controller.hasQuery && controller.doneSearching && controller.results < 1
        ? [
          html`<h3>${__('search.no_results')}</h3>`,
          html`<a class="button" href="https://wiki.inventaire.io/wiki/How-to-contribute" target="_blank">
            ${__('search.no_results_suggestion')}
          </a>`
        ]
        : controller.results.map(result => {
          return html`<article class="flex search-result">
            <header class="two-third-800 half-500">
              <h3 class="title">${result.name}</h3>
              ${result.description ? html`<h4 class="subtitle">${result.description}</h4>` : null}
            </header>
            <footer class="third-800 half-500">
              ${resultDetails(controller, result, emit)}
            </footer>
          </article>`;
        })
      }
    </section>`,
  ];
}