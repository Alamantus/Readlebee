const html = require('choo/html');

const starRating = (rating) => {
  const wholeStars = Math.floor(rating);
  const hasPartial = rating - wholeStars > 0;
  const emptyStars = 5 - wholeStars - (hasPartial ? 1 : 0);
  const stars = [];
  for (let i = 0; i < wholeStars; i++) {
    stars.push(html`<i class="icon-star"></i>`);
  }
  if (hasPartial) {
    stars.push(html`<i class="icon-star-half"></i>`);
  }
  for (let i = 0; i < emptyStars; i++) {
    stars.push(html`<i class="icon-star-empty"></i>`);
  }

  return stars;
}

module.exports = { starRating };
