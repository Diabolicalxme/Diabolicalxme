import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const CategoryCard = ({ categoryItem, index, variant = "default", fullWidth = false }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/shop/collections?category=${categoryItem._id}`);
  };

  // Different height variants based on layout type
  const getCardHeight = () => {
    if (variant === "masonry") {
      // Create varying heights based on index - consistent height on mobile
      const desktopHeights = ["h-[300px]", "h-[400px]", "h-[500px]", "h-[350px]", "h-[450px]"];

      // Use window.innerWidth to determine which set of heights to use
      const isMobile = window.innerWidth < 768;

      // For mobile, use consistent 250px height for all cards
      if (isMobile) {
        return "h-[250px]";
      }

      // For desktop, use the varying heights
      return desktopHeights[index % desktopHeights.length];
    } else if (variant === "grid") {
      // For the grid layout, use consistent heights
      if (fullWidth) {
        return "h-[300px] md:h-[300px]"; // Standard height for all cards
      }
      return "h-[250px] md:h-[300px]"; // Standard height for grid cards
    }

    return "h-[250px] md:h-[300px]"; // Default height with mobile adjustment
  };

  return (
    <motion.div
      className={`group relative overflow-hidden ${getCardHeight()} cursor-pointer bg-black`}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Category Image - Only visible on hover for grid variant */}
      {variant === "grid" ? (
        <div className="absolute inset-0 w-full h-full overflow-hidden opacity-0 group-hover:opacity-30 transition-opacity duration-500">
          <img
            src={categoryItem?.image}
            alt={categoryItem?.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <img
            src={categoryItem?.image}
            alt={categoryItem?.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
      )}

      {/* Gradient overlay for non-grid variants */}
      {variant !== "grid" && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
      )}

      {/* Content container */}
      <div className={`absolute inset-0 flex flex-col ${variant === "grid" ? "justify-center" : "justify-end"} p-4 md:p-8 text-white`}>
        {/* Category name with modern typography */}
        <h3 className={`text-xl md:text-3xl font-light uppercase tracking-wider mb-2 md:mb-3 ${variant === "grid" ? "text-center" : ""}`}>
          {categoryItem?.name}
        </h3>

        {/* Short description - always visible for grid variant */}
        {variant === "grid" ? (
          <p className="text-sm text-white/80 mb-4 text-center">
            {categoryItem?.description ||
              (index === 0 ? "Style and comfort meet in our collection of jeans. Discover the latest trends and perfect cuts for an impeccable look." :
               index === 1 ? "Passion for fashion and comfort is reflected in every pair of sneakers. Experience style and functionality in a single step." :
               index === 2 ? "Explore exclusive deals on our top products. The perfect opportunity to enrich your wardrobe with trendy pieces at affordable prices." :
               index === 3 ? "Style and comfort meet in our collection of shirts. Discover the latest trends and perfect cuts for an impeccable look." :
               index === 4 ? "Passion for fashion and comfort is reflected in every t-shirt. Experience style and functionality in a single step." :
               "Discover our curated collections designed for every style and occasion")}
          </p>
        ) : (
          <p className="hidden md:block text-sm text-white/80 mb-4 line-clamp-2 transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-100">
            {categoryItem?.description}
          </p>
        )}

        {/* Shop Now button - only for non-grid variants */}
        {variant !== "grid" && (
          <div className="flex items-center">
            <span className="text-xs md:text-sm uppercase tracking-wider font-medium">Shop Now</span>
            <div className="ml-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center transform group-hover:translate-x-1 transition-transform duration-300">
              <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Decorative element - line that animates on hover */}
      <div className="absolute bottom-0 left-0 w-0 h-1 bg-white group-hover:w-full transition-all duration-500 ease-in-out"></div>
    </motion.div>
  );
};

export default CategoryCard;
