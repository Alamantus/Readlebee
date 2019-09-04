import html from 'choo/html';

import { homeView } from './home';
import { searchView } from './search';

export const viewManager = (state, emit) => {
  // In viewManager all we are doing is checking the app's state
  // and passing the state and emit to the relevant view.
  let htmlContent = html`<div>loading</div>`;
  if (state.query.hasOwnProperty('search')) {
    state.currentView = 'search'; // Override view if there's a search query
  }
  switch (state.currentView) {
    case 'home':
    default: {
      htmlContent = homeView(state, emit);
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
        <a href="./">
          <h1>Unnamed Book Tracker</h1>
        </a>
      </div>
    
      <!-- responsive-->
      <input id="navMenu" type="checkbox" class="show">
      <label for="navMenu" class="burger pseudo button">&#8801;</label>
    
      <div class="menu">
        <form method="GET" style="display:inline-block;">
          <label>
            <input type="text" name="search" placeholder="Search">
          </label>
        </form>
        <a href="https://gitlab.com/Alamantus/book-tracker" class="pseudo button">Repo</a>
        <a href="https://gitter.im/book-tracker/general" class="pseudo button">Chat</a>
      </div>
    </nav>
  </header>

  <main class="container">
    ${htmlContent}
  </main>
</body>`;

  return view;
}