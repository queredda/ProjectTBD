// get book, book by id, user by id, wishlist by user account
const getBook =
  'SELECT b.*, s."Stock" FROM "Stored" s LEFT JOIN "Book" b ON b."BookNumber" = s."BookNumber" ORDER BY b."BookNumber" ASC';

const getBookById =
  'SELECT b.*, s."Stock" FROM "Stored" s LEFT JOIN "Book" b ON b."BookNumber" = s."BookNumber" WHERE b."BookNumber" = $1';

const getUserById = 
'SELECT u.*, FROM "UserAccount" WHERE "UserAccountID" = $1';

const getWishlistByUserAccount =
  'SELECT b."BookNumber", w."WishlistID" FROM "Wishlist" w JOIN "Cart" b ON w."WishlistID" = b."WishlistID" WHERE w."UserAccountID" = $1';

  // check book name
const checkBookNameExist = 
  'SELECT b FROM "Book" b WHERE b."BookName" = $1';

// add book, stock
const addBook =
  'INSERT INTO "Book" ("BookNumber", "BookName", "PublicationYear", "Pages", "PublisherName") VALUES ($1, $2, $3, $4, $5)';
  
const addStock =
  'INSERT INTO "Stored" ("BookNumber", "InventoryID", "Stock") VALUES ($1, $2, $3)';
  
const addWishlist =
  'INSERT INTO "Cart" ("WishlistID", "BookNumber", "AddedDate") VALUES ($1, $2, $3)';

const BookBought =
  'INSERT INTO "Bought" ("BookNumber", "CustomerNumber", "Date", "Price", "Quantity") VALUES ($1, $2, $3, $4, $5)';

  // remove stored, book
const removeStored = 
  'DELETE FROM "Stored" WHERE "BookNumber" = $1';  

const removeBook = 
  'DELETE FROM "Book" WHERE "BookNumber" = $1';

// update book and stock
const updateBook = 
  'UPDATE "Book" SET "BookName" = $1, "PublicationYear" = $2, "Pages" = $3, "PublisherName" = $4 WHERE "BookNumber" = $5';

const reduceStock =
  'UPDATE "Stored" SET "Stock" = "Stock"-$2 WHERE "BookNumber" = $1';

// search book by the name of the book
const searchBooksByKeywords = 
  `SELECT * FROM "Book" WHERE "BookName" ILIKE '%' || $1 || '%' ORDER BY "BookNumber" ASC`;


module.exports = {
  getBook,
  getBookById,
  getUserById,
  getWishlistByUserAccount,
  checkBookNameExist,
  addBook,
  removeBook,
  removeStored,
  updateBook,
  searchBooksByKeywords,
  addStock,
  addWishlist,
  BookBought,
  reduceStock,
};
