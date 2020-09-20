const html = require('choo/html');

const errorView = (state, emit, i18n) => {
  return html`<section class="error card">
    <header>
      <h1>${i18n.__('404.header')}</h1>
    </header>
    <footer>
      <h2>${i18n.__('404.subheader')}</h2>
    </footer>
  </section>`;
}

module.exports = { errorView };
