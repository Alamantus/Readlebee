const BooksController = require('../controllers/bookData');
const SearchController = require('../controllers/search');

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

  fastify.post('/api/books/getId', async (request, reply) => {
    if (typeof request.body.source === 'undefined') {
      return reply.code(400).send({
        error: true,
        message: 'api.shelf.getId.missing_source',
      });
    }

    if (typeof request.body.uri === 'undefined') {
      return reply.code(400).send({
        error: true,
        message: 'api.shelf.getId.missing_uri',
      });
    }

    const search = new SearchController(fastify.models);
    const existingBookReferences = await search.searchReferencesBySourceCodes(request.body.source, [request.body.uri]);
    if (existingBookReferences.length > 0) {
      return existingBookReferences[0].id;
    }

    const books = new BooksController(request.body.source, request.body.uri, request.language);
    const newBookReference = await books.createBookReference(fastify.models.BookReference, request.body.source, request.body.uri);
    console.log('created new bookreference', newBookReference);
    return newBookReference.id;
  });
}

module.exports = routes