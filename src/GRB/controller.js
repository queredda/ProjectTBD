const pool = require("../../db");
const queries = require("./queries");

// function for get all of the book list
const getBook = (req, res) => {
  pool.query(queries.getBook, (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};

// function for get all of the book list from BookNumber
const getBookByID = (req, res) => {
  const id = parseInt(req.params.id);
  pool.query(queries.getBookById, [id], (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};

// function for get all of the wishlist from UserAccountId
const getWishlistByUserAccount = (req, res) => {
  const id = parseInt(req.params.id);
  pool.query(queries.getWishlistByUserAccount, [id], (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};

// function for add wishlist
const addWishlist = (req, res) => {
  const { WishlistID, BookNumber, AddedDate } = req.body;
  const Account = parseInt(req.params.account);

  pool.query(queries.getUserById, [Account], (error, results) => {
    pool.query(
      queries.addWishlist,
      [WishlistID, BookNumber, AddedDate],
      (error, results) => {
        if (error) {
          console.error("Error adding Wishlist", error.message);
          return res.status(500).send("An error occurred while adding stock");
        }
        res.status(201).send("Wishlist Added Succesfully!");
      }
    );
  });
};

// function for add new book
const addNewBook = (req, res) => {
  const {
    BookNumber,
    BookName,
    PublicationYear,
    Pages,
    PublisherName,
    InventoryID,
    Stock,
  } = req.body;

  // Check if required fields are provided
  if (
    !BookNumber ||
    !BookName ||
    !PublicationYear ||
    !Pages ||
    !PublisherName ||
    !InventoryID ||
    !Stock
  ) {
    return res.status(400).send("Missing required fields");
  }

  pool.connect((err, client, done) => {
    if (err) {
      console.error("Database connection error:", err);
      return res.status(500).send("Database connection error.");
    }

    // Check if BookName exists
    client.query(queries.checkBookNameExist, [BookName], (err, results) => {
      if (err) {
        done();
        console.error("Error checking book name existence:", err);
        return res.status(500).send("An error occurred.");
      }

      if (results.rows.length) {
        done();
        return res.status(400).send("BookName already exists.");
      }

      // Add book to database
      client.query(
        queries.addBook,
        [BookNumber, BookName, PublicationYear, Pages, PublisherName],
        (err, results) => {
          if (err) {
            done();
            console.error("Error adding book:", err);
            return res.status(500).send("An error occurred.");
          }

          // Add stock to the database
          client.query(
            queries.addStock,
            [BookNumber, InventoryID, Stock],
            (err, results) => {
              done(); // Release the client back to the pool
              if (err) {
                console.error("Error adding stock:", err);
                return res.status(500).send("An error occurred.");
              }
              res
                .status(201)
                .send("Book created and stock added successfully!");
            }
          );
        }
      );
    });
  });
};

// function for removing a book from book table
const removeBook = (req, res) => {
  const id = parseInt(req.params.id);

  pool.query(queries.getBookById, [id], (error, results) => {
    const noGRBfound = !results.rows.length;
    if (noGRBfound) {
      res.status(201).send("Book doesnt exist in the database");
    }

    pool.query(queries.removeStored, [id], (error, results) => {
      if (error) throw error;

      pool.query(queries.removeBook, [id], (error, results) => {
        if (error) throw error;
        res.status(200).send("Book removed successfully.");
      });
    });
  });
};

// function for updating BookName, PublicationYear, Pages, PublisherName
const updateBook = (req, res) => {
  const id = parseInt(req.params.id);
  const { BookName, PublicationYear, Pages, PublisherName } = req.body;

  pool.query(queries.getBookById, [id], (error, results) => {
    const noGRBfound = !results.rows.length;
    if (noGRBfound) {
      res.status(200).send("Book doesnt exist in the database");
    }

    pool.query(
      queries.updateBook,
      [BookName, PublicationYear, Pages, PublisherName, id],
      (error, results) => {
        if (error) throw error;
        res.status(200).send("Book updated successfully!");
      }
    );
  });
};

// function for searching book by Keywords or the name of the book
const searchBooks = (req, res) => {
  const { keywords } = req.query;

  if (!keywords || typeof keywords !== "string") {
    return res
      .status(400)
      .json({ error: "Invalid or missing keywords parameter" });
  }

  pool.query(queries.searchBooksByKeywords, [keywords], (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};

// function for searching book using filter and by user input
const buildQuery = (req, res) => {
  const { filters, sort, limit, offset } = req.body;
  // Query base
  let query =
    'SELECT b.*, s."Stock" FROM "Book" b LEFT JOIN "Stored" s ON b."BookNumber" = s."BookNumber"';
  let queryParams = [];
  let queryConditions = [];

  // Filters Query
  if (filters) {
    Object.keys(filters).forEach((key, index) => {
      if (typeof filters[key] === "object") {
        Object.keys(filters[key]).forEach((condition) => {
          let paramIndex = queryParams.length + 1;
          switch (condition) {
            case "gte":
              queryConditions.push(`"${key}" >= $${paramIndex}`);
              queryParams.push(filters[key][condition]);
              break;
            case "lte":
              queryConditions.push(`"${key}" <= $${paramIndex}`);
              queryParams.push(filters[key][condition]);
              break;
          }
        });
      } else {
        let paramIndex = queryParams.length + 1;
        queryConditions.push(`"${key}" = $${paramIndex}`);
        queryParams.push(filters[key]);
      }
    });
  }

  // Combine conditions with WHERE clause
  if (queryConditions.length > 0) {
    query += ` WHERE ${queryConditions.join(" AND ")}`;
  }

  // Sort Query
  if (sort) {
    query += ` ORDER BY "${sort.column}" ${sort.direction}`;
  }

  // Limit Query
  if (limit) {
    queryParams.push(limit);
    query += ` LIMIT $${queryParams.length}`;
  }

  // Execute the Built Query
  pool.query(query, queryParams, (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};

// TCL to add bought and reduce stock of the book on "Stored"
const BookBought = (req, res) => {
  const { BookNumber, CustomerNumber, Date, Price, Quantity } = req.body;

  pool.connect((err, client, done) => {
    if (err) {
      console.error("Database connection error:", err);
      return res.status(500).send("Database connection error.");
    }

    const handleError = (err) => {
      client.query("ROLLBACK", (rollbackErr) => {
        done();
        if (rollbackErr) {
          console.error("Rollback error:", rollbackErr);
        }
        console.error("Error in transaction:", err);
        res.status(500).send("An error occurred.");
      });
    };

    client.query("BEGIN", (err) => {
      if (err) return handleError(err);

      // Query to add the book purchase
      client.query(
        queries.BookBought,
        [BookNumber, CustomerNumber, Date, Price, Quantity],
        (err, results) => {
          if (err) return handleError(err);

          // Query to reduce the stock
          client.query(
            queries.reduceStock,
            [BookNumber, Quantity],
            (err, results) => {
              if (err) return handleError(err);

              client.query("COMMIT", (err) => {
                if (err) return handleError(err);
                done();
                res
                  .status(200)
                  .send("Book bought and stock updated successfully.");
              });
            }
          );
        }
      );
    });
  });
};

module.exports = {
  getBook,
  getBookByID,
  getWishlistByUserAccount,
  removeBook,
  updateBook,
  searchBooks,
  buildQuery,
  addWishlist,
  BookBought,
  addNewBook,
};
