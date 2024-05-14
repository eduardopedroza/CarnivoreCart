/** Middleware to handle common auth cases in routes */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

/** Middleware: Authenticate user
 *
 * This middleware is responsible for authenticating users.
 * It verifies whether a token was provided with the request.
 * If a token is provided and valid, it extracts the payload of the token
 *
 * No error if no token was provided or if the token is not valid
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError("Authorization header missing");
    }

    const token = authHeader.replace(/^[Bb]earer /, "").trim();
    if (!token) {
      throw new UnauthorizedError("Token not provided");
    }

    const payload = jwt.verify(token, SECRET_KEY);
    res.locals.user = payload;
    return next();
  } catch (e) {
    return next(new UnauthorizedError("Invalid token"));
  }
}

/** Middleware to ensure the current use is logged in
 *
 * If not, raises Unauthorized
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (e) {
    return next(e);
  }
}

/** Middleware to use when to ensure if the user is an admin
 *
 * If not, raises unauthorized
 */

function ensureAdmin(req, res, next) {
  try {
    if (!res.locals.user || !res.locals.user.isAdmin) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (e) {
    return next(e);
  }
}

/** Middleware to use when they must provide a valid token & be user matching
 *  username provided as route param.
 *
 *  If not, raises Unauthorized.
 */

function ensureCorrectUserOrAdmin(req, res, next) {
  try {
    const user = res.locals.user;
    if (!(user && (user.isAdmin || user.username === req.params.username))) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (e) {
    return next(e);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUserOrAdmin,
};
