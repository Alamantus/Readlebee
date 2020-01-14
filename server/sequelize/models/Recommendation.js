const Sequelize = require('sequelize');

module.exports = sequelize => sequelize.define('Recommendation', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fromUser: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: sequelize.models.User,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
  toUser: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: sequelize.models.User,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
  text: {
    type: Sequelize.TEXT,
    allowNull: false,
    validate: {
      isNotBlank: value => value.length > 2,
    }
  },
  bookId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: sequelize.models.BookReference,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
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
}, {
  paranoid: true, // If toUser deletes recommendation, keep in database so fromUser can still see that they sent the recommendation.
  indexes: [
    {
      fields: ['toUser'],
    },
    {
      fields: ['fromUser'],
    },
  ],
});