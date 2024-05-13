import { useState, useContext } from "react";
import UserContext from "../auth/UserContext";
import LoginModal from "../auth/LoginModal";
import SignupModal from "../auth/SignupModal";
import { useNavigate } from "react-router-dom";
import { centsToDollars } from "../hooks/utils";
import { ShoppingCart, TrashCan } from "../icons/Icons";
import Alert from "../components/Alert";

import {
  Navbar as Nav,
  Image,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Badge,
} from "@nextui-org/react";

function NavBar({ login, signupUser, signupSeller, logout }) {
  const { currentUser, currentShoppingCart, removeFromCurrentShoppingCart } =
    useContext(UserContext);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setSignupModalOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const navigate = useNavigate();

  const openLoginModal = () => {
    setLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
  };

  const openSignupModal = () => {
    setSignupModalOpen(true);
  };

  const closeSignupModal = () => {
    setSignupModalOpen(false);
  };
  const switchToSignup = () => {
    closeLoginModal();
    openSignupModal();
  };

  const switchToLogin = () => {
    closeSignupModal();
    openLoginModal();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleCheckoutPress = () => {
    if (currentUser && currentShoppingCart.length > 0) {
      navigate("/checkout");
    } else if (!currentUser) {
      openLoginModal();
    } else {
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
    }
  };

  console.log("currentShoppingCart:", currentShoppingCart);
  return (
    <Nav className="AppNavBar">
      <NavbarBrand>
        <Link color="foreground" href="/">
          CarnivoreCart
        </Link>
      </NavbarBrand>
      <NavbarContent justify="center">
        <NavbarItem>
          <Link color="foreground" href="/products">
            Meats
          </Link>
        </NavbarItem>
        {currentUser && currentUser.isSeller ? (
          <>
            <NavbarItem>
              <Link color="foreground" href="/seller-products">
                My Products
              </Link>
            </NavbarItem>
          </>
        ) : null}
        {currentUser ? (
          <>
            <NavbarItem>
              <Link
                color="foreground"
                href={`/profile/${currentUser.username}`}
              >
                My Profile
              </Link>
            </NavbarItem>
            {/* <NavbarItem>
              <Link color="foreground" href="/orders">
                My Orders
              </Link>
            </NavbarItem> */}
          </>
        ) : null}
      </NavbarContent>
      <NavbarContent justify="end">
        <Dropdown>
          <DropdownTrigger>
            <div className="ShoppingCartIcon relative">
              <Badge
                content={
                  currentShoppingCart.length > 0
                    ? currentShoppingCart
                        .reduce((total, item) => total + item.quantity, 0)
                        .toString()
                    : null
                }
                color="danger"
                placement="top-right"
              >
                <svg width="22" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M20.925 3.641H3.863L3.61.816A.896.896 0 0 0 2.717 0H.897a.896.896 0 1 0 0 1.792h1l1.031 11.483c.073.828.52 1.726 1.291 2.336C2.83 17.385 4.099 20 6.359 20c1.875 0 3.197-1.87 2.554-3.642h4.905c-.642 1.77.677 3.642 2.555 3.642a2.72 2.72 0 0 0 2.717-2.717 2.72 2.72 0 0 0-2.717-2.717H6.365c-.681 0-1.274-.41-1.53-1.009l14.321-.842a.896.896 0 0 0 .817-.677l1.821-7.283a.897.897 0 0 0-.87-1.114ZM6.358 18.208a.926.926 0 0 1 0-1.85.926.926 0 0 1 0 1.85Zm10.015 0a.926.926 0 0 1 0-1.85.926.926 0 0 1 0 1.85Zm2.021-7.243-13.8.81-.57-6.341h15.753l-1.383 5.53Z"
                    fill="#69707D"
                    fillRule="nonzero"
                  />
                </svg>
              </Badge>
            </div>
          </DropdownTrigger>

          <DropdownMenu
            variant="faded"
            aria-label="Shopping Cart Dropdown"
            closeOnSelect={false}
          >
            <DropdownSection title="Products" showDivider>
              {currentShoppingCart.map((item) => (
                <DropdownItem
                  key={item.product.productId}
                  description={`${centsToDollars(
                    item.product.priceInCents
                  )} x ${item.quantity}`}
                  startContent={
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      width="50"
                      height="50"
                    />
                  }
                  endContent={
                    <Button
                      onPress={() =>
                        removeFromCurrentShoppingCart(item.product.productId)
                      }
                      size="sm"
                      className="TrashCanButton"
                    >
                      <TrashCan />
                    </Button>
                  }
                >
                  {item.product.name}
                </DropdownItem>
              ))}
            </DropdownSection>
            <DropdownSection title="Total">
              <DropdownItem
                endContent={
                  <Button
                    color="primary"
                    onPress={handleCheckoutPress}
                    variant="flat"
                  >
                    Checkout
                  </Button>
                }
              >
                <div>
                  {centsToDollars(
                    currentShoppingCart.reduce(
                      (acc, item) =>
                        acc + item.product.priceInCents * item.quantity,
                      0
                    )
                  )}
                </div>
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
        {currentUser ? (
          <>
            <NavbarItem>
              <Button color="primary" onClick={handleLogout} variant="flat">
                Log Out
              </Button>
            </NavbarItem>
          </>
        ) : (
          <>
            <NavbarItem className="lg:flex">
              <Button color="primary" onPress={openLoginModal} variant="flat">
                Log In
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button color="primary" onPress={openSignupModal} variant="flat">
                Sign Up
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        login={login}
        switchToSignup={switchToSignup}
      />
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={closeSignupModal}
        signupUser={signupUser}
        signupSeller={signupSeller}
        switchToLogin={switchToLogin}
      />
      {showAlert && (
        <Alert
          message="Your cart is empty"
          onClose={() => setShowAlert(false)}
        />
      )}
    </Nav>
  );
}

export default NavBar;
