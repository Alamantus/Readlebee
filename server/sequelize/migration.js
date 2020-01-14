const path = require('path');
const fs = require('fs');

const dbVersion = '0.0.0';

function migrateDb(oldVersion, sequelize) {
  const models = sequelize.models;
  // if (oldVersion < targetVersion) {
    // migrate db here
  // }
  return sequelize;
}

module.exports = {
  dbVersion,
  migrateDb,
};