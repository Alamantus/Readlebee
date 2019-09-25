import { I18n } from './i18n';
import { globalView } from './views/global';
import { homeView } from './views/home';
import { loginView } from './views/login';
import { searchView } from './views/search';
import { errorView } from './views/404';

export const appRoutes = (app) => {
  const i18n = new I18n(app.state); // Global I18n class passed to all views

  app.route('/', (state, emit) => globalView(state, emit, i18n, homeView));

  app.route('/login', (state, emit) => globalView(state, emit, i18n, loginView));

  app.route('/search', (state, emit) => globalView(state, emit, i18n, searchView));

  app.route('/404', (state, emit) => globalView(state, emit, i18n, errorView));
}
