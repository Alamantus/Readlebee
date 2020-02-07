module.exports = models => {
  const {
    BookReference,
    Review,
  } = models;

  BookReference.hasMany(Review, {
    as: 'Interactions',
    foreignKey: 'bookReferenceId',
  });

  BookReference.hasMany(Review.scope('Text'), {
    as: 'Reviews',
    foreignKey: 'bookReferenceId',
  });
  
  BookReference.hasMany(Review.scope('Rating'), {
    as: 'Ratings',
    foreignKey: 'bookReferenceId',
  });

  return BookReference;
}