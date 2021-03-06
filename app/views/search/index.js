const html = require('choo/html');

const { SearchController } = require('./controller');  // The controller for this view, where processing should happen.
const { resultDetails } = require('./resultDetails');
const { modal } = require('../partials/modal');

// This is the view function that is exported and used in the view manager.
const searchView = (state, emit, i18n) => {
  const controller = new SearchController(state, emit, i18n);
  const { __ } = controller.i18n;

  if (controller.hasQuery && controller.queryIsNew) {
    controller.search();
  } else if (controller.state.lastSearch !== '') {
    controller.appState.query.for = controller.state.lastSearch;
  }

  // Returning an array in a view allows non-shared parent HTML elements.
  return [
    html`<style>${controller.generateTabsCSS()}</style>`,
    
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
    html`<section class="flex one two-700">
      ${/*<div>
        ${modal('searchSourceInfo', controller, [
          html`<p>
            ${__('search.search_source.help.text')}
          </p>`,
          html`<ul>
            <li>
              <a href="https://inventaire.io" target="_blank">
                Inventaire
              </a>
              <ul>
                <li>
                  ${__('search.search_source.help.inventaire')}
                </li>
              </ul>
            </li>
            <li>
              <a href="https://openlibrary.org" target="_blank">
                Open Library
              </a>
              <ul>
                <li>
                  ${__('search.search_source.help.openLibrary')}
                </li>
              </ul>
            </li>
          </ul>`,
        ], {
          buttonText: __('search.search_source.help.button'),
          buttonClasses: 'small marginless pseudo button pull-right',
          headerText: __('search.search_source.help.header'),
        })}
        <label>
          ${__('search.search_source.label')}

          <select onchange=${event => {
            controller.state.searchSource = event.target.value;
          }}>
            <option value="inventaire" ${controller.state.searchSource === 'inventaire' ? 'selected' : null}>
              Inventaire
            </option>
            <option value="openLibrary" ${controller.state.searchSource === 'openLibrary' ? 'selected' : null}>
              Open Library
            </option>
          </select>
        </label>
      </div>*/'' // Temporarily comment out the source chooser so I can focus on just Inventaire
      }
      <div>
          ${__('search.search_by.label')}<br>

          <label>
            <input type="radio" name="searchBy" value="title"
              ${controller.state.searchBy === 'title' ? 'checked' : null}
              onchange=${(event) => {
                if (event.target.checked) {
                  controller.state.searchBy = event.target.value;
                }
              }}
            >
            <span class="checkable">
              ${__('search.search_by.title')}
            </span>
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
            <span class="checkable">
              ${__('search.search_by.author')}
            </span>
          </label>
      </div>
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

module.exports = { searchView };
