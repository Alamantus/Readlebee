import html from 'choo/html';

import headerImage from '../../dev/images/header.png';

import { I18n } from '../i18n';
import { homeView } from './home';
import { loginView } from './login';
import { searchView } from './search';

export const viewManager = (state, emit) => {
  const i18n = new I18n(state); // Global I18n class passed to all views
  // In viewManager all we are doing is checking the app's state
  // and passing the state and emit to the relevant view.
  let htmlContent = html`<div>loading</div>`;
  switch (state.params.page) {
    case 'home':
    default: {
      htmlContent = homeView(state, emit, i18n);
      break;
    }
    case 'login': {
      htmlContent = loginView(state, emit, i18n);
      break;
    }
    case 'search': {
      htmlContent = searchView(state, emit, i18n);
      break;
    }
  }

  // Create a wrapper for view content that includes global header/footer
  let view = html`<body>
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
        <label style="display: inline-block;">
          <input type="text" name="search"
            placeholder=${i18n.__('global.searchbar_placeholder')}
            onchange=${e => {
              emit('pushState', '/search?for=' + encodeURIComponent(e.target.value.trim()));
            }}
          >
        </label>
        <a href="/login" class="pseudo button">${i18n.__('global.menu_login')}</a>
        <a href="/logout" class="pseudo button">${i18n.__('global.menu_logout')}</a>
      </div>
    </nav>
  </header>

  <main class="container">
    ${htmlContent}
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

  return view;
}