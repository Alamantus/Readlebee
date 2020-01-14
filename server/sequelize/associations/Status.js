module.exports = models => {
  const {
    Status,
    User,
    ShelfItem,
  } = models;

  Status.belongsTo(User, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  });

  Status.belongsTo(PermissionLevel, {
    foreignKey: 'permissionLevel',
    onDelete: 'SET NULL',
  });

  Status.belongsTo(ShelfItem, {
    foreignKey: 'shelfItemId',
    onDelete: 'SET NULL',
  });

  return Status;
}