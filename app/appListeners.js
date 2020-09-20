const appListeners = (app, state, emitter) => {
  emitter.on(state.events.DOMCONTENTLOADED, () => {
    emitter.emit(state.events.DOMTITLECHANGE, app.siteConfig.siteName);
    
    // Emitter listeners
    emitter.on(state.events.RENDER, callback => {
      // This is a dirty hack to get the callback to call *after* re-rendering.
      if (callback && typeof callback === "function") {
        setTimeout(() => {
          callback();
        }, 50);
      }
    });

    emitter.on(state.events.SET_LANGUAGE, newLanguage => {
      app.setSettingsItem('lang', newLanguage);
      state.language = newLanguage;
      state.i18n.fetchLocaleUI().then(() => {
        emitter.emit(state.events.RENDER);
      });
    });

    emitter.on(state.events.ADD_TO_SHELF, async (book, shelfId, callback = () => {}) => {
      let bookId;
      if(typeof book.source !== 'undefined' && typeof book.uri !== 'undefined') {
        const bookSearchResult = await fetch('/api/books/getId', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(book),
        }).then(response => response.json());

        if (typeof bookSearchResult.error !== 'undefined') {
          console.error(bookSearchResult);
          return bookSearchResult;
        }

        bookId = bookSearchResult;
      } else {
        bookId = book.id;
      }

      return fetch('/api/shelf/addItem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shelfId,
          bookId,
        }),
      }).then(result => callback(result));
    });

    if (typeof window !== 'undefined') {
      state.i18n.fetchLocaleUI().then(() => {
        app.checkIfLoggedIn(state).then(isLoggedIn => {
          emitter.emit(state.events.RENDER); // This should hopefully only run once after the DOM is loaded. It prevents routing issues where 'render' hasn't been defined yet
        });
      });
    }
  });
}

module.exports = { appListeners };
