import React, { useState, useContext, useEffect } from "react";
import UserContext from "../auth/UserContext";
import CCApi from "../api/api";
import SellerProductCard from "./SellerProductCard";
import NewProductModal from "./NewProductModal";
import EditProductModal from "./EditProductModal";
import { Button } from "@nextui-org/react";

export default function SellerProductList() {
  const { currentUser } = useContext(UserContext);

  const [products, setProducts] = useState([]);
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setEditProductModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleEditPress = (product) => {
    setSelectedProduct(product);
    openEditProductModal();
  };

  const openEditProductModal = () => {
    setEditProductModalOpen(true);
  };

  const closeEditProductModal = () => {
    setEditProductModalOpen(false);
  };

  const openProductModal = () => {
    setProductModalOpen(true);
  };

  const closeProductModal = () => {
    setProductModalOpen(false);
  };

  useEffect(() => {
    if (currentUser) {
      search();
    }
  }, [currentUser]);

  const search = async () => {
    setLoading(true);
    try {
      let products = await CCApi.getAllProducts(currentUser.userId);
      setProducts(products);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="SellerProductsContainer">
        <div className="SellerProductHeader">
          <h1 className="text-xl font-bold">Your Products</h1>
          <Button color="primary" onClick={openProductModal}>
            Add New Product
          </Button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="SellerProductList">
            {products.length ? (
              products.map((p) => (
                <SellerProductCard
                  key={p.productId}
                  product={p}
                  onEdit={() => handleEditPress(p)}
                />
              ))
            ) : (
              <p>No products available</p>
            )}
          </div>
        )}
      </div>
      <NewProductModal
        isOpen={isProductModalOpen}
        onClose={closeProductModal}
        onOpen={openProductModal}
        onProductCreated={search}
      />
      <EditProductModal
        isOpen={isEditProductModalOpen}
        onClose={closeEditProductModal}
        onOpen={openEditProductModal}
        onProductUpdated={search}
        product={selectedProduct}
      />
    </div>
  );
}
