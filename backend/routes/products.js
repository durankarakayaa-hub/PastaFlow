const express = require("express");

const router = express.Router();

module.exports = (db) => {

  router.get("/", (req, res) => {

    db.all(
      "SELECT * FROM products",
      [],
      (err, rows) => {

        if (err) {
          return res.status(500).json(err);
        }

        res.json(rows);

      }
    );

  });

  return router;

};