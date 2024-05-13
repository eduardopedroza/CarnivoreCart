import React from "react";

export default function StarRating({
  averageRating,
  totalReviews,
  onClick,
  showRating,
}) {
  const totalStars = 5;

  function roundRating(rating) {
    const roundedRating = Math.round(rating * 10) / 10;
    const filledStars = Math.floor(roundedRating);
    const hasHalfStar = roundedRating - filledStars >= 0.5;

    if (hasHalfStar) {
      return filledStars + 1;
    } else {
      return filledStars;
    }
  }

  const filledStars = roundRating(averageRating);

  const stars = [];
  for (let i = 1; i <= totalStars; i++) {
    const starClass = i <= filledStars ? "filled" : "empty";
    stars.push(
      <span key={i} className={`star ${starClass}`}>
        &#9733;
      </span>
    );
  }

  return (
    <div className="StarRating" onClick={onClick}>
      {showRating && (
        <span className="averageRating">{averageRating.toFixed(2)}</span>
      )}
      {stars}
      {showRating && (
        <span className="totalReviews">({totalReviews} reviews)</span>
      )}
    </div>
  );
}
