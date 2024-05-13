import React, { useEffect, useContext, useState } from "react";
import { Button } from "@nextui-org/react";
import CCApi from "../api/api";
import UserContext from "../auth/UserContext";
import { useNavigate } from "react-router-dom";
import { SHOPPING_CART_STORAGE_KEY } from "../App";

const Success = () => {
  const { currentUser, currentShoppingCart, setCurrentShoppingCart } =
    useContext(UserContext);
  const [orderCreated, setOrderCreated] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (
      !orderCreated &&
      currentShoppingCart.length > 0 &&
      currentUser !== null &&
      currentUser.userId !== null
    ) {
      createOrder();
    }
  }, [orderCreated]);

  const createOrder = async () => {
    try {
      let pricePaidInCents = currentShoppingCart.reduce(
        (total, item) => total + item.product.priceInCents * item.quantity,
        0
      );

      const products = currentShoppingCart.map((item) => ({
        productId: item.product.productId.toString(),
        quantity: item.quantity,
        priceInCents: item.product.priceInCents,
      }));

      await CCApi.createOrder(
        currentUser.userId.toString(),
        products,
        pricePaidInCents
      );

      setOrderCreated(true);
      setCurrentShoppingCart([]);
      localStorage.setItem(SHOPPING_CART_STORAGE_KEY, JSON.stringify([]));
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  return (
    <div>
      <h1>Payment Success!</h1>
      <h1>Please check your email for your receipt and to track your order.</h1>
      <Button onPress={() => navigate("/products")}>Keep Shopping</Button>
    </div>
  );
};

export default Success;
