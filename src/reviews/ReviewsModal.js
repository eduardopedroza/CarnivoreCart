import React from "react";
import StarRating from "./StarRating";
import { formatDate } from "../hooks/utils";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";

export default function ReviewsModal({
  isOpen,
  onClose,
  reviews,
  totalReviews,
  averageRating,
}) {
  return (
    <Modal
      scrollBehavior="inside"
      placement="center"
      size="4xl"
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader>Reviews</ModalHeader>
        <ModalBody>
          <div className="ReviewsModalContent">
            <div className="ReviewsLeftColumn">
              <div className="AverageRatingContainer">
                <span className="AverageRating">
                  {averageRating.toFixed(2)}
                </span>
                <div className="StarsAndTotalReviews">
                  <StarRating
                    averageRating={averageRating}
                    totalReviews={totalReviews}
                    showRating={false}
                  />
                  <span className="TotalReviews">({totalReviews} reviews)</span>
                </div>
              </div>
            </div>

            <div className="ReviewsRightColumn">
              <ul className="ReviewsList">
                {reviews.map((review) => (
                  <li className="ReviewListItem" key={review.reviewId}>
                    <div className="TopRight">
                      {formatDate(review.reviewDate)}
                    </div>
                    <div className="TopLeft">
                      <StarRating
                        averageRating={review.rating}
                        totalReviews={1}
                        showRating={false}
                      />
                    </div>
                    <div className="ReviewComment">{review.comment}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  );
}
