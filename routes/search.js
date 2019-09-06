const SearchController = require('../controllers/search');

async function routes(fastify, options) {
  fastify.get('/search', async (request, reply) => {
    const searchTerm = typeof request.query.for !== 'undefined' ? request.query.for.trim() : '';
    const search = new SearchController(searchTerm);
    
    const results = await search.searchOpenLibrary();
    reply.view('search.hbs', { results, searchTerm });
  });
}

module.exports = routes