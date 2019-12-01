export const appUtilities = (app) => {
  app.getSettingsItem = settingsKey => {
    let savedSettings = window.localStorage.getItem('settings');
    if (savedSettings) {
      savedSettings = JSON.parse(savedSettings);
      if (typeof savedSettings[settingsKey] !== 'undefined') {
        return savedSettings[settingsKey];
      }
    }
    return null;
  }
  app.setSettingsItem = (settingsKey, value) => {
    let savedSettings = window.localStorage.getItem('settings');
    if (savedSettings) {
      savedSettings = JSON.parse(savedSettings);
    } else {
      savedSettings = {};
    }
    savedSettings[settingsKey] = value;
    return window.localStorage.setItem('settings', JSON.stringify(savedSettings));
  }

  app.checkIfLoggedIn = (appState) => {
    return fetch('/api/account/validate', { method: 'post' })
      .then(response => response.json())
      .then(response => {
        if (response.error !== false) {
          console.warn(appState.i18n.__(response.message));
          return false;
        }
        
        console.info(appState.i18n.__(response.message));
        appState.isLoggedIn = true;
        return true;
      });
  }
}