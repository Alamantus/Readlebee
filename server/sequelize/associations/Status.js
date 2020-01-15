module.exports = models => {
  const {
    Status,
    User,
    ShelfItem,
    Reactions,
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

  Status.hasMany(Reactions.scope('Status'), {
    foreignKey: 'targetId',
    constraints: false,
    as: 'Reactions',
  });

  return Status;
}