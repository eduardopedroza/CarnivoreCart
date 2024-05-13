import React, { useState, useEffect } from "react";
import { NextUIProvider } from "@nextui-org/react";
import Loading from "./components/Loading";
import UserContext from "./auth/UserContext";
import useLocalStorage from "./hooks/useLocalStorage";
import NavBar from "./routes-nav/NavBar";
import Routes from "./routes-nav/Routes";
import CCApi from "./api/api";
import { jwtDecode } from "jwt-decode";
import "./App.css";

export const TOKEN_STORAGE_ID = "carnivorecart-token";
export const SHOPPING_CART_STORAGE_KEY = "carnivorecart-shopping-cart";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useLocalStorage(TOKEN_STORAGE_ID, null);
  const [isLoading, setIsLoading] = useState(false);
  const [shoppingCart, setShoppingCart] = useState([]);

  useEffect(() => {
    const storedShoppingCart = localStorage.getItem(SHOPPING_CART_STORAGE_KEY);
    if (storedShoppingCart !== null && storedShoppingCart.length > 0) {
      try {
        const parsedShoppingCart = JSON.parse(storedShoppingCart);
        setShoppingCart(parsedShoppingCart);
      } catch (error) {
        console.error("Error parsing shopping cart data:", error);
        setShoppingCart([]);
      }
    }
  }, []);

  const updateShoppingCart = (newShoppingCart) => {
    setShoppingCart(newShoppingCart);
    localStorage.setItem(
      SHOPPING_CART_STORAGE_KEY,
      JSON.stringify(newShoppingCart)
    );
  };

  useEffect(() => {
    async function fetchUser() {
      if (token) {
        setIsLoading(true);
        try {
          const { username } = jwtDecode(token);
          CCApi.token = token;
          let currentUser = await CCApi.getCurrentUser(username);
          setCurrentUser(currentUser);
        } catch (e) {
          console.error("Error fetching user:", e);
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchUser();
  }, [token]);

  const signupUser = async (user) => {
    try {
      let token = await CCApi.signupUser(user);
      console.log(token);
      setToken(token);
      const { username } = jwtDecode(token);
      console.log(username);
      CCApi.token = token;
      let currentUser = await CCApi.getCurrentUser(username);
      setCurrentUser(currentUser);
      return { success: true };
    } catch (e) {
      console.error("Error signing up:", e);
    }
  };

  const signupSeller = async (user) => {
    try {
      let token = await CCApi.signupSeller(user);
      setToken(token);
      const { username } = jwtDecode(token);
      CCApi.token = token;
      let currentUser = await CCApi.getCurrentUser(username);
      setCurrentUser(currentUser);
      return { success: true };
    } catch (e) {
      console.error("Error signing up:", e);
    }
  };

  const login = async (user) => {
    try {
      let token = await CCApi.login(user);
      setToken(token);
      return { success: true };
    } catch (e) {
      throw e;
    }
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
  };

  const addToCurrentShoppingCart = (product, quantity) => {
    const existingItemIndex = shoppingCart.findIndex(
      (item) => item.product.productId === product.productId
    );

    if (existingItemIndex !== -1) {
      const updatedShoppingCart = [...shoppingCart];
      updatedShoppingCart[existingItemIndex].quantity += quantity;
      updateShoppingCart(updatedShoppingCart);
    } else {
      updateShoppingCart([...shoppingCart, { product, quantity }]);
    }
  };

  const removeFromCurrentShoppingCart = (productId) => {
    const updatedShoppingCart = shoppingCart.filter(
      (item) => item.product.productId !== productId
    );
    updateShoppingCart(updatedShoppingCart);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <NextUIProvider>
      <UserContext.Provider
        value={{
          currentUser,
          setCurrentUser,
          currentShoppingCart: shoppingCart,
          setCurrentShoppingCart: setShoppingCart,
          addToCurrentShoppingCart,
          removeFromCurrentShoppingCart,
        }}
      >
        <div className="app">
          <NavBar
            login={login}
            signupUser={signupUser}
            signupSeller={signupSeller}
            logout={logout}
          />
          <Routes />
        </div>
      </UserContext.Provider>
    </NextUIProvider>
  );
}

export default App;
