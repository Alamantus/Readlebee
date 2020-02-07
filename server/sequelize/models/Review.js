const Sequelize = require('sequelize');

module.exports = sequelize => sequelize.define('Review', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: sequelize.models.User,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    }
  },
  permissionLevel: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: sequelize.models.PermissionLevel,
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
}, {
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['bookReferenceId'],
    },
  ],
  scopes: {
    Rating: {
      where: { rating: { [Sequelize.Op.not]: null } },
    },
    Text: {
      where: { text: { [Sequelize.Op.not]: null } },
    },
  },
});