const html = require('choo/html');

const { reviewCard } = require('../partials/reviewCard');
const { starRating } = require('../partials/starRating');
const { modal } = require('../partials/modal');

const resultDetails = (searchController, result, emit = () => {}) => {
  const { __ } = searchController.i18n;
  const source = result.sources[0];
  const modalId = `result_${source.uri}`;

  const hasReviews = typeof result.averageRating !== 'undefined' && typeof result.numberOfReviews !== 'undefined';

  const buttonHTML = html`<label for=${modalId} class="pseudo button">
    ${!hasReviews
      ? __('search.no_reviews')
      : html`<span data-tooltip="${__('interaction.average_rating')}: ${result.averageRating}">
        ${starRating(result.averageRating)}
      </span>  
      <span style="margin-left:10px;" data-tooltip=${__('interaction.reviews_written')}>
        <span style="margin-right:8px;"><i class="icon-chat"></i></span>
        <span>${result.numberOfReviews}</span>
      </span>`
    }
    <br />
    <small>${__('search.click_for_details')}</small>
  </label>`;
  
  const coversHTMLArray = result.covers.map((cover, index, allCovers) => {
    return html`<div>
        <img src=${cover.url} alt="${cover.sourceId.replace(':', ' ').toUpperCase()}, Published: ${cover.publishDate}">
        ${typeof allCovers[index - 1] === 'undefined'
        ? null
        : html`<label class="button" for="cover_${allCovers[index - 1].sourceId}" style="margin-right:8px;" aria-label="View Previous Cover">
            ${'<'}
          </label>`
      }
        ${typeof allCovers[index + 1] === 'undefined'
        ? null
        : html`<label class="button" for="cover_${allCovers[index + 1].sourceId}" aria-label="View Next Cover">
            ${'>'}
          </label>`
      }
      </div>`;
  });
  
  const modalContent = html`<article class="flex">
    <div class="sixth-700" style="text-align:center;">
      <h4>${__('search.covers')}</h4>
      ${typeof result.covers === 'undefined'
        ? html`<span style="font-size:3em;"><i class="icon-loading animate-spin"></i></span>`
        : html`<div class="tabs ${result.covers.length}">
          ${result.covers.map((cover, index) => {
            return [
              html`<input id="cover_${cover.sourceId}" type="radio" name="${modalId}_covers" ${index === 0 ? 'checked' : null} aria-hidden="true" />`,
              // html`<label class="small pseudo button toggle" for="cover_${cover.sourceId}">•</label>`,
            ];
          })}
          <div class="row" id="covers_${modalId}">${
            searchController.openModal === modalId
            ? coversHTMLArray
            : '' /* Leave the covers column empty until opened to prevent loading too many images */
          }</div>
        </div>`
      }
    </div>
    <div class="two-third-700">
      ${!hasReviews
        ? html`<h4>${__('search.no_reviews')}</h4>`
        : html`<h4>${__('interaction.average_rating')}</h4>
        <span data-tooltip="${result.averageRating}">${starRating(result.averageRating)}</span>

        <div class="flex">
          <div>
            <h4>Top Reviews</h4>
          </div>
          <div>
            <a href="/book/${source.uri}" class="small button">
              <span style="margin-right:8px;"><i class="icon-chat"></i></span>
              <span>${result.numberOfReviews}</span>
              <span>${__('search.see_interaction_details')}</span>
            </a>
          </div>
        </div>
        ${(typeof result.reviews !== 'undefined' && Array.isArray(result.reviews) ? result.reviews : []).map(review => {
          return reviewCard(searchController, review);
        })}`
      }
    </div>
    <div class="sixth-700">
      <p>
        <button class="success" onclick=${() => searchController.showShelves()}>
          <i class="icon-plus"></i> <span>${__('interaction.add')}</span>
        </button>
      </p>
      ${!searchController.showShelves ? null : html`<ul>${searchController.shelves.map(shelf => {
        return html`<li>
          <button class="pseudo" onclick=${() => searchController.addToShelf({ id: result.id, ...source }, shelf.id)}>
            ${shelf.name}
          </button>
        </li>`;
      })}</ul>`}
      <p>
        <a class="small button" href=${source.link} target="_blank">
          ${__('search.see_book_details')}
        </a>
      </p>
    </div>
  </article>`;
  
  const onShow = () => {
    const coversColumn = document.getElementById(`covers_${modalId}`);
    coversColumn.innerHTML = '';
    coversHTMLArray.forEach(element => coversColumn.appendChild(element));
  };
  
  return modal(modalId, searchController, modalContent, {
    styles: "width:90%;",
    buttonHTML, // This should be replaced with buttonHTML containing the ratings and number of reviews etc.
    headerText: result.name,
    onShow,
  });
}

module.exports = { resultDetails };
