export class I18n {
  constructor(appState) {
    this.appState = appState;
    this.availableLanguages = null;
    this.language = null;
    this.default = null;
    this.pages = {};
  }

  get needsFetch () {
    return !this.availableLanguages && !this.language && !this.default;
  }

  fetchLocaleUI () {
    return fetch(`/locales/${this.appState.language}/ui`).then(response => response.json()).then(response => {
      this.availableLanguages = response.available;
      this.default = response.default;
      this.language = response.locale;
    }).catch(error => {
      console.error(error);
    });
  }

  fetchLocalePage (page) {
    return fetch(`/locales/${this.appState.language}/page/${page}`).then(response => response.text()).then(response => {
      this.pages[page] = response;
    }).catch(error => {
      console.error(error);
    });
  }

  translate (target, useDefault = false) {
    let language = useDefault ? this.default : this.language;
    const pieces = target.split('.');

    if (!this.needsFetch && !useDefault && this.appState.language !== language.locale) {
      console.warn(`The target language (${this.appState.language}) does not exist. Defaulting to ${this.default.name} (${this.default.locale}).`);
      language = this.default;
    }

    let translation = pieces.reduce((lang, piece, i) => {
      if (lang === false) return false;

      if (typeof lang[piece] === 'object') {
        // Only continue if there's another piece, otherwise, it will error.
        if (typeof pieces[i + 1] !== 'undefined') {
          return lang[piece];
        }
      }
      
      if (typeof lang[piece] === 'string') {
        return lang[piece];
      }

      return false;
    }, Object.assign({}, language));

    if (translation === false) {
      if (language.locale !== this.default.locale) {
        console.warn(`The translation for "${target}" is not set in the ${this.language.locale} locale. Using ${this.default.name} (${this.default.locale}) instead.`);
        return this.translate(target, true);
      }
      console.error(`The translation for "${target}" is set up in neither the target nor default locale.`);
      return target;
    }
    
    return translation;
  }
  
  __ (translation) {
    return this.translate(translation);
  }
}
