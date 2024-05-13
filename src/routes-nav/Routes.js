import React from "react";
import { Routes as Rts, Route, Navigate } from "react-router-dom";
import HomePage from "../homepage/Homepage";
import ProfileForm from "../profiles/ProfileForm";
import ProductList from "../products/ProductList";
import SellerProductList from "../products/SellerProductList";
import ProductDetail from "../products/ProductDetail";
import CheckoutOrder from "../orders/CheckoutOrder";
import Success from "../stripe/Success";

function Routes() {
  return (
    <Rts>
      <Route path="/" element={<HomePage />} />
      <Route path="/profile/:username" element={<ProfileForm />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/seller-products" element={<SellerProductList />} />
      <Route path="/products/:productId" element={<ProductDetail />} />
      <Route path="/checkout" element={<CheckoutOrder />} />
      <Route path="/success" element={<Success />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Rts>
  );
}

export default Routes;
