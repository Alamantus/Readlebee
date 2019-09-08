export class ViewController {
  constructor(state, viewName, defaultState = {}) {
    // Store the global app state so it's accessible but out of the way.
    this.appState = state;

    // Give this view its own state within the appState.
    if (!this.appState.viewStates.hasOwnProperty(viewName)) {
      this.appState.viewStates[viewName] = defaultState;
    }
    this.state = this.appState.viewStates[viewName];
  }
}