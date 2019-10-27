async function routes(fastify, options) {
  fastify.get('/locales/:locale/ui', async (request, reply) => {
    const response = {
      available: fastify.i18n.available,
      default: fastify.i18n.default,
    };
    if (typeof fastify.i18n[request.params.locale] == 'undefined') {
      console.warn(`The target language (${request.params.locale}) does not exist. Defaulting to ${fastify.i18n.default.name} (${fastify.i18n.default.locale}).`);
      response.locale = fastify.i18n.default;
    } else {
      response.locale = fastify.i18n[request.params.locale];
    }

    return response;
  });

  fastify.get('/locales/:locale/page/:page', async (request, reply) => {
    if (typeof fastify.i18n.pages[request.params.locale] == 'undefined') {
      console.warn(`The target language (${request.params.locale}) does not exist. Defaulting to ${fastify.i18n.default.name} (${fastify.i18n.default.locale}).`);
      if (typeof fastify.i18n.pages[fastify.i18n.default.locale][request.params.page] == 'undefined') {
        console.error(`The target page (${request.params.page}) does not exist. Returning blank.`);
        return request.params.page;
      }
      return fastify.i18n.pages[fastify.i18n.default.locale][request.params.page];
    }
    
    return fastify.i18n.pages[request.params.locale][request.params.page];
  });
}

module.exports = routes;