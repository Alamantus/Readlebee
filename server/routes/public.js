async function routes(fastify, options) {
  // This route is not totally necessary because fastify-static serves public/ wholesale, but it's good to be verbose!
  fastify.get('/', async (request, reply) => {
    return reply.sendFile('index.html');
  });

  // This is overridden by any explicitly named routes, so the API will be fine.
  fastify.get('/:chooRoute', async (request, reply) => {
    if (/\.\w+$/.test(request.params.chooRoute)) {  // If the :chooRoute is a filename, serve the file instead
      return reply.sendFile(request.params.chooRoute);
    }
    // Otherwise, send index.html and allow Choo to route it.
    return reply.sendFile('index.html');
  });
}

module.exports = routes