const { createClient } = require("@libsql/client");
require("dotenv").config();

// const db = createClient({
//   url: process.env.DATABASE_URL,
//   authToken: process.env.TURSO_AUTH_TOKEN,
// });




const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

/**
 * Search for liquors by name or type
 * @param {string[]} terms - list of search terms (liquor names or types)
 * @returns {Promise<Object[]>} matched liquor records
 */
async function findLiquors(terms) {
  if (!Array.isArray(terms) || terms.length === 0) return [];

  const lowerTerms = terms.map(term => term.toLowerCase());

  const query = `
    SELECT * FROM liquors
    WHERE LOWER(name) IN (${lowerTerms.map(() => '?').join(',')})
       OR LOWER(type) IN (${lowerTerms.map(() => '?').join(',')})
  `;

  const values = [...lowerTerms, ...lowerTerms];

  const result = await client.execute(query, values);
  return result.rows || [];
}

module.exports = { findLiquors };
