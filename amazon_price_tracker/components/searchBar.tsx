"use client";
import { scrpeAndStoreProduct } from "@/lib/actions";
import React, { FormEvent } from "react";
import { useState } from "react";

const SearchBar = () => {
  const [searchPrompt, setSearchPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<any>(null); // New state to store the product data

  const isValidAmazonUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;

      if (
        hostname.includes("amazon.com") ||
        hostname.includes("amazon.") ||
        hostname.endsWith("amazon")
      ) {
        return true;
      }
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValidLink = isValidAmazonUrl(searchPrompt);
    // if (!isValidLink) return alert("Please provide a valid Amazon link");

    try {
      setIsLoading(true);
      const productData = await scrpeAndStoreProduct(searchPrompt);
      setProduct(productData);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSubmit}>
        <input
          type="text"
          value={searchPrompt}
          onChange={(e) => setSearchPrompt(e.target.value)}
          placeholder="Enter product link"
          className="searchbar-input"
        />
        <button type="submit" className="searchbar-btn">
          {isLoading ? "Searching.." : "Search"}
        </button>
      </form>

      {/* Display the product data below the search bar */}
      {product && (
        <div className="mt-8">
          <h3 className="font-bold">Product Details</h3>
          <p>
            <strong>Name:</strong> {product.name}
          </p>
          <p>
            <strong>Price:</strong> {product.price}
          </p>
          {/* Add more fields as per the structure of your product */}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
