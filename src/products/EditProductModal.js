import React, { useState, useContext, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";
import CCApi from "../api/api";
import UserContext from "../auth/UserContext";

export default function EditProductModal({
  isOpen,
  onClose,
  onOpen,
  onProductUpdated,
  product,
}) {
  const { currentUser } = useContext(UserContext);

  const [formData, setFormData] = useState({
    name: product?.name,
    description: product?.description,
    priceInCents: product?.priceInCents,
    cutType: product?.cutType,
    weightInGrams: product?.weightInGrams,
    imageUrl: product?.imageUrl,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        priceInCents: (parseFloat(product.priceInCents) / 100).toFixed(2),
        cutType: product.cutType,
        weightInGrams: product.weightInGrams,
        imageUrl: product.imageUrl,
      });
    }
  }, [product]);

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
      const { name, cutType, sellerId, ...updateData } = formData;
      await CCApi.updateProduct(product.productId, updateData);
      setErrorMessage("");
      onClose();
      onProductUpdated();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async () => {
    try {
      await CCApi.deleteProduct(product.productId);
      onClose();
      onProductUpdated();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} placement="top-center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Edit Product
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
                isDisabled
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
              <Input
                name="cutType"
                value={formData.cutType}
                onChange={handleChange}
                label="Cut Type"
                placeholder="Enter cut type"
                variant="bordered"
                isDisabled
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
              <ModalFooter className="justify-between">
                <Button color="danger" variant="flat" onPress={handleDelete}>
                  Delete Product
                </Button>
                <Button type="submit" color="primary">
                  Save Changes
                </Button>
              </ModalFooter>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
