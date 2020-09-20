const { globalView } = require('./views/global');
const { homeView } = require('./views/home');
const { aboutView } = require('./views/about');
const { loginView } = require('./views/login');
const { searchView } = require('./views/search');
const { shelvesView } = require('./views/shelves');
const { errorView } = require('./views/404');

const appRoutes = (app) => {
  app.route('/', (state, emit) => globalView(state, emit, homeView));

  app.route('/about', (state, emit) => globalView(state, emit, aboutView));

  app.route('/login', (state, emit) => globalView(state, emit, loginView));

  app.route('/logout', () => window.location.reload());  // If Choo navigates here, refresh the page instead so the server can handle it and log out

  app.route('/search', (state, emit) => globalView(state, emit, searchView));

  app.route('/shelves', (state, emit) => globalView(state, emit, shelvesView));

  app.route('/404', (state, emit) => globalView(state, emit, errorView));
}

module.exports = { appRoutes };
