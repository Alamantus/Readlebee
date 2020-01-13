const Sequelize = require('sequelize');

function getModels (sequelize) {
  const User = sequelize.define('user', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        len: [5, 150],
      },
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: /^[a-z0-9_]+$/i, // Is a set of characters a-z, 0-9, or _, case insensitive
        len: [2, 32],
      },
    },
    displayName: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 32],
      },
    },
    passwordHash: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    passwordSalt: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    accountConfirm: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    // Timestamps
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  });

  const Shelf = sequelize.define('shelf', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      references: {
        model: User,
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
      }
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        len: [1, 32],
      },
    },
    isPublic: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isDeletable: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    // Timestamps
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  });
  Shelf.belongsTo(User, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  });
  User.hasMany(Shelf);

  const BookReference = sequelize.define('bookReference', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: 'The description is attempted to be made up of the type of work and the author',
    },
    sources: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'A JSON array with each element being an object with named source <STRING> and source id <STRING>',
    },
    covers: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'A JSON array with each element being an object with image url <STRING> and source id <STRING>',
    },

    // Timestamps
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  }, {
    indexes: [
      {
        fields: ['name', 'description'],
      },
    ],
  });

  const ShelfItem = sequelize.define('shelfItem', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shelfId: {
      type: Sequelize.INTEGER,
      references: {
        model: Shelf,
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
      }
    },
    bookId: {
      type: Sequelize.INTEGER,
      references: {
        model: BookReference,
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
      }
    },
    bookEdition: {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'An object with properties `source` and `id`',
    },
    order: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },

    // Timestamps
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  });
  Shelf.hasMany(ShelfItem);
  ShelfItem.belongsTo(Shelf, {
    foreignKey: 'shelfId',
    onDelete: 'CASCADE',
  });
  ShelfItem.belongsTo(BookReference, {
    foreignKey: 'bookId',
    onDelete: 'CASCADE',
  });

  const Status = sequelize.define('status', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      references: {
        model: User,
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
      }
    },
    text: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    shelfItemId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: ShelfItem,
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
      }
    },
    progress: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },

    // Timestamps
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  });
  User.hasMany(Status);
  Status.belongsTo(User, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  });
  ShelfItem.hasMany(Status);
  Status.belongsTo(ShelfItem, {
    foreignKey: 'shelfItemId',
    // onDelete: 'IGNORE'
  });

  const Review = sequelize.define('review', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      references: {
        model: User,
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
      }
    },
    text: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    bookReferenceId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: BookReference,
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
      }
    },
    rating: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },

    // Timestamps
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  });
  User.hasMany(Review);
  Review.belongsTo(User, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  });
  BookReference.hasMany(Review);
  Review.belongsTo(BookReference, {
    foreignKey: 'shelfItemId',
    // onDelete: 'IGNORE'
  });

  const Recommendation = sequelize.define('recommendation', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    toUser: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
      }
    },
    text: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    book: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: BookReference,
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
      }
    },
    data: {
      type: Sequelize.JSON,
      allowNull: true,
    },

    // Timestamps
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  });
  Recommendation.belongsTo(User, {
    foreignKey: 'fromUser',
    onDelete: 'SET NULL',
  });
  Recommendation.belongsTo(User, {
    foreignKey: 'toUser',
    onDelete: 'CASCADE',
  });
  User.hasMany(Recommendation, {
    foreignKey: 'toUser',
  })

  return {
    User,
    Shelf,
    BookReference,
    ShelfItem,
    StatusType,
    Status,
    Review,
    Recommendation,
  }
}

module.exports = getModels;