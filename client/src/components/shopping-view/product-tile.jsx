import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useToast } from "../../components/ui/use-toast";

const ShoppingProductTile = ({
  product,
  handleGetProductDetails,
  handleAddtoCart,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  // Check if product exists to prevent errors
  if (!product) {
    return <div className="p-4 border border-gray-200 rounded-md">Product data unavailable</div>;
  }

  const { title: name, price, image, salePrice, totalStock } = product;

  // Calculate discount percentage if salePrice exists
  const discount = salePrice && price > salePrice ? Math.round((price - salePrice) / price * 100) : 0;

  // Use salePrice as the discounted price if it exists
  const discountedPrice = salePrice || null;

  // Format price with currency
  const formatPrice = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Handle view product details
  const handleViewDetails = (productId) => {
    navigate(`/shop/details/${productId}`);
  };

  // Handle add to cart with authentication check
  const handleAddToCartClick = (e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Please log in to add items to the cart!",
        variant: "destructive",
      });
    } else {
      // Set loading state
      setIsAddingToCart(true);

      // Pass the product to the cart handler
      try {
        // Call the cart handler and handle the promise
        Promise.resolve(handleAddtoCart(product))
          .then(() => {
            // Reset loading state after a short delay to ensure the animation is visible
            setTimeout(() => {
              setIsAddingToCart(false);
            }, 800);
          })
          .catch(() => {
            setIsAddingToCart(false);
          });
      } catch (error) {
        // In case handleAddtoCart doesn't return a promise
        setTimeout(() => {
          setIsAddingToCart(false);
        }, 800);
      }
    }
  };

  // Handle wishlist/like functionality
  const handleLikeClick = (e) => {
    e.stopPropagation();
    setLiked(!liked);
    // Additional wishlist logic can be added here
  };

  // Determine if product has color options
  const hasColorOptions = product?.colors && product.colors.length > 0;

  return (
    <div className="group relative h-full flex flex-col">
      {/* Product Image with Hover Effect */}
      <div
        className="relative overflow-hidden bg-muted/20 cursor-pointer mb-3"
        onClick={() => handleViewDetails(product._id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main product image */}
        {image && image.length > 0 ? (
          <div className="h-[220px] md:h-full aspect-[3/4] overflow-hidden">
            <img
              src={image[0]}
              alt={name}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />

            {/* Second image on hover (if available) */}
            {image.length > 1 && (
              <img
                src={image[1]}
                alt={`${name} - alternate view`}
                className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}

            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''}`}></div>
          </div>
        ) : (
          <div className="aspect-[3/4] bg-muted/30 flex items-center justify-center">
            <p className="text-muted-foreground">No image</p>
          </div>
        )}

        {/* Discount badge */}
        {salePrice && price > salePrice && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
            {discount}% OFF
          </div>
        )}

        {/* Product Code Badge (if available) */}
        {product.productCode && (
          <div className="hidden md:block absolute top-2 right-2 bg-card text-card-foreground text-xs font-semibold px-2 py-1 rounded">
            Code: {product.productCode}
          </div>
        )}

        {/* Stock Status Badge */}
       {/*  {totalStock === 0 && (
          <div className="absolute top-10 left-2 bg-red-600 text-white text-xs font-medium px-2 py-1 rounded">
            Out of Stock
          </div>
        )} */}

        <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCartClick(e);
            }}
            className="bg-card hover:bg-primary hover:text-primary-foreground text-card-foreground p-2 rounded-full shadow-md transition-colors duration-300 relative"
            aria-label="Add to cart"
            disabled={isAddingToCart}
          >
            <ShoppingBag size={18} className={isAddingToCart ? "opacity-20" : ""} />

          </button>
          {isAddingToCart && (
              <span className="text-primary-foreground absolute inset-0 flex items-center justify-center text-md font-medium">
                Adding...
              </span>
            )}

          <button
            className="bg-card hover:bg-primary hover:text-primary-foreground text-card-foreground p-2 rounded-full shadow-md transition-colors duration-300"
            aria-label="Add to wishlist"
          >
            <Heart size={18} />
          </button>
        </div>


      </div>

      {/* Product Info */}
      <div className="flex-grow flex flex-col items-center">
        <h3
          className="text-lg font-medium mb-1 line-clamp-2 cursor-pointer hover:text-primary text-center"
          onClick={() => handleViewDetails(product._id)}
        >
          {name}
        </h3>
       {/*  {product.productCode && (
          <p className="text-sm text-gray-500">Code: {product.productCode}</p>
        )} */}


        <div className="mt-auto">
          <div className="flex items-center justify-center">
            {salePrice && price > salePrice ? (
              <>
                <span className="font-medium text-md text-foreground">{formatPrice(salePrice)}</span>
                <span className="ml-2 text-sm text-muted-foreground line-through">{formatPrice(price)}</span>
              </>
            ) : (
              <span className="font-medium text-md text-foreground">{formatPrice(price)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingProductTile;

