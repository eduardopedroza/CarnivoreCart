import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Checkbox,
  Input,
  Link,
} from "@nextui-org/react";

export default function LoginModal({
  isOpen,
  onClose,
  onOpen,
  login,
  switchToSignup,
}) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      setErrorMessage("");
      onClose();
    } catch (err) {
      setErrorMessage("Incorrect username or password");
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} placement="top-center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Log in</ModalHeader>
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
              />
              <Input
                name="password"
                value={formData.password}
                onChange={handleChange}
                label="Password"
                placeholder="Enter your password"
                type="password"
                variant="bordered"
              />
              <Button
                color="danger"
                variant="flat"
                onPress={onClose}
                className="mt-2"
              >
                Close
              </Button>
              <Button type="submit" color="primary">
                Sign in
              </Button>
              <ModalFooter>
                <div className="flex py-2 px-1 justify-between">
                  {"Don't have an account?  "}
                  <Link
                    color="primary"
                    size="sm"
                    onClick={switchToSignup}
                    className="cursor-pointer hover:underline"
                  >
                    Sign Up
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
