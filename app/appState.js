const { I18n } = require("./i18n");

const appState = (app, state, emitter) => {
  state.events.SET_LANGUAGE = 'setLanguage';
  state.events.ADD_TO_SHELF = 'addToShelf';
  
  if (typeof window !== 'undefined') {
    state.language = app.getSettingsItem('lang') ? app.getSettingsItem('lang') : (window.navigator.language || window.navigator.userLanguage).split('-')[0];
    state.isLoggedIn = false;
    state.i18n = new I18n(state); // Global I18n class passed to all views
  }
  state.viewStates = {};
}

module.exports = { appState };
