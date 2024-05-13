import React, { useState, useContext } from "react";
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
  Select,
  SelectSection,
  SelectItem,
} from "@nextui-org/react";
import CCApi from "../api/api";
import UserContext from "../auth/UserContext";

export default function NewProductModal({
  isOpen,
  onClose,
  onOpen,
  onProductCreated,
}) {
  const { currentUser } = useContext(UserContext);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priceInCents: "",
    meatType: "",
    cutType: "",
    weightInGrams: "",
    imageUrl: "",
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
      formData.sellerId = String(currentUser.userId);
      formData.weightInGrams = parseInt(formData.weightInGrams);

      let price = formData.priceInCents.replace(/,/g, "");
      if (!price.includes(".")) {
        formData.priceInCents = parseFloat(price) * 100;
      } else {
        formData.priceInCents = parseFloat(price.replace(".", ""));
      }

      await CCApi.createProduct(formData);
      setFormData({
        name: "",
        description: "",
        priceInCents: "",
        meatType: "",
        cutType: "",
        weightInGrams: "",
        imageUrl: "",
      });
      setErrorMessage("");
      onClose();
      onProductCreated();
    } catch (err) {
      console.log(err);
    }
  };

  const meatTypes = [
    { value: "Beef", label: "Beef" },
    { value: "Poultry", label: "Poultry" },
    { value: "Pork", label: "Pork" },
    { value: "Lamb", label: "Lamb" },
    { value: "Seafood", label: "Seafood" },
  ];

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} placement="top-center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Add New Product
          </ModalHeader>
          <ModalBody>
            <div style={{ color: "red" }}>{errorMessage}</div>
            <form onSubmit={handleSubmit}>
              <Input
                autoFocus
                name="name"
                value={formData.name}
                onChange={handleChange}
                label="Name"
                placeholder="Enter product name"
                variant="bordered"
                isRequired
              />
              <Input
                name="description"
                value={formData.description}
                onChange={handleChange}
                label="Description"
                placeholder="Enter product description"
                variant="bordered"
                isRequired
              />
              <Input
                name="priceInCents"
                type="number"
                label="Price"
                placeholder="0.00"
                value={formData.priceInCents}
                onChange={handleChange}
                variant="bordered"
                isRequired
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">$</span>
                  </div>
                }
              />
              <Select
                label="Select meat type"
                name="meatType"
                onChange={handleChange}
                variant="bordered"
              >
                {meatTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </Select>
              <Input
                name="cutType"
                value={formData.cutType}
                onChange={handleChange}
                label="Cut Type"
                placeholder="Enter cut type"
                variant="bordered"
                isRequired
              />
              <Input
                name="weightInGrams"
                value={formData.weightInGrams}
                onChange={handleChange}
                label="Weight (grams)"
                placeholder="Enter weight in grams"
                variant="bordered"
                isRequired
              />
              <Input
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                label="Image URL"
                placeholder="Enter image URL"
                variant="bordered"
                isRequired
              />
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Close
                </Button>
                <Button type="submit" color="primary">
                  Add Product
                </Button>
              </ModalFooter>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
