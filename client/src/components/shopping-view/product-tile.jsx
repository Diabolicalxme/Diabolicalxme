import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useToast } from "../ui/use-toast";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { motion } from "framer-motion";

function ShoppingProductTile({ product, handleAddtoCart }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleViewDetails = (productId) => {
    navigate(`/shop/details/${productId}`);
  };

  const handleAddToCartClick = (productId, totalStock) => {
    if (!isAuthenticated) {
      toast({
        title: "Please log in to add items to the cart!",
        variant: "destructive",
      });
    } else {
      // Pass the entire product to handle color selection properly
      handleAddtoCart(productId, totalStock, product);
    }
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    setLiked(!liked);
  };

  // Determine if product has color options
  const hasColorOptions = product?.colors && product.colors.length > 0;

  return (
    <Card className="w-full max-w-[320px] mx-auto shadow-lg rounded-none overflow-hidden border border-gray-100 group transition-all duration-300 hover:shadow-xl">
      {/* Image container */}
      <div
        className="relative cursor-pointer overflow-hidden"
        onClick={() => handleViewDetails(product?._id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-[250px] md:h-[400px] overflow-hidden">
          <img
            src={product?.image[0]}
            alt={product?.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Gradient overlay on hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''}`}></div>
        </div>

        {/* Like Button */}
        <button
          onClick={handleLikeClick}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md transition-transform duration-300 hover:scale-110"
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-muted text-muted' : 'text-gray-600'}`} />
        </button>

        {/* Dynamic Badges */}
        {product?.totalStock === 0 ? (
          <Badge className="absolute top-3 left-3 bg-red-700 text-white text-xs py-1 px-3 rounded-sm uppercase tracking-wider font-medium">
            Out Of Stock
          </Badge>
        ) : product?.totalStock < 10 ? (
          <Badge className="absolute top-3 left-3 bg-orange-600 text-white text-xs py-1 px-3 rounded-sm uppercase tracking-wider font-medium">
            {`Only ${product?.totalStock} left`}
          </Badge>
        ) : product?.salePrice > 0 ? (
          <>
            <Badge className="absolute top-3 left-3 bg-green-700 text-white text-xs py-1 px-3 rounded-sm uppercase tracking-wider font-medium">
              Sale
            </Badge>
            {product?.isFeatured && (
              <Badge className="absolute top-12 left-3 bg-blue-700 text-white text-xs py-1 px-3 rounded-sm uppercase tracking-wider font-medium">
                Featured
              </Badge>
            )}
          </>
        ) : null}

        {/* Color options badge if available */}
        {hasColorOptions && (
          <Badge className="absolute top-3 right-12 bg-purple-600 text-white text-xs py-1 px-3 rounded-sm uppercase tracking-wider font-medium">
            {product.colors.length} {product.colors.length === 1 ? 'Color' : 'Colors'}
          </Badge>
        )}

        {/* Quick action buttons (visible on hover) */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 p-3 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(product?._id);
            }}
            className="flex items-center justify-center gap-1 bg-white text-foreground px-3 py-2 rounded-sm shadow-md hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span className="text-xs font-medium">View</span>
          </motion.button>

          {product?.totalStock === 0 ? (
            <motion.button
              disabled
              className="flex items-center justify-center gap-1 bg-gray-300 text-gray-600 px-3 py-2 rounded-sm shadow-md cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-medium">Sold Out</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCartClick(product?._id, product?.totalStock);
              }}
              className="flex items-center justify-center gap-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-800 text-white px-3 py-2 rounded-sm shadow-md transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-medium">Add to Cart</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Product details area */}
      <CardContent className="p-4 bg-white">
        <h2 className="text-base font-medium mb-1 text-foreground truncate hover:text-muted transition-colors cursor-pointer" onClick={() => handleViewDetails(product?._id)}>
          {product?.title}
        </h2>
        <div className="flex justify-between items-center mt-2">
          {product?.salePrice > 0 ? (
            <>
              <span className="line-through text-gray-400 text-sm">
                ₹{product?.price}
              </span>
              <span className="text-lg font-semibold text-muted">
                ₹{product?.salePrice}
              </span>
            </>
          ) : (
            <span className="text-lg font-semibold text-foreground">
              ₹{product?.price}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ShoppingProductTile;
