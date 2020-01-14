const Sequelize = require('sequelize');

module.exports = sequelize => sequelize.define('PermissionLevel', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: false,
    comment: 'Represents the level number with 100 being the private and 0 being public',
  },
  name: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
}, {
  timestamps: false,
});