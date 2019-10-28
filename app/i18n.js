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

  translate (section, phrase) {
    let result;
    let language = this.default;

    if (!this.needsFetch && this.appState.language !== this.language.locale) {
      console.warn(`The target language (${this.appState.language}) does not exist. Defaulting to ${this.default.name} (${this.default.locale}).`);
    } else if (typeof this.language[section] == 'undefined' || typeof this.language[section][phrase] == 'undefined') {
      console.warn(`The translation for "${section}.${phrase}" is not set in the ${this.language.locale} locale. Using ${this.default.name} (${this.default.locale}) instead.`);  
    } else {
      language = this.language;
    }

    if (typeof language[section] !== 'undefined' && typeof language[section][phrase] !== 'undefined') {
      result = language[section][phrase];
    } else {
      console.error(`The translation for "${section}.${phrase}" is set up in neither the target nor default locale.`);
      result = `${section}.${phrase}`;
    }
    
    return result;
  }
  
  __ (translation) {
    const pieces = translation.split('.');
    const result = this.translate(pieces[0], pieces[1]);
    return result;
  }
}
