class Shelf {
  constructor (shelfModel, shelfItemModel) {
    this.model = shelfModel;
    this.itemModel = shelfItemModel;
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

  async getLastUpdatedTimestamp (shelf) {
    const lastEditedItem = await this.itemModel.findOne({
      attributes: ['updatedAt'],
      where: {
        shelf: shelf.id,
      },
      order: [
        [
          'updatedAt',
          'DESC'
        ],
      ],
    });

    if (lastEditedItem && lastEditedItem.updatedAt > shelf.updatedAt) {
      return lastEditedItem.updatedAt;
    }
    return shelf.updatedAt;
  }
}

module.exports = Shelf;