const pg = require("pg");
const { getDatabaseUri } = require("./config");

const conString = getDatabaseUri();
const db = new pg.Client({
  connectionString: conString,
  ssl: {
    rejectUnauthorized: false,
  },
});

db.connect(function (err) {
  if (err) {
    return console.error("could not connect to postgres", err);
  }
  db.query('SELECT NOW() AS "theTime"', function (err, result) {
    if (err) {
      return console.error("error running query", err);
    }
  });
});

module.exports = db;
