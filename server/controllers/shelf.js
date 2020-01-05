class ShelfController {
  constructor (shelfModel, shelfItemModel) {
    this.model = shelfModel;
    this.itemModel = shelfItemModel;
  }

  static newShelfNameIsValid (name, existingNames = []) {
    if (name.length < 1) {
      return {
        error: true,
        message: 'api.shelf.create.name_too_short',
      };
    }
    
    if (existingNames.includes(name)) {
      return {
        error: true,
        message: 'api.shelf.create.name_already_exists',
      };
    }

    return true;
  }

  async createDefaultShelves (user) {
    try {
      const defaultShelvesCreated = await this.model.bulkCreate([
        {
          userId: user.id,
          name: 'Reading',
          isDeletable: false,
        },
        {
          userId: user.id,
          name: 'Want to Read',
          isDeletable: false,
        },
        {
          userId: user.id,
          name: 'Finished',
          isDeletable: false,
        },
        {
          userId: user.id,
          name: 'Did Not Finish',
          isDeletable: false,
        }
      ]);

      if (defaultShelvesCreated.some(result => !result)) {
        return {
          error: true,
          shelfResults: defaultShelvesCreated,
        };
      }

      return defaultShelvesCreated;
    } catch (error) {
      return {
        error,
      }
    }
  }
  
  async createShelf (user, name) {
    try {
      return await user.addShelf({
        name,
      });
    } catch(error) {
      return {
        error,
      }
    }
  }
  
  async renameShelf (userId, id, name) {
    try {
      return await this.model.update({
        name,
      }, {
        where: {
          id,
          userId,
          isDeletable: true,  // You can only rename shelves not created by the system
        }
      });
    } catch(error) {
      return {
        error,
      }
    }
  }

  async getLastUpdatedTimestamp (shelf) {
    const lastEditedItem = await shelf.getShelfItems({
      attributes: ['updatedAt'],
      order: [
        [
          'updatedAt',
          'DESC'
        ],
      ],
      limit: 1,
    });

    if (lastEditedItem.length > 0 && (lastEditedItem[0].updatedAt > shelf.updatedAt)) {
      return lastEditedItem.updatedAt;
    }
    return shelf.updatedAt;
  }

  async getShelfById(shelfId) {
    if (isNaN(parse(shelfId))) {
      return {
        error: 'Shelf ID Provided is not a number.',
      };
    }
    const shelf = await this.shelfModel.findByPk(shelfId);

    if (shelf === null) {
      return {
        error: `Shelf with ID ${shelfId} not found.`,
      };
    }

    shelf.updatedAt = this.getLastUpdatedTimestamp(shelf);
    return shelf;
  }

  async userCanViewShelf (user, shelf) {
    // This needs work when permissions are added.
    return user.id === shelf.userId || shelf.isPublic;
  }
}

module.exports = ShelfController;