async function routes(fastify, options) {
  fastify.get('/', async (request, reply) => {
    reply.view('home.hbs', { text: 'test' });
  });
}

module.exports = routes