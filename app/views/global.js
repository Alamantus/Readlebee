import html from 'choo/html';

import headerImage from '../../dev/images/header.png';

export const globalView = (state, emit, view) => {
  const { i18n } = state;
  if (i18n.needsFetch) {
    return html`<body><i class="icon-loading animate-spin"></i></body>`;
  }
  // Create a wrapper for view content that includes global header/footer
  return html`<body>
  <header>
    <nav>
      <div class="brand">
        <a href="/">
          <span><img src=${headerImage} alt="Readlebee"></span>
        </a>
      </div>
    
      <!-- responsive-->
      <input id="navMenu" type="checkbox" class="show">
      <label for="navMenu" class="burger pseudo button">${'\u2261'}</label>
    
      <div class="menu">
        <a href="/search" class="pseudo button">
          <i class="icon-search" aria-labeledBy="searchLabel"></i> <span id="searchLabel">${i18n.__('global.menu_search')}</span>
        </a>
        <a href="/about" class="pseudo button">${i18n.__('global.menu_about')}</a>
        ${
          state.isLoggedIn === true
          ? [
            html`<a href="/shelves" class="pseudo button">${i18n.__('global.menu_shelves')}</a>`,
            html`<a href="/account" class="pseudo button">${i18n.__('global.menu_account')}</a>`,
            html`<a href="/logout" class="pseudo button">${i18n.__('global.menu_logout')}</a>`,
          ]
          : html`<a href="/login" class="pseudo button">${i18n.__('global.menu_login')}</a>`
        }
      </div>
    </nav>
  </header>

  <main class="container">
    ${view(state, emit, i18n)}
  </main>

  <footer>
    <nav class="flex one">
      <div class="two-third-600">
        <div class="links">
          <a href="https://gitlab.com/Alamantus/Readlebee" class="pseudo button">
            ${i18n.__('global.footer_repo')}
          </a>
          <a href="https://gitter.im/Readlebee/community" class="pseudo button">
            ${i18n.__('global.footer_chat')}
          </a>
        </div>
      </div>
      <div class="third-600">
        <label class="flex">
          <span class="third">${i18n.__('global.change_language')}:</span>
          <select class="two-third" onchange=${e => emit('set-language', e.target.value)}>
            ${i18n.availableLanguages.map(language => {
              return html`<option value=${language.locale} ${state.language === language.locale ? 'selected' : null}>
                ${language.name}
              </option>`;
            })}
          </select>
        </label>
      </div>
    </nav>
  </footer>
</body>`;
}