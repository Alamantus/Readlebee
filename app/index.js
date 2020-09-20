require('babel-polyfill');

const choo = require('choo');

const config = require('./config.json');
const { appRoutes } = require('./appRoutes');
const { appListeners } = require('./appListeners');
const { appState } = require('./appState.js');
const { appUtilities } = require('./appUtilities.js');

function frontend() {
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

  return app;
}

if (typeof window !== 'undefined') {
  frontend();
}

module.exports = frontend;
