const fs = require('fs');
const path = require('path');
const htmlContainer = fs.readFileSync(path.resolve('public/index.html'));
const chooApp = require('../../app')();
const chooI18n = require('../../app/i18n').I18n;

async function routes(fastify, options) {
  // This is overridden by any explicitly named routes, so the API will be fine.
  fastify.get('/:chooRoute', async (request, reply) => {
    if (/\.\w+$/.test(request.params.chooRoute)) {  // If the :chooRoute is a filename, serve the file instead
      return reply.sendFile(request.params.chooRoute);
    }
    // Otherwise, send allow Choo to route it.
    // const state = Object.assign({}, chooApp.state);
    chooApp.state.language = request.language;
    chooApp.state.isLoggedIn = request.isLoggedInUser;

    chooApp.state.i18n = new chooI18n(chooApp.state);
    chooApp.state.i18n.availableLanguages = fastify.i18n.available.slice();
    chooApp.state.i18n.default = Object.assign({}, fastify.i18n.default);

    const locale = typeof fastify.i18n[chooApp.state.language] !== 'undefined' ? chooApp.state.language : 'default';
    chooApp.state.i18n.language = Object.assign({}, fastify.i18n[locale]);
    chooApp.state.i18n.pages = Object.assign({}, fastify.i18n.pages[locale]);

    const html = htmlContainer.toString().replace(/\<body\>.+?\<\/body\>/, chooApp.toString('/' + request.params.chooRoute, chooApp.state));
    return reply.type('text/html').send(html);
  });
}

module.exports = routes