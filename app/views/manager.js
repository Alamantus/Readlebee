import html from 'choo/html';

import { homeView } from './home';
import { searchView } from './search';

export const viewManager = (state, emit) => {
  // In viewManager all we are doing is checking the app's state
  // and passing the state and emit to the relevant view.
  let htmlContent = html`<div>loading</div>`;
  switch (state.params.page) {
    case 'home':
    default: {
      htmlContent = homeView(state, emit);
      break;
    }
    case 'login': {
      htmlContent = loginView(state, emit);
      break;
    }
    case 'search': {
      htmlContent = searchView(state, emit);
      break;
    }
  }

  // Create a wrapper for view content that includes global header/footer
  let view = html`<body>
  <header>
    <nav>
      <div class="brand">
        <a href="/">
          <span class="title">Unnamed Book Tracker</span>
        </a>
      </div>
    
      <!-- responsive-->
      <input id="navMenu" type="checkbox" class="show">
      <label for="navMenu" class="burger pseudo button">&#8801;</label>
    
      <div class="menu">
        <label style="display: inline-block;">
          <input type="text" name="search" placeholder="Search" onchange=${e => {
            console.log(encodeURIComponent(e.target.value.trim()));
            emit('pushState', '/search?for=' + encodeURIComponent(e.target.value.trim()));
          }}>
        </label>
        <a href="/login" class="pseudo button">Log In</a>
        <a href="/logout" class="pseudo button">Log Out</a>
      </div>
    </nav>
  </header>

  <main class="container">
    ${htmlContent}
  </main>

  <footer>
    <nav>
      <div class="links">
        <a href="https://gitlab.com/Alamantus/book-tracker" class="pseudo button">Repo</a>
        <a href="https://gitter.im/book-tracker/general" class="pseudo button">Chat</a>
      </div>
    </nav>
  </footer>
</body>`;

  return view;
}