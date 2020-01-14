module.exports = models => {
  const {
    BookReference,
    Review,
  } = models;

  BookReference.hasMany(Review);

  return BookReference;
}