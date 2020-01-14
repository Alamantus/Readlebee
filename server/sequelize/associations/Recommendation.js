module.exports = models => {
  const {
    Recommendation,
    User,
    BookReference,
  } = models;

  Recommendation.belongsTo(User, {
    foreignKey: 'fromUser',
    onDelete: 'SET NULL',
  });
  Recommendation.belongsTo(User, {
    foreignKey: 'toUser',
    onDelete: 'CASCADE',
  });

  Recommendation.belongsTo(BookReference, {
    foreignKey: 'bookId',
    onDelete: 'CASCADE',
  });

  return Recommendation;
}