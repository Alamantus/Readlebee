async function routes(fastify, options) {
  fastify.get('/', async (request, reply) => {
    // return { hello: 'world' }
    reply.view('home.hbs', { text: 'test' });
  });

  // fastify.get('/search/:id', async function (request, reply) {
  //   const result = await collection.findOne({ id: request.params.id })
  //   if (result.value === null) {
  //     throw new Error('Invalid value')
  //   }
  //   return result.value
  // })
}

module.exports = routes