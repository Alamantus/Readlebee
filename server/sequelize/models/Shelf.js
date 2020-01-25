const Sequelize = require('sequelize');

module.exports = sequelize => sequelize.define('Shelf', {
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
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: [1, 32],
    },
  },
  permissionLevel: {
    type: Sequelize.NUMBER,
    allowNull: false,
    references: {
      model: sequelize.models.PermissionLevel,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    }
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
}, {
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['permissionLevel'],
    },
  ],
});