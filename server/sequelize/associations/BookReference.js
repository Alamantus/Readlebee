module.exports = models => {
  const {
    BookReference,
    Review,
  } = models;

  BookReference.hasMany(Review, {
    foreignKey: 'bookReferenceId',
  });

  return BookReference;
}