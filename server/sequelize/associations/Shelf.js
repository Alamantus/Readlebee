module.exports = models => {
  const {
    Shelf,
    User,
    ShelfItem,
    PermissionLevel,
  } = models;

  Shelf.belongsTo(User, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  });

  Shelf.belongsTo(PermissionLevel, {
    foreignKey: 'permissionLevel',
    onDelete: 'SET NULL',
  });

  Shelf.hasMany(ShelfItem, {
    foreignKey: 'shelfId',
  });

  return Shelf;
}