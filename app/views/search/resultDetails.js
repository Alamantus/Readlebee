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
  
  const modalContent = html`<article class="flex">
    <div class="sixth-700" style="text-align:center;">
      <h4>Covers</h4>
      <span style="font-size:3em;"><i class="icon-loading animate-spin"></i></span>
    </div>
    <div class="two-third-700">
      <h4>${i18n.__('interaction.average_rating')}</h4>
      <span data-tooltip="${result.rating}">${starRating(result.rating)}</span>

      <div class="flex">
        <div>
          <h4>Top Reviews</h4>
        </div>
        <div>
          <a href="/book/${result.uri}" class="small button">
            <span style="margin-right:8px;"><i class="icon-chat"></i></span>
            <span>${result.reviewCount}</span>
            <span>${i18n.__('search.see_interaction_details')}</span>
          </a>
        </div>
      </div>
      <article class="card">
        <header>
          {{USERNAME}} ${starRating(Math.ceil(result.rating))}
        </header>
        <footer>
          <div class="content">
            <p>
              The only thing worse than yellow snow is green snow. Let's put a touch more of the magic here.
              With practice comes confidence. You have to allow the paint to break to make it beautiful.
            </p>
            <p>
              Let all these little things happen. Don't fight them. Learn to use them. Imagination is the key
              to painting. You can't make a mistake. Anything that happens you can learn to use - and make
              something beautiful out of it. This is a fantastic little painting. In painting, you have unlimited
              power. You have the ability to move mountains. We don't have anything but happy trees here.
            </p>
            <p>
              If what you're doing doesn't make you happy - you're doing the wrong thing. A fan brush can be
              your best friend. Mountains are so simple, they're hard.
            </p>
          </div>
          <span class="tooltip-top" data-tooltip=${i18n.__('interaction.heart')}>
            <button class="pseudo">
              <i class="icon-heart-outline"></i>
            </button>
          </span>
          <span>
            ${result.reviewCount}
          </span>
        </footer>
      </article>
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
  });
}