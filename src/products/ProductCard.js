import { useContext } from "react";
import { centsToDollars } from "../hooks/utils";
import { useNavigate } from "react-router-dom";
import StarRating from "../reviews/StarRating";
import UserContext from "../auth/UserContext";

export default function ProductCard({ product, key }) {
  const { addToCurrentShoppingCart } = useContext(UserContext);
  const navigate = useNavigate();

  const handlePress = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCurrentShoppingCart(product, 1);
  };

  const weightInKg = (product.weightInGrams / 1000).toFixed(3);

  return (
    <div
      className="ProductCardContainer"
      key={key}
      onClick={() => handlePress(product.productId)}
    >
      <div className="ProductCardBody">
        <img src={product.imageUrl} className="ProductImage" alt="Product" />
      </div>
      <div className="ProductCardFooter">
        <div className="ProductCardContent">
          <b className="ProductName">{product.name}</b>
          <p className="ProductWeight">{weightInKg} kg</p>
          <StarRating
            averageRating={parseFloat(product.averageRating)}
            totalReviews={parseFloat(product.totalReviews)}
            className="StarRating"
          />
          <p className="ProductPrice">{centsToDollars(product.priceInCents)}</p>
          <div>
            <button className="AddToCart" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
