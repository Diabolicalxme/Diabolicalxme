import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useToast } from "@/components/ui/use-toast";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { addToTempCart } from "@/utils/tempCartManager";

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
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);

  const { toast } = useToast();

  // Popular fashion searches
  const popularSearches = [
    "Streetwear",
    "Contemporary Fashion",
    "Designer Clothing",
    "Avant-garde",
    "Bold Fashion",
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
      setIsLoading(false); // Reset loading state when search text is cleared
    }
  }, [keyword, productList, setSearchParams]);

  // Focus input on page load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  function handleAddtoCart(getCurrentProductId, _, product) {
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
    const selectedColor = hasColors ? currentProduct.colors[0] : null;
    const colorId = selectedColor?._id || null;
    const quantity = 1;

    if (!isAuthenticated) {
      // NON-AUTHENTICATED: Add to temp cart (localStorage)
      const tempCartItem = {
        productId: getCurrentProductId,
        colorId: colorId,
        quantity: quantity,
        productDetails: {
          title: currentProduct.title,
          price: currentProduct.price,
          salePrice: currentProduct.salePrice,
          image: currentProduct.image?.[0] || '',
          category: currentProduct.category,
          productCode: currentProduct.productCode
        }
      };

      // Add with inventory validation
      const result = addToTempCart(tempCartItem, [currentProduct], cartItems || []);

      if (result.success) {
        toast({
          title: result.message,
        });
      } else {
        toast({
          title: result.message,
          variant: "destructive",
        });
      }
    } else {
      // AUTHENTICATED: Validate then add to actual cart
      const validation = validateAddToCart({
        productId: getCurrentProductId,
        colorId: colorId,
        quantityToAdd: quantity,
        cartItems: cartItems || [],
        tempCartItems: [], // No temp cart for authenticated users
        productList: [currentProduct],
        isAuthenticated: true
      });

      if (!validation.success) {
        toast({
          title: validation.message,
          variant: "destructive",
        });
        return;
      }

      // Add to database cart
      dispatch(
        addToCart({
          userId: user?.id,
          productId: getCurrentProductId,
          quantity: quantity,
          colorId: colorId,
          product: currentProduct // Pass the entire product for reference
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchCartItems(user?.id));
          toast({
            title: `${quantity} item${quantity > 1 ? 's' : ''} added to cart!`,
          });
        } else {
          toast({
            title: data?.payload?.message || "Failed to add item to cart",
            variant: "destructive",
          });
        }
      });
    }
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
        <h2 className="text-2xl font-light mb-6 text-center text-foreground">Search our store</h2>
        <form onSubmit={handleSearch} className="flex items-center border-b border-input pb-2 mb-6">
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
            className="w-full bg-transparent text-lg outline-none text-foreground placeholder:text-muted-foreground focus:ring-0"
            autoFocus
          />
          <button type="submit" className="text-muted-foreground hover:text-primary transition-colors">
            <Search className="h-5 w-5" />
          </button>
        </form>

        {/* Popular Searches */}
        <div className="mb-8">
          <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Popular Searches</h3>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => {
                  setKeyword(term);
                }}
                className="px-4 py-2 bg-muted/10 hover:bg-muted/20 text-sm rounded-full transition-colors text-foreground border border-input hover:border-primary"
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* No results message */}
      {!isLoading && keyword.trim().length > 0 && suggestions.length === 0 && (
        <div className="text-center py-12 bg-card p-8 rounded-md shadow-sm border border-input max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4 text-foreground">No results found</h1>
          <p className="text-foreground mb-4">
            We couldn't find any products matching "{keyword}"
          </p>
          <p className="text-muted-foreground mb-6">
            Try a different search term or browse our categories
          </p>
          <Button
            onClick={() => navigate('/shop/collections')}
            className="bg-primary text-primary-foreground hover:bg-transparent hover:text-foreground border border-primary transition-colors duration-300"
          >
            Browse Collections
          </Button>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && keyword.trim().length > 0 && suggestions.length > 0 && (
        <div>
          <h3 className="text-xl font-medium mb-6 text-foreground border-b border-input pb-4">
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