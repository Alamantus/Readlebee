export const appListeners = (app, state, emitter) => {
  emitter.on('DOMContentLoaded', () => {
    document.title = app.siteConfig.siteName;
    // Emitter listeners
    emitter.on('render', callback => {
      app.setSessionState();
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
      emitter.emit('render', () => { });
    });

    emitter.on('set-language', newLanguage => {
      app.setSettingsItem('lang', newLanguage);
      state.language = newLanguage;
      emitter.emit('render', () => { });
    });
  });
}