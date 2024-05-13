import React, { useState, useEffect } from "react";
import CCApi from "../api/api";
import ProductCard from "./ProductCard";
import { Listbox, ListboxSection, ListboxItem, Input } from "@nextui-org/react";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState({});
  const [searchInput, setSearchInput] = useState("");

  const minPrice = (priceRange) => {
    switch (priceRange) {
      case "under10":
        return 0.01;
      case "10to25":
        return 10;
      case "25to50":
        return 25;
      default:
        return 50;
    }
  };

  const maxPrice = (priceRange) => {
    switch (priceRange) {
      case "under10":
        return 9.99;
      case "10to25":
        return 25;
      case "25to50":
        return 50;
      default:
        return Infinity;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await CCApi.getAllProducts();
      setProducts(data);
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter((product) => {
    const filterType = Object.keys(selectedFilter)[0];
    const filterValue = selectedFilter[filterType];

    let matchesFilter = true;

    if (filterType === "priceRange") {
      matchesFilter =
        product.priceInCents >= minPrice(filterValue) * 100 &&
        product.priceInCents <= maxPrice(filterValue) * 100;
    } else if (filterType === "name") {
      matchesFilter = product.name
        .toLowerCase()
        .includes(searchInput.toLowerCase());
    } else {
      matchesFilter = product[filterType] === filterValue;
    }

    if (searchInput) {
      matchesFilter =
        matchesFilter &&
        product.name.toLowerCase().includes(searchInput.toLowerCase());
    }

    return matchesFilter;
  });

  return (
    <div className="MainContainer">
      <div className="Categories">
        <Input
          variant="underlined"
          radius="sm"
          placeholder="Type to search..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Listbox
          aria-label="Single selection"
          variant="flat"
          disallowEmptySelection
          selectionMode="single"
        >
          <ListboxSection title="Meat Type">
            <ListboxItem onClick={() => setSelectedFilter({})}>All</ListboxItem>
            <ListboxItem
              onClick={() => setSelectedFilter({ meatType: "Beef" })}
            >
              Beef
            </ListboxItem>
            <ListboxItem
              onClick={() => setSelectedFilter({ meatType: "Poultry" })}
            >
              Poultry
            </ListboxItem>
            <ListboxItem
              onClick={() => setSelectedFilter({ meatType: "Pork" })}
            >
              Pork
            </ListboxItem>
            <ListboxItem
              onClick={() => setSelectedFilter({ meatType: "Lamb" })}
            >
              Lamb
            </ListboxItem>
            <ListboxItem
              onClick={() => setSelectedFilter({ meatType: "Seafood" })}
            >
              Seafood
            </ListboxItem>
          </ListboxSection>
          <ListboxSection title="Price">
            <ListboxItem
              onClick={() => setSelectedFilter({ priceRange: "under10" })}
            >
              Under $10
            </ListboxItem>
            <ListboxItem
              onClick={() => setSelectedFilter({ priceRange: "10to25" })}
            >
              $10 - $25
            </ListboxItem>
            <ListboxItem
              onClick={() => setSelectedFilter({ priceRange: "25to50" })}
            >
              $25 - $50
            </ListboxItem>
            <ListboxItem
              onClick={() => setSelectedFilter({ priceRange: "over50" })}
            >
              Over $50
            </ListboxItem>
          </ListboxSection>
        </Listbox>
      </div>
      <div className="ProductList">
        {filteredProducts.length ? (
          <div className="ProductList List">
            {filteredProducts.map((p) => (
              <ProductCard product={p} key={p.productId} />
            ))}
          </div>
        ) : (
          <p>No products available</p>
        )}
      </div>
    </div>
  );
}
