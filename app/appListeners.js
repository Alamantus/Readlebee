export const appListeners = (app, state, emitter) => {
  emitter.on('DOMContentLoaded', () => {
    document.title = app.siteConfig.siteName;
    // Emitter listeners
    emitter.on('render', callback => {
      // This is a dirty hack to get the callback to call *after* re-rendering.
      if (callback && typeof callback === "function") {
        setTimeout(() => {
          callback();
        }, 50);
      }
    });

    emitter.on('set-language', newLanguage => {
      app.setSettingsItem('lang', newLanguage);
      state.language = newLanguage;
      emitter.emit('render');
    });

    app.checkIfLoggedIn(state).then(isLoggedIn => {
      emitter.emit('render'); // This should hopefully only run once after the DOM is loaded. It prevents routing issues where 'render' hasn't been defined yet
    });
  });
}