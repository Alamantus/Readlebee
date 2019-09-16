import html from 'choo/html';

import { starRating } from './starRating';

export const reviewCard = (controller, review) => {
  const { __ } = controller.i18n;

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
      <span class="tooltip-top" data-tooltip=${__('interaction.heart')}>
        <button class="pseudo">
          <i class="icon-heart-outline"></i>
        </button>
      </span>
      <span>
        ${review.hearts}
      </span>
    </footer>
  </article>`;
}