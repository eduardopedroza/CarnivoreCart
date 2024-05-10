import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Link,
} from "@nextui-org/react";

export default function SignupModal({
  isOpen,
  onOpen,
  onClose,
  signupSeller,
  signupUser,
  switchToLogin,
}) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    shippingAddress: "",
    companyName: "",
    contactInfo: "",
    isSeller: false,
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(formData.email)) {
      setErrorMessage("Please enter a valid email");
    } else {
      try {
        if (formData.isSeller) {
          const { isSeller, ...sellerData } = formData;
          await signupSeller(sellerData);
          setErrorMessage("");
          onClose(); // Only close the modal if the sign-up was successful
        } else {
          const { isSeller, companyName, contactInfo, ...userData } = formData;
          await signupUser(userData);
          setErrorMessage("");
          onClose(); // Only close the modal if the sign-up was successful
        }
      } catch (err) {
        setErrorMessage(err.message); // Display the error message
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSignupTypeToggle = () => {
    setFormData({
      ...formData,
      isSeller: !formData.isSeller,
    });
  };

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} placement="top-center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Sign Up</ModalHeader>
          <ModalBody>
            <div style={{ color: "red" }}>{errorMessage}</div>
            <form onSubmit={handleSubmit}>
              <Input
                autoFocus
                name="username"
                value={formData.username}
                onChange={handleChange}
                label="Username"
                placeholder="Enter your username"
                variant="bordered"
                isRequired
              />

              <Input
                name="password"
                value={formData.password}
                onChange={handleChange}
                label="Password"
                placeholder="Enter your password"
                type="password"
                variant="bordered"
                isRequired
              />

              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                label="First Name"
                placeholder="Enter your first name"
                variant="bordered"
                isRequired
              />

              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                label="Last Name"
                placeholder="Enter your last name"
                variant="bordered"
                isRequired
              />

              <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
                label="Email"
                placeholder="Enter your email"
                variant="bordered"
                isRequired
              />

              <Input
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={handleChange}
                label="Shipping Address"
                placeholder="Enter your shipping address"
                variant="bordered"
                isRequired
              />

              {formData.isSeller && (
                <>
                  <Input
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    label="Company Name"
                    placeholder="Enter your company name"
                    variant="bordered"
                    isRequired
                  />
                  <Input
                    name="contactInfo"
                    value={formData.contactInfo}
                    onChange={handleChange}
                    label="Contact Info"
                    placeholder="Enter your contact information"
                    variant="bordered"
                    isRequired
                  />
                </>
              )}
              <div className="flex py-2 px-1 justify-between">
                <Link
                  color="primary"
                  size="sm"
                  onClick={handleSignupTypeToggle}
                  className="cursor-pointer hover:underline"
                >
                  {formData.isSeller ? "Sign up as User" : "Sign up as Seller"}
                </Link>
              </div>
              <Button color="danger" variant="flat" onPress={onClose}>
                Close
              </Button>
              <Button type="submit" color="primary">
                Sign Up
              </Button>
              <ModalFooter>
                <div className="flex py-2 px-1 justify-between">
                  {"Already have an account?  "}
                  <Link
                    color="primary"
                    size="sm"
                    onClick={switchToLogin}
                    className="cursor-pointer hover:underline"
                  >
                    Log In
                  </Link>
                </div>
              </ModalFooter>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
