async function routes(fastify, options) {
  fastify.get('/styles/:css', async (request, reply) => {
    reply.sendFile('css/' + request.params.css);
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