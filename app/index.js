import 'babel-polyfill';

import choo from 'choo';

import config from './config.json';
import { appRoutes } from './appRoutes';
import { appListeners } from './appListeners';
import { appState } from './appState.js';
import { appUtilities } from './appUtilities.js';

const app = choo();

if (process.env.NODE_ENV !== 'production') {
  // Only runs in development and will be stripped from production build.
  app.use(require('choo-devtools')());  // Exposes `choo` to the console for debugging!
}

app.use((state, emitter) => {
  app.siteConfig = config;
  appUtilities(app);
});

app.use((state, emitter) => {
  appState(app, state);

  // Listeners
  appListeners(app, state, emitter);
});

// Routes
appRoutes(app);

app.mount('body');  // Overwrite the `<body>` tag with the content of the Choo app
