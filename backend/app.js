const express = require("express");

const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const productsRoutes = require("./routes/products");
const ordersRoutes = require("./routes/orders");
const reviewsRoutes = require("./routes/reviews");
const sellersRoutes = require("./routes/sellers");
const paymentRoutes = require("./routes/payment");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.use("/users", authenticateJWT, usersRoutes);
app.use("/products", authenticateJWT, productsRoutes);
app.use("/orders", authenticateJWT, ordersRoutes);
app.use("/reviews", authenticateJWT, reviewsRoutes);
app.use("/sellers", authenticateJWT, sellersRoutes);
app.use("/payment", authenticateJWT, paymentRoutes);

/** Handle 404 errors */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
