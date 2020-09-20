const fp = require('fastify-plugin');
const fs = require('fs');
const path = require('path');
const marked = require('marked');

async function plugin (fastify, opts, done) {
  const i18n = {
    available: [],
    pages: {},
  };
  try {
    const locales = fs.readdirSync(path.resolve(__dirname, './locales'));
    locales
      .filter(file => !file.split().every(letter => letter === '.'))  // Filter out relative folders
      .forEach(locale => {
        try {
          const ui = fs.readFileSync(path.resolve(__dirname, `./locales/${locale}/ui.json`)),
            about = fs.readFileSync(path.resolve(__dirname, `./locales/${locale}/pages/about.md`)),
            community = fs.readFileSync(path.resolve(__dirname, `./locales/${locale}/pages/community.md`));

          i18n[locale] = JSON.parse(ui.toString());
          
          i18n.available.push({
            name: i18n[locale].name,
            locale: i18n[locale].locale,
          });

          i18n.pages[locale] = {
            about: marked(about.toString()),
            community: marked(community.toString()),
          }
        } catch (ex) {
          console.error('Encountered a problem with locale.\n', ex);
        }
      });

    // Set the default language to English after parsing locales because it has the most coverage.
    i18n.default = i18n.en;
  } catch (ex) {
    console.error('Could not get locales folder.\n', ex);
  }

  fastify.decorate('i18n', i18n);

  fastify.register(require(path.resolve(__dirname, './routes'))); // Self-register the routing for fetching locales

  done();
}

module.exports = fp(plugin);