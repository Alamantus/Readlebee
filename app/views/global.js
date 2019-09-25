import html from 'choo/html';

import headerImage from '../../dev/images/header.png';

export const globalView = (state, emit, view) => {
  const { i18n } = state;
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
        <a href="/search" class="pseudo button"><i class="icon-search" aria-label=${i18n.__('global.menu_search')}></i></a>
        <a href="/login" class="pseudo button">${i18n.__('global.menu_login')}</a>
        <a href="/logout" class="pseudo button">${i18n.__('global.menu_logout')}</a>
      </div>
    </nav>
  </header>

  <main class="container">
    ${view(state, emit, i18n)}
  </main>

  <footer>
    <nav>
      <div class="links">
        <a href="https://gitlab.com/Alamantus/Readlebee" class="pseudo button">
          ${i18n.__('global.footer_repo')}
        </a>
        <a href="https://gitter.im/Readlebee/community" class="pseudo button">
          ${i18n.__('global.footer_chat')}
        </a>
      </div>
    </nav>
  </footer>
</body>`;
}