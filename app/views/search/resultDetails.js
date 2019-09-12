import html from 'choo/html';

import { starRating } from '../partials/starRating';
import { modal } from '../partials/modal';

export const resultDetails = (searchController, result, emit = () => {}) => {
  const { i18n } = searchController;
  const modalId = `result_${result.uri}`;

  const buttonHTML = html`<label for=${modalId} class="pseudo button">
    <span data-tooltip="${i18n.__('interaction.average_rating')}: ${result.averageRating}">
      ${starRating(result.averageRating)}
    </span>  
    <span style="margin-left:10px;" data-tooltip=${i18n.__('interaction.reviews_written')}>
      <span style="margin-right:8px;"><i class="icon-chat"></i></span>
      <span>${result.numberOfReviews}</span>
    </span>
  </label>`;
  
  const tabNames = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
  
  const modalContent = html`<article class="flex">
    <div class="sixth-700" style="text-align:center;">
      <h4>Covers</h4>
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
      <h4>${i18n.__('interaction.average_rating')}</h4>
      <span data-tooltip="${result.averageRating}">${starRating(result.averageRating)}</span>

      <div class="flex">
        <div>
          <h4>Top Reviews</h4>
        </div>
        <div>
          <a href="/book/${result.uri}" class="small button">
            <span style="margin-right:8px;"><i class="icon-chat"></i></span>
            <span>${result.numberOfReviews}</span>
            <span>${i18n.__('search.see_interaction_details')}</span>
          </a>
        </div>
      </div>
      ${result.reviews.map(review => {
        return html`<article class="card">
          <header style="font-weight:normal;">
            <strong>${review.reviewer.name}</strong> <em>${review.reviewer.handle}</em><br>
            ${review.date} ${starRating(Math.ceil(review.rating))}
          </header>
          <footer>
            <div class="content">
              <p>
                ${review.review}
              </p>
            </div>
            <span class="tooltip-top" data-tooltip=${i18n.__('interaction.heart')}>
              <button class="pseudo">
                <i class="icon-heart-outline"></i>
              </button>
            </span>
            <span>
              ${review.hearts}
            </span>
          </footer>
        </article>`;
      })}
    </div>
    <div class="sixth-700">
      <p>
        <span data-tooltip=${i18n.__('interaction.add')}>
          <button class="success">
            <i class="icon-plus"></i>
          </button>
        </span>
      </p>
      <p>
        <span data-tooltip=${i18n.__('search.see_details_tooltip')}>
          <a class="small pseudo button" href=${result.link} target="_blank">
            ${i18n.__('search.see_book_details')}
          </a>
        </span>
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