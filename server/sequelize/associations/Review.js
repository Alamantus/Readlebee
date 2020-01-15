module.exports = models => {
  const {
    Review,
    User,
    PermissionLevel,
    BookReference,
    Reactions,
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

  Review.hasMany(Reactions.scope('Review'), {
    foreignKey: 'targetId',
    constraints: false,
    as: 'Reactions',
  });

  return Review;
}