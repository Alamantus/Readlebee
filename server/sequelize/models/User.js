const Sequelize = require('sequelize');

module.exports = sequelize => sequelize.define('User', {
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
    validate: {
      len: [1, 32],
    },
  },
  permissionLevel: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    references: {
      model: sequelize.models.PermissionLevel,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
    comment: 'Enable profile to be viewed only by users of this permission level. "Followers" is interpreted as "Users this user is following" for this case.',
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