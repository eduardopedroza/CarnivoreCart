import React, { useState, useEffect, useContext } from "react";
import UserContext from "../auth/UserContext";
import { useParams } from "react-router-dom";
import { Button, Image } from "@nextui-org/react";
import { centsToDollars } from "../hooks/utils";
import CCApi from "../api/api";
import StarRating from "../reviews/StarRating";
import ReviewsModal from "../reviews/ReviewsModal";

export default function ProductDetail() {
  const { productId } = useParams();
  const { addToCurrentShoppingCart } = useContext(UserContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyName, setCompanyName] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const fetchedProduct = await CCApi.getProduct(productId);
        setProduct(fetchedProduct);
        const fetchedSeller = await CCApi.getSeller(fetchedProduct.sellerId);
        setCompanyName(fetchedSeller.companyName);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const openReviewsModal = () => {
    setReviewsModalOpen(true);
  };

  const closeReviewsModal = () => {
    setReviewsModalOpen(false);
  };

  const handleAddToCart = () => {
    if (quantity > 0) {
      addToCurrentShoppingCart(product, quantity);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const totalReviews = product.reviews.length;
  const totalRating = product.reviews.reduce(
    (acc, review) => acc + Number(review.rating),
    0
  );

  const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

  return (
    <div className="ProductDetail">
      <Image
        radius="lg"
        width="500px"
        height="500px"
        src={product.imageUrl}
        alt={product.name}
        className="ProductDetailImage"
      />
      <div className="ProductDetailData">
        <div className="ProductDetailCompanyName">
          <h2>{companyName}</h2>
        </div>
        <div className="ProductDetailName">
          <h1>{product.name}</h1>
        </div>
        <div className="ProductDetailReviews">
          <StarRating
            averageRating={averageRating}
            totalReviews={totalReviews}
            onClick={openReviewsModal}
            showRating={true}
          />
        </div>
        <div className="ProductDetailDescription">
          <p>{product.description}</p>
        </div>
        <div className="ProductDetailPrice">
          <p>{centsToDollars(product.priceInCents)}</p>
        </div>
        <div className="ProductDetailAddToCart">
          <Button
            variant="light"
            onPress={() => (quantity > 0 ? setQuantity(quantity - 1) : null)}
          >
            -
          </Button>
          <span style={{ padding: "0 20px" }}>{quantity}</span>
          <Button variant="light" onPress={() => setQuantity(quantity + 1)}>
            +
          </Button>
          <Button
            color="primary"
            variant="flat"
            onPress={() => handleAddToCart(product, quantity)}
          >
            Add to Cart
          </Button>
        </div>
      </div>
      <ReviewsModal
        isOpen={reviewsModalOpen}
        onClose={closeReviewsModal}
        reviews={product.reviews}
        totalReviews={totalReviews}
        averageRating={averageRating}
      />
    </div>
  );
}
