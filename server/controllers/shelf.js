const fetch = require('node-fetch');

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

  static async CheckExternalDomainForShelf (domain, shelfId) {
    const response = await fetch(`https://${domain}/api/shelf/get/${shelfId}/`).then(response => response.json());
    // validate response somehow
    return response;
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
    if (isNaN(parseInt(shelfId))) {
      return {
        error: 'Shelf ID Provided is not a number.',
      };
    }

    return this.getFakeShelf();

    const shelf = await this.shelfModel.findByPk(shelfId);
    if (shelf === null) {
      return {
        error: `Shelf with ID ${shelfId} not found.`,
      };
    }

    shelf.updatedAt = this.getLastUpdatedTimestamp(shelf);
    return shelf;
  }

  getFakeShelf () {
    const faker = require('faker');
    const isOwnShelf = faker.random.boolean();
    const fakeName = faker.random.boolean()
        ? faker.fake('{{name.firstName}} {{name.lastName}}')
        : faker.fake('{{hacker.adjective}}{{hacker.noun}}');

    const shelf = {
      id: faker.random.number(),
      userId: faker.random.number(),
      user: isOwnShelf ? null : {
        name: fakeName,
        handle: faker.fake('@{{internet.userName}}@{{internet.domainName}}'),
      },
      name: faker.fake('{{hacker.ingverb}} {{hacker.noun}}'),
      isPublic: Math.random() < 0.9,
      updatedAt: faker.date.past(),
      shelfItems: [],
    };

    const numberOfShelfItems = faker.random.number(50);
    for (let i = 0; i < numberOfShelfItems; i++) {
      const source = {
        source: faker.internet.domainWord(),
        sourceId: faker.random.uuid(),
      };
      const shelfItem = {
        name: faker.lorem.words().split(' ').map(word => (word[0].toUpperCase() + word.substr(1))).join(' '),
        author: faker.fake('a work by {{name.firstName}} {{name.lastName}}'),
        source,
        coverURL: faker.image.imageUrl(),
        coverEdition: `img_${source.sourceId}`,
        rating: faker.random.number(5),
        review: faker.random.boolean()
          ? null
          : faker.lorem.paragraph(),
      }

      shelf.shelfItems.push(shelfItem);
    }

    if (isOwnShelf) {
      shelf.createdAt = faker.date.past(undefined, shelf.updatedAt);
      shelf.isDeletable = true;
    }

    return shelf;
  }

  async userCanViewShelf (user, shelf) {
    // This needs work when permissions are added.
    const userOwnsShelf = typeof user !== 'undefined' && user.id === shelf.userId;
    console.log('owned?', userOwnsShelf);
    console.log('isPublic?', shelf.isPublic);
    return userOwnsShelf || shelf.isPublic;
  }

  async scrubShelfData (shelf, currentUser) {
    const userOwnsShelf = currentUser.id === shelf.userId;
    const shelfUser = userOwnsShelf ? null : await shelf.getUser({ attributes: ['username, displayName'] });
    let user = {};
    if (shelfUser !== null) {
      user.name = shelfUser.displayName;
      user.handle = shelfUser.username;
    } else {
      user = null;
    }
    const rawShelfItems = await shelf.getShelfItems({
      attributes: ['bookId', 'createdAt', 'updatedAt'],
      order: [['order', 'ASC']],
    })
    const bookReferenceMap = await Promise.all(shelfItems.map(shelfItem => {
      return shelfItem.getBookReference({
        attributes: ['name', 'description', 'sources', 'covers'],
      });
    }));
    const bookReferenceStatuses = await Promise.all(bookReferenceMap.map(bookReference => {
      return bookReference.getStatuses({
        where: {
          userId: shelf.userId,
        },
        order: [['updatedAt', 'DESC']],
      });
    }));
    const bookReferences = bookReferenceMap.map(bookReference => {
      bookReference.updates = bookReferenceStatuses.findAll(status => status.type === 1);
      bookReference.rating = bookReferenceStatuses.find(status => status.type === 3);
      bookReference.review = bookReferenceStatuses.find(status => status.type === 4);
      return bookReference;
    });
    const shelfItems = rawShelfItems.map(shelfItem => {
      const bookReference = bookReferences.find(bookData => bookData.id === shelfItem.bookId);
      shelfItem.title = bookReference.name;
      shelfItem.author = bookReference.description;
      shelfItem.sources = bookReference.sources;
      shelfItem.covers = bookReference.covers;
      shelfItem.updates = bookReference.updates;
      shelfItem.rating = bookReference.rating.data;
      shelfItem.review = bookReference.review.data;
      return shelfItem;
    })
    
    const shelfData = {
      name: shelf.name,
      user,
      shelfItems,
    };

    return shelfData;
  }
}

module.exports = ShelfController;