import html from 'choo/html';

import { starRating } from '../partials/starRating';
import { modal } from '../partials/modal';

export const resultDetails = (searchController, result) => {
  const { i18n } = searchController;
  const modalId = `result_${result.uri}`;

  const buttonHTML = html`<label for=${modalId} class="pseudo button">
    <span data-tooltip="${i18n.__('interaction.average_rating')}: ${result.rating}">
      ${starRating(result.rating)}
    </span>  
    <span style="margin-left:10px;" data-tooltip=${i18n.__('interaction.reviews_written')}>
      <span style="margin-right:8px;"><i class="icon-chat"></i></span>
      <span>${result.reviewCount}</span>
    </span>
  </label>`;
  
  const modalContent = html`<article>
    <span class="tooltip-left" data-tooltip=${i18n.__('search.see_details_tooltip')}>
      <a class="small pseudo button" href=${result.link} target="_blank">
        ${i18n.__('search.see_details')}
      </a>
    </span>
  </article>`;
  
  return modal(modalId, searchController, modalContent, {
    buttonHTML, // This should be replaced with buttonHTML containing the ratings and number of reviews etc.
    headerText: result.name,
  });
}