import { I18n } from "./i18n";

export const appState = (app, state, emitter) => {
  state.events.SET_LANGUAGE = 'setLanguage';
  state.events.ADD_TO_SHELF = 'addToShelf';
  
  state.language = app.getSettingsItem('lang') ? app.getSettingsItem('lang') : (navigator.language || navigator.userLanguage).split('-')[0];
  state.viewStates = {};
  state.isLoggedIn = false;
  state.i18n = new I18n(state); // Global I18n class passed to all views
}