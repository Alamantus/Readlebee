const fs = require('fs');
const path = require('path');
const ShelfController = require('../controllers/shelf');

async function routes(fastify, options) {
  fastify.get('/api/shelf/test', async (request, reply) => {
    return false;
  });

  fastify.get('/api/shelf/getAll', async (request, reply) => {
    if (!request.isLoggedInUser) {
      return reply.code(400).send({
        error: true,
        message: 'api.not_logged_in',
      });
    }

    const shelfController = new ShelfController(fastify.models);

    const shelves = await request.user.getShelves({
      attributes: ['id', 'name', 'isDeletable', 'isPublic', 'updatedAt'],
    });

    return shelves.map(shelf => {
      shelf.updatedAt = shelfController.getLastUpdatedTimestamp(shelf);
      return shelf;
    });
  });

  fastify.get('/api/shelf/get/:shelfId/:domain', async (request, reply) => {
    if (typeof request.params.shelfId === 'undefined') {
      return reply.code(400).send({
        error: true,
        message: 'api.shelf.get.missing_id',
      });
    }
    if (isNaN(parseInt(request.params.shelfId))) {
      return reply.code(400).send({
        error: true,
        message: 'api.shelf.get.invalid_id',
      });
    }

    if (request.params.domain.trim() !== '') {
      return ShelfController.CheckExternalDomainForShelf(request.params.domain.trim(), request.params.shelfId);
    }

    const shelfController = new ShelfController(fastify.models);

    const shelf = await shelfController.getShelfById(request.params.shelfId);
    if (typeof shelf.error !== 'undefined') {
      shelf.message = 'api.shelf.get.nonexistent_shelf';
      return reply.code(400).send(shelf);
    }
    
    const userCanViewShelf = await shelfController.userCanViewShelf(request.user, shelf);
    console.log('can view?', userCanViewShelf);
    if (userCanViewShelf !== true) {
      return reply.code(400).send({
        error: true,
        message: 'api.shelf.get.access_denied', // Should potentially be nonexistent shelf message instead?
      });
    }

    // const shelfData = await shelfController.scrubShelfData(shelf, request.user);
    // return reply.send(shelfData);
    return reply.send(shelf);
  });

  fastify.post('/api/shelf/create', async (request, reply) => {
    if (!request.isLoggedInUser) {
      return reply.code(400).send({
        error: true,
        message: 'api.not_logged_in',
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

    const shelfController = new ShelfController(fastify.models);

    const newShelf = shelfController.createShelf(request.user, request.body.shelfName);
    if (typeof newShelf.error !== 'undefined' && newShelf.error !== false) {
      newShelf.message = 'api.shelf.create.fail';
      return reply.code(400).send(newShelf);
    }

    return reply.send({
      error: false,
      message: 'api.shelf.create.success',
    });
  });

  fastify.post('/api/shelf/rename', async (request, reply) => {
    if (!request.isLoggedInUser) {
      return reply.code(400).send({
        error: true,
        message: 'api.not_logged_in',
      });
    }

    if (typeof request.body.shelfId === 'undefined') {
      return reply.code(400).send({
        error: true,
        message: 'api.shelf.rename.missing_id',
      });
    }

    if (typeof request.body.shelfName === 'undefined') {
      return reply.code(400).send({
        error: true,
        message: 'api.shelf.rename.missing_name',
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

    const shelfController = new ShelfController(fastify.models);

    const newShelf = shelfController.renameShelf(request.user, request.body.shelfId, request.body.shelfName);
    if (typeof newShelf.error !== 'undefined' && newShelf.error !== false) {
      newShelf.message = 'api.shelf.rename.fail';
      return reply.code(400).send(newShelf);
    }

    return reply.send({
      error: false,
      message: 'api.shelf.rename.success',
    });
  });
}

module.exports = routes;