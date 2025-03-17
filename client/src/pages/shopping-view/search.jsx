import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Input } from "@/components/ui/input";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useToast } from "@/components/ui/use-toast";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

function SearchProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [keyword, setKeyword] = useState(initialQuery);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const { productList } = useSelector((state) => state.shopProducts);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);

  const { toast } = useToast();

  // Popular saree searches
  const popularSearches = [
    "Silk Sarees",
    "Banarasi Sarees",
    "Cotton Sarees",
    "Kanjivaram Sarees",
    "Designer Sarees",
    "Dresses",
    "Summer Collection"
  ];

  // Update search results with a small delay to prevent UI flicker
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (keyword.trim().length > 0) {
      setIsLoading(true);
      // Update URL query parameter
      setSearchParams({ q: keyword });

      // Small timeout to simulate loading and prevent UI flicker
      const timer = setTimeout(() => {
        const filteredProducts = productList.filter((product) =>
          product.title.toLowerCase().includes(keyword.toLowerCase())
        );
        setSuggestions(filteredProducts);
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setSearchParams({});
    }
  }, [keyword, productList, setSearchParams]);

  // Focus input on page load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  function handleAddtoCart(getCurrentProductId, totalStock, product) {
    // Find the product in the product list
    const currentProduct = product || productList.find((p) => p._id === getCurrentProductId);

    if (!currentProduct) {
      toast({
        title: "Product not found",
        variant: "destructive",
      });
      return;
    }

    // Check if the product has colors
    const hasColors = currentProduct.colors && currentProduct.colors.length > 0;

    // Use the first color if available, otherwise null
    const colorId = hasColors ? currentProduct.colors[0]._id : null;

    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
        colorId: colorId,
        product: currentProduct // Pass the entire product for reference
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  const handleViewDetails = (productId) => {
    navigate(`/shop/details/${productId}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // The search is already handled by the useEffect updating the URL
    // This is just to handle the form submission
  };

  function handleKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
      );
    } else if (event.key === "Enter") {
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        handleViewDetails(suggestions[highlightedIndex]._id);
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-light mb-6 text-center">Search our store</h2>
        <form onSubmit={handleSearch} className="flex items-center border-b border-gray-300 pb-2 mb-6">
          <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setHighlightedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search for products..."
            className="w-full bg-transparent text-lg outline-none"
            autoFocus
          />
          <button type="submit" className="text-gray-700 hover:text-black transition-colors">
            <Search className="h-5 w-5" />
          </button>
        </form>

        {/* Popular Searches */}
        <div className="mb-8">
          <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Popular Searches</h3>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => {
                  setKeyword(term);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded-full transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      )}

      {/* No results message */}
      {!isLoading && keyword.trim().length > 0 && suggestions.length === 0 && (
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-2">No results found</h1>
          <p className="text-gray-600">
            We couldn't find any products matching "{keyword}"
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Try a different search term or browse our categories
          </p>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && keyword.trim().length > 0 && suggestions.length > 0 && (
        <div>
          <h3 className="text-xl font-medium mb-4">
            {suggestions.length} {suggestions.length === 1 ? 'result' : 'results'} for "{keyword}"
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {suggestions.map((item) => (
              <ShoppingProductTile
                key={item._id}
                handleAddtoCart={handleAddtoCart}
                product={item}
                handleGetProductDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchProducts;