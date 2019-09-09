const SearchController = require('../controllers/search');

async function routes(fastify, options) {
  fastify.get('/api/search', async (request, reply) => {
    const searchTerm = typeof request.query.for !== 'undefined' ? request.query.for.trim() : '';
    const language = typeof request.query.lang !== 'undefined' ? request.query.lang.trim().split('-')[0] : undefined; // Get base language in cases like 'en-US'
    const search = new SearchController(searchTerm, language);
    
    return await search.searchInventaire();
  });
}

module.exports = routes