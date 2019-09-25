import { globalView } from './views/global';
import { homeView } from './views/home';
import { loginView } from './views/login';
import { searchView } from './views/search';
import { errorView } from './views/404';

export const appRoutes = (app) => {
  app.route('/', (state, emit) => globalView(state, emit, homeView));

  app.route('/login', (state, emit) => globalView(state, emit, loginView));

  app.route('/search', (state, emit) => globalView(state, emit, searchView));

  app.route('/404', (state, emit) => globalView(state, emit, errorView));
}
