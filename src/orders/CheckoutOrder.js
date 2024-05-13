import React, { useContext, useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Card,
  CardBody,
  CardFooter,
  Image,
  CardHeader,
} from "@nextui-org/react";
import { loadStripe } from "@stripe/stripe-js";
import UserContext from "../auth/UserContext";
import { centsToDollars } from "../hooks/utils";
import { TrashCan } from "../icons/Icons";
import Alert from "../components/Alert";

export default function CheckoutOrder() {
  const { currentUser, currentShoppingCart, removeFromCurrentShoppingCart } =
    useContext(UserContext);

  console.log("currentShoppingCart:", currentShoppingCart);
  const [showAlert, setShowAlert] = useState(false);

  const calculateSubtotal = (item) => {
    return item.product.priceInCents * item.quantity;
  };

  const makePayment = async () => {
    const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

    const body = {
      shoppingCart: currentShoppingCart,
    };

    const headers = {
      "Content-Type": "application/json",
    };

    const sessionId = await fetch(
      `http://localhost:3001/payment/create-checkout-session`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      }
    ).then((res) => res.text());

    const cleanedSessionId = sessionId.replace(/"/g, "");

    const result = await stripe.redirectToCheckout({
      sessionId: cleanedSessionId,
    });
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const error = queryParams.get("error");
    if (error) {
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
    }
  }, []);

  return (
    <div className="CheckoutContainer">
      {showAlert && (
        <Alert
          message="Payment was canceled."
          onClose={() => setShowAlert(false)}
        />
      )}
      <div className="TableCntainer">
        <Table aria-label="Checkout orde table">
          <TableHeader>
            <TableColumn>Product</TableColumn>
            <TableColumn>Price</TableColumn>
            <TableColumn>Quantity</TableColumn>
            <TableColumn>Subtotal</TableColumn>
            <TableColumn>Delete</TableColumn>
          </TableHeader>
          <TableBody>
            {currentShoppingCart.map((item) => (
              <TableRow key={item.product.productId}>
                <TableCell>{item.product.name}</TableCell>
                <TableCell>
                  {centsToDollars(item.product.priceInCents)}
                </TableCell>
                <TableCell className="items-center">{item.quantity}</TableCell>
                <TableCell>{centsToDollars(calculateSubtotal(item))}</TableCell>
                <TableCell>
                  <Button
                    color="error"
                    onPress={() =>
                      removeFromCurrentShoppingCart(item.product.productId)
                    }
                  >
                    <TrashCan />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="CheckoutTotal">
        <Card>
          <CardHeader>Order Details</CardHeader>
          <CardBody>
            Total:{" "}
            {centsToDollars(
              currentShoppingCart.reduce(
                (acc, item) => acc + item.product.priceInCents * item.quantity,
                0
              )
            )}
          </CardBody>
          <CardFooter>
            <Button color="primary" variant="flat" onPress={makePayment}>
              Pay
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// Create an orderLocalStorage and store the current order inside.
// If it is a successful payment, then create an order and store data inside database
// If it is canceled, then delete order from context
