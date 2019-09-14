import { I18n } from '../i18n';

export class ViewController {
  constructor(state, viewName, defaultState = {}) {
    // Store the global app state so it's accessible but out of the way.
    this.appState = state;
    this.i18n = new I18n(this.appState);

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