import choo from 'choo';

import config from './config.json';
import { viewManager } from './views/manager';

const app = choo();

if (process.env.NODE_ENV !== 'production') {
  // Only runs in development and will be stripped from production build.
  app.use(require('choo-devtools')());  // Exposes `choo` to the console for debugging!
}

// App state and emitters
app.use((state, emitter) => {
  // Default state variables
  state.currentView = 'home';
  state.viewStates = {};

  // Listeners
  emitter.on('DOMContentLoaded', () => {
    document.title = config.siteName;
    // Emitter listeners
    emitter.on('render', callback => {
      // This is a dirty hack to get the callback to call *after* re-rendering.
      if (callback && typeof callback === "function") {
        setTimeout(() => {
          callback();
        }, 50);
      }
    });

    emitter.on('change-view', newView => {
      // Change the view and call render. Makes it easier to call within views.
      state.currentView = newView;
      emitter.emit('render', () => {});
    });
  });
});

// For the main screen, pass the viewManager function in viewManager.js,
// which is given the app's state from above and the emitter.emit method that
// triggers the app's emitter listeners.
app.route('/', viewManager);
app.route('/:page', viewManager);
app.route('/404', viewManager);

app.mount('body');  // Overwrite the `<body>` tag with the content of the Choo app