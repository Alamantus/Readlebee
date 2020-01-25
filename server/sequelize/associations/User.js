module.exports = models => {
  const {
    User,
    PermissionLevel,
    Shelf,
    Status,
    Review,
    Recommendation,
    Follow,
  } = models;

  User.belongsTo(PermissionLevel, {
    foreignKey: 'permissionLevel',
    onDelete: 'SET NULL',
  });
  User.hasMany(Shelf, {
    foreignKey: 'userId',
  });
  User.hasMany(Status, {
    foreignKey: 'userId',
  });
  User.hasMany(Review, {
    foreignKey: 'userId',
  });
  User.hasMany(Recommendation, {
    foreignKey: 'toUser',
  });
  User.belongsToMany(User, {
    through: Follow,
    foreignKey: 'following',
    as: 'following',
  });
  User.belongsToMany(User, {
    through: Follow,
    foreignKey: 'follower',
    as: 'follower',
  });

  return User;
}