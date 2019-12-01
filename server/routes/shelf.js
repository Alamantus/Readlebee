const fs = require('fs');
const path = require('path');
const ShelfController = require('../controllers/shelf');

async function routes(fastify, options) {
  fastify.get('/api/shelf/test', async (request, reply) => {
    return false;
  });

  fastify.post('/api/shelf/create', async (request, reply) => {
    if (!request.isLoggedInUser) {
      return reply.code(400).send({
        error: true,
        message: 'api.not_logged_in',
      });
    }

    if (typeof request.body.shelfName === 'undefined') {
      return reply.code(400).send({
        error: true,
        message: 'api.shelf.create.missing_name',
      });
    }
    request.body.shelfName = request.body.shelfName.trim();
    
    const userShelves = await request.user.getShelves({
      attributes: ['name'],
    });
    const shelfNameIsValid = ShelfController.newShelfNameIsValid(
      request.body.shelfName,
      userShelves.map(shelf => shelf.name)
    );
    if (shelfNameIsValid !== true) {
      return reply.code(400).send(shelfNameIsValid);
    }

    const shelf = new ShelfController(fastify.models.Shelf, fastify.models.ShelfItem);

    const newShelf = shelf.createShelf(request.user, request.body.shelfName);
    if (typeof newShelf.error !== 'undefined' && newShelf.error !== false) {
      newShelf.message = 'api.shelf.create.fail';
      return reply.code(400).send(newShelf);
    }

    return reply.send({
      error: false,
      message: 'api.shelf.create.success',
    });
  });
}

module.exports = routes;