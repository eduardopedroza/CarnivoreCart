import React from "react";
import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="Homepage">
      <div className="HomepageText">
        <h1>Welcome to CarnivoreCart,</h1>
        <h1>where quality meats meet convenience.</h1>
        <h4>Explore our selection and savor the difference with every bite</h4>
      </div>
      <div className="HomepageButton">
        <Button
          color="primary"
          variant="bordered"
          size="lg"
          onPress={() => navigate("/products")}
        >
          Shop Now
        </Button>
      </div>
    </div>
  );
}

export default HomePage;
