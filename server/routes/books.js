const BooksController = require('../controllers/books');

async function routes(fastify, options) {
  fastify.get('/api/books', async (request, reply) => {
    const bookURI = typeof request.query.uri !== 'undefined' ? request.query.uri.trim() : '';
    const language = typeof request.query.lang !== 'undefined' ? request.query.lang.trim().split('-')[0] : undefined; // Get base language in cases like 'en-US'
    const books = new BooksController(fastify.siteConfig.inventaireDomain, bookURI, language);

    return books.getBookData();
  });

  fastify.get('/api/books/covers', async (request, reply) => {
    const bookURI = typeof request.query.uri !== 'undefined' ? request.query.uri.trim() : '';
    const language = typeof request.query.lang !== 'undefined' ? request.query.lang.trim().split('-')[0] : undefined; // Get base language in cases like 'en-US'
    const books = new BooksController(fastify.siteConfig.inventaireDomain, bookURI, language);

    return await books.getInventaireCovers();
  });
}

module.exports = routes