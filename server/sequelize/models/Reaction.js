const Sequelize = require('sequelize');

module.exports = sequelize => sequelize.define('Reaction', {
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
    },
  },
  targetType: {
    type: Sequelize.ENUM,
    values: ['Status', 'Review'],
    allowNull: false,
    comment: 'The model/table that `targetId` lives in.',
  },
  targetId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    comment: 'The id of the `targetType` record this Reaction relates to.',
  },
  reactionType: {
    type: Sequelize.ENUM,
    values: ['comment', 'like', 'emoji'],
    allowNull: false,
    comment: 'Stores what type of reaction this record is: Comment, Like, Emoji',
  },
  reaction: {
    type: Sequelize.TEXT,
    allowNull: true,
    comment: 'Stores the Comment or Emoji value of the reaction if not a Like.',
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
      fields: ['targetType', 'targetId'],
    },
    {
      fields: ['reactionType'],
    },
  ],
  scopes: {
    Status: {
      where: { targetType: 'Status' },
    },
    Review: {
      where: { targetType: 'Review' },
    },
  }
});