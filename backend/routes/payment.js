const jsonschema = require("jsonschema");
const express = require("express");
const router = new express.Router();

router.post("/create-checkout-session", async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const { shoppingCart } = req.body;

  const lineItems = shoppingCart.map((item) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
          images: [item.product.imageUrl],
        },
        unit_amount: item.product.priceInCents,
      },
      quantity: item.quantity,
    };
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `http://localhost:3000/success`,
    cancel_url: `http://localhost:3000/checkout?error=payment_canceled`,
  });

  res.json(session.id.toString());
});

module.exports = router;
