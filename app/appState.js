export const appState = (app, state, emitter) => {
  const sessionState = app.getSessionState();
  if (sessionState) {
    Object.keys(sessionState).forEach(key => {
      if (typeof state[key] === 'undefined') {
        state[key] = sessionState[key];
      }
    });
  } else {
    // Default state variables
    state.currentView = 'home';
    state.language = app.getSettingsItem('lang') ? app.getSettingsItem('lang') : (navigator.language || navigator.userLanguage).split('-')[0];
    state.viewStates = {};
    state.isLoggedIn = false;
  }
}