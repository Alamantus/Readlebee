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
  User.hasMany(Shelf);
  User.hasMany(Status);
  User.hasMany(Review);
  User.hasMany(Recommendation, {
    foreignKey: 'toUser',
  });
  User.hasMany(Follow, {
    foreignKey: 'follower',
    as: 'Followers',
  });
  User.belongsTo(Follow.scope('internal'), {
    foreignKey: 'following',
    as: 'Follows',
  });

  return User;
}