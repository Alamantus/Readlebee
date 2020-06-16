import html from 'choo/html';

import { reviewCard } from '../partials/reviewCard';
import { starRating } from '../partials/starRating';
import { modal } from '../partials/modal';

export const resultDetails = (searchController, result, emit = () => {}) => {
  const { __ } = searchController.i18n;
  const modalId = `result_${result.uri}`;

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
  
  const tabNames = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
  
  const modalContent = html`<article class="flex">
    <div class="sixth-700" style="text-align:center;">
      <h4>${__('search.covers')}</h4>
      ${typeof result.covers === 'undefined'
        ? html`<span style="font-size:3em;"><i class="icon-loading animate-spin"></i></span>`
        : html`<div class="tabs ${typeof tabNames[result.covers.length - 1] !== 'undefined' ? tabNames[result.covers.length - 1] : null}">
          ${result.covers.map((cover, index) => {
            return [
              html`<input id="cover_${cover.uri}" type="radio" name="${modalId}_covers" ${index === 0 ? 'checked' : null} />`,
              // html`<label class="small pseudo button toggle" for="cover_${cover.uri}">•</label>`,
            ];
          })}
          <div class="row">
          ${result.covers.map((cover, index, allCovers) => {
            return html`<div>
              <img src=${cover.url} alt="${cover.uri.replace(':', ' ').toUpperCase()}, Published: ${cover.publishDate}">
              ${typeof allCovers[index - 1] === 'undefined'
                ? null
                : html`<label class="button" for="cover_${allCovers[index - 1].uri}" style="margin-right:8px;">
                  ${'<'}
                </label>`
              }
              ${typeof allCovers[index + 1] === 'undefined'
                ? null
                : html`<label class="button" for="cover_${allCovers[index + 1].uri}">
                  ${'>'}
                </label>`
              }
            </div>`;
          })}
          </div>
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
            <a href="/book/${result.uri}" class="small button">
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
        return html`<li><a href="javascript:void(0)">${shelf.name}</a></li>`;
      })}</ul>`}
      <p>
        <a class="small button" href=${result.link} target="_blank">
          ${__('search.see_book_details')}
        </a>
      </p>
    </div>
  </article>`;
  
  return modal(modalId, searchController, modalContent, {
    styles: "width:90%;",
    buttonHTML, // This should be replaced with buttonHTML containing the ratings and number of reviews etc.
    headerText: result.name,
    onShow: () => {
      if (typeof result.covers === 'undefined') {
        searchController.getCovers(result.uri).then(() => emit('render'));
      }
    },
  });
}