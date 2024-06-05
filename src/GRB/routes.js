const { Router } = require("express");
const controller = require("./controller");

const router = Router();

router.get("/book", controller.getBook);
router.get("/book/:id", controller.getBookByID);
router.get("/account/wishlist/:id", controller.getWishlistByUserAccount);
router.get("/search", controller.searchBooks);

router.put("/book/:id", controller.updateBook);

router.post("/bought", controller.BookBought);
router.post("/add/book", controller.addNewBook);
router.post("/add/wishlist", controller.addWishlist);
router.post("/book-query", controller.buildQuery);

router.delete("/remove/book/:id", controller.removeBook);

module.exports = router;
