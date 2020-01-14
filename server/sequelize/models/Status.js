const Sequelize = require('sequelize');

module.exports = sequelize => sequelize.define('Status', {
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
  permissionLevel: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: sequelize.models.PermissionLevel,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
    comment: 'This permission level should be the level of the ShelfItem or lower.',
  },
  text: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  shelfItemId: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: sequelize.models.ShelfItem,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
  progress: {
    type: Sequelize.INTEGER,
    allowNull: true,
    comment: 'A number from 0 to 100 that represents percent completion',
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
      fields: ['shelfItemId'],
    },
  ],
});