module.exports = models => {
  const {
    Review,
    User,
    PermissionLevel,
    BookReference,
  } = models;

  Review.belongsTo(User, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  });

  Review.belongsTo(PermissionLevel, {
    foreignKey: 'permissionLevel',
    onDelete: 'SET NULL',
  });

  Review.belongsTo(BookReference, {
    foreignKey: 'bookReferenceId',
    onDelete: 'SET NULL',
  });

  return Review;
}