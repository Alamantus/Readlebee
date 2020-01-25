module.exports = models => {
  const {
    Status,
    PermissionLevel,
    User,
    ShelfItem,
    Reaction,
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

  Status.hasMany(Reaction.scope('Status'), {
    foreignKey: 'targetId',
    constraints: false,
    as: 'Reactions',
  });

  return Status;
}