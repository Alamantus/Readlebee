const Sequelize = require('sequelize');

module.exports = sequelize => sequelize.define('Follow', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  follower: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: sequelize.models.User,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
  followerDomain: {
    type: Sequelize.TEXT,
    allowNull: true,
    comment: 'A null value means that the following id is on this server, otherwise it is external.',
  },
  following: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: sequelize.models.User,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
  followingDomain: {
    type: Sequelize.TEXT,
    allowNull: true,
    comment: 'A null value means that the following id is on this server, otherwise it is external.',
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
      fields: ['follower'],
    },
    {
      fields: ['following', 'domain'],
    },
  ],
  scopes: {
    internal: {
      where: {
        followerDomain: {
          [Sequelize.Op.is]: null,
        },
        followingDomain: {
          [Sequelize.Op.is]: null,
        },
      },
    },
  }
});