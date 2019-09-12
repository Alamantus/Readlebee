import html from 'choo/html';

import { modal } from '../partials/modal';

export const resultDetails = (searchController, result, buttonHTML) => {
  const { i18n } = searchController;
  const modalId = `result_${result.uri}}`;
  const modalContent = html`<article>
    <span class="tooltip-left" data-tooltip=${i18n.__('search.see_details_tooltip')}>
      <a class="small pseudo button" href=${result.link} target="_blank">
        ${i18n.__('search.see_details')}
      </a>
    </span>
  </article>`;
  
  return modal(modalId, searchController, modalContent, {
    buttonText: i18n.__('search.see_details'), // This should be replaced with buttonHTML containing the ratings and number of reviews etc.
    headerText: result.name,
  });
}