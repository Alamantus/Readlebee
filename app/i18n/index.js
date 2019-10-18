import en from './locales/en.json';

export class I18n {
  constructor(appState) {
    // Available languages should be kept up to date with the available locales.
    this.availableLanguages = {
      default: en,
      en,
    };
    this.appState = appState;
  }

  get language () {
    return this.appState.language;
  }

  translate (section, phrase) {
    let result;
    let language = this.availableLanguages.default;

    if (typeof this.availableLanguages[this.language] == 'undefined') {
      console.warn(`The target language (${this.language}) does not exist. Defaulting to ${this.availableLanguages.default.name} (${this.availableLanguages.default.locale}).`);
    } else if (typeof this.availableLanguages[this.language][section] == 'undefined' || typeof this.availableLanguages[this.language][section][phrase] == 'undefined') {
      console.warn(`The translation for "${section}.${phrase}" is not set in the ${this.language} locale. Using ${this.availableLanguages.default.name} (${this.availableLanguages.default.locale}) instead.`);  
    } else {
      language = this.availableLanguages[this.language];
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
