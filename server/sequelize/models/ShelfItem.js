const Sequelize = require('sequelize');

module.exports = sequelize => sequelize.define('ShelfItem', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  shelfId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: sequelize.models.Shelf,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    }
  },
  bookId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: sequelize.models.BookReference,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    }
  },
  bookEdition: {
    type: Sequelize.JSON,
    allowNull: true,
    comment: 'An object with properties `source` <STRING> and `id` <STRING> where `source` is the domain where the edition was taken from `id` is the reference to the edition in source',
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
}, {
  indexes: [
    {
      fields: ['shelfId'],
    },
  ],
});