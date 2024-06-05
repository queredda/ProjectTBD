const { Router } = require("express");
const controller = require("./controller");

const router = Router();

//Router to get
router.get("/book", controller.getBook);
router.get("/book/:id", controller.getBookByID);
router.get("/account/wishlist/:id", controller.getWishlistByUserAccount);
router.get("/search", controller.searchBooks);

//Router to update
router.put("/book/:id", controller.updateBook);

//Router to post
router.post("/bought", controller.BookBought);
router.post("/add/book", controller.addNewBook);
router.post("/add/wishlist", controller.addWishlist);
router.post("/book-query", controller.buildQuery);

//Router to delete
router.delete("/remove/book/:id", controller.removeBook);

module.exports = router;
