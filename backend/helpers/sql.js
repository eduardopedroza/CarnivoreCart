const { BadRequestError } = require("../expressError");

/**
 * Creates SQL SET clause and values for a partial update query.
 *
 * This function takes an object containing data to update and a mapping object
 * for converting JavaScript-style keys to SQL column names. It returns an object
 * with `setCols` and `values` properties to be used in an SQL query.
 *
 * @param {Object} dataToUpdate - The data to update in the form of {key: value}.
 * @param {Object} columnMapping - An object mapping JavaScript-style keys to SQL column names.
 * @returns {Object} An object with `setCols` and `values` properties.
 * @throws {Error} Throws an error if no data is provided.
 */

function createSqlSetClause(dataToUpdate, columnMapping) {
  // Check if dataToUpdate is empty
  if (Object.keys(dataToUpdate).length === 0) {
    throw new BadRequestError("No data provided");
  }

  // Convert dataToUpdate to SQL SET clause format
  const setCols = Object.entries(dataToUpdate).map(([key, value], index) => {
    const columnName = columnMapping[key] || key;
    return `"${columnName}"=$${index + 1}`;
  });

  const values = Object.values(dataToUpdate);

  return { setCols: setCols.join(", "), values };
}

module.exports = { createSqlSetClause };
