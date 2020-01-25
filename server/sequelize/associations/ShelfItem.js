module.exports = models => {
  const {
    ShelfItem,
    Shelf,
    BookReference,
    Status,
  } = models;

  ShelfItem.belongsTo(Shelf, {
    foreignKey: 'shelfId',
    onDelete: 'CASCADE',
  });

  ShelfItem.belongsTo(BookReference, {
    foreignKey: 'bookId',
    onDelete: 'CASCADE',
  });

  ShelfItem.hasMany(Status, {
    foreignKey: 'shelfItemId',
  });

  return ShelfItem;
}