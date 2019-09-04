import html from 'choo/html';

import { homeView } from './home';

export const viewManager = (state, emit) => {
  // In viewManager all we are doing is checking the app's state
  // and passing the state and emit to the relevant view.
  let htmlContent = html`<div>loading</div>`;
  switch (state.currentView) {
    case 'home':
    default: {
      htmlContent = homeView(state, emit);
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