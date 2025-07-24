import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { categoryMapping } from "@/config";

const CategoryCard = ({ categoryItem, index, variant = "default" }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Find the slug for this category ID from the mapping
    const categoryInfo = categoryMapping.find(cat => cat.id === categoryItem._id);

    if (categoryInfo) {
      // Use the SEO-friendly URL format
      navigate(`/shop/collections/${categoryInfo.slug}`);
    } else {
      // If no mapping is found, just go to the main collections page
      // We no longer use the old URL format with query parameters
      navigate('/shop/collections');
      console.warn(`No SEO-friendly slug found for category ID: ${categoryItem._id}`);
    }
  };

  // Different height variants for masonry layout with mobile responsiveness
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
    }
    return "h-[250px] md:h-[350px]"; // Default height with mobile adjustment
  };

  return (
    <motion.div
      className={`group relative overflow-hidden ${getCardHeight()} cursor-pointer`}
      onClick={handleClick}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {/* Category Image with modern aspect ratio */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <img
          src={categoryItem?.image}
          alt={categoryItem?.name}
          className="w-full h-full object-cover object-top md:object-top transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      {/* Gradient overlay - more subtle and modern */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>

      {/* Content container - adjusted to flex with space-between instead of justify-end */}
      <div className="absolute inset-0 flex flex-col justify-between p-3 md:p-6 text-white">
        {/* Top section - can be empty or used for other elements */}
        <div></div>

        {/* Bottom section with title, description and button */}
        <div>
          {/* Category name with modern typography */}
          <h3 className="text-lg md:text-2xl font-light uppercase tracking-wider mb-1 md:mb-2 transform group-hover:translate-x-2 transition-transform duration-300">
            {categoryItem?.name}
          </h3>

          {/* Short description with fade-in effect - hidden on mobile */}
          <div className="ml-2 h-0 md:group-hover:h-auto overflow-hidden transition-all duration-300">
            <p className="text-md hidden md:group-hover:block text-white/80 mb-4 line-clamp-2 transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-100">
              {categoryItem?.description}
            </p>
          </div>

          {/* Modern button with arrow - directly below title when no description */}
          <div className="ml-2 flex items-center mt-1">
            <span className="text-xs md:text-sm uppercase tracking-wider font-medium">Shop Now</span>
            <div className="ml-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center transform group-hover:translate-x-1 transition-transform duration-300">
              <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative element - line that animates on hover */}
      <div className="absolute bottom-0 left-0 w-0 h-1 bg-white group-hover:w-full transition-all duration-500 ease-in-out"></div>
    </motion.div>
  );
};

export default CategoryCard;