module.exports = models => {
  const {
    User,
    PermissionLevel,
    Shelf,
    Status,
    Review,
    Recommendation,
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

  return User;
}