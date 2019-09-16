export class ViewController {
  constructor(state, i18n, viewName, defaultState = {}) {
    // Store the global app state so it's accessible but out of the way.
    this.appState = state;
    this.i18n = i18n;
    this.i18n.__ = this.i18n.__.bind(i18n); // Allow pulling out just the `__` function for shortened translation declaration.

    // Give this view its own state within the appState.
    if (!this.appState.viewStates.hasOwnProperty(viewName)) {
      this.appState.viewStates[viewName] = defaultState;
    }
    this.state = this.appState.viewStates[viewName];
  }

  get isLoggedIn () {
    return this.appState.isLoggedIn;
  }
}