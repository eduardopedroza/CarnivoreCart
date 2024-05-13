import React, { useState, useContext, useEffect } from "react";
import UserContext from "../auth/UserContext";
import Loading from "../components/Loading";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Avatar,
  Button,
} from "@nextui-org/react";
import CCApi from "../api/api";

export default function ProfileForm() {
  const { currentUser } = useContext(UserContext);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        shippingAddress: currentUser.shippingAddress,
      });
    }
  }, [currentUser]);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { username, companyName, contactInfo, ...userData } = formData;
      await CCApi.updateUser(currentUser.username, userData);
      setErrorMessage("");
      setSuccessMessage("Profile updated successfully");
    } catch (err) {
      setErrorMessage(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  if (!currentUser) {
    return <Loading />;
  }

  return (
    <div className="ProfileFormContainer">
      <Card style={{ width: "400px" }}>
        <CardHeader className="justify-between">
          <div className="flex gap-5">Edit Profile</div>
        </CardHeader>
        <CardBody>
          <div style={{ color: "red" }}>{errorMessage} </div>
          <div style={{ color: "green" }}>{successMessage}</div>
          <form onSubmit={handleSubmit}>
            <Input
              isDisabled
              autoFocus
              name="username"
              value={formData.username}
              onChange={handleChange}
              label="Username"
              variant="bordered"
              isRequired
            />

            <Input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              label="First Name"
              variant="bordered"
              isRequired
            />

            <Input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              label="Last Name"
              variant="bordered"
              isRequired
            />

            <Input
              isDisabled
              name="email"
              value={formData.email}
              onChange={handleChange}
              label="Email"
              variant="bordered"
              isRequired
            />

            <Input
              name="shippingAddress"
              value={formData.shippingAddress}
              onChange={handleChange}
              label="Shipping Address"
              variant="bordered"
              isRequired
            />
            <CardFooter>
              <Button type="submit" color="primary">
                Update
              </Button>
            </CardFooter>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
