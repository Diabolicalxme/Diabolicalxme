import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getThemeColors } from "@/utils/theme-utils";

import ShoppingProductTile from "./product-tile";

const CategoryPicks = ({ 
  products, 
  handleGetProductDetails, 
  handleAddtoCart,
  title = "Here are your picks",
  description = "Products selected just for you based on your preferences"
}) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { categoriesList } = useSelector((state) => state.shopCategories);
  const { currentTheme } = useSelector((state) => state.theme);

  // Get theme-aware colors with fallback
  const themeColors = getThemeColors(currentTheme || 'arthur');
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [userCategory, setUserCategory] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const sliderRef = useRef(null);
  const autoSlideRef = useRef(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get items per scroll based on screen size
  const getItemsPerScroll = () => isMobile ? 2 : 3;

  // Find user's category and filter products accordingly
  useEffect(() => {
    // Only proceed if we have categories and products data
    if (categoriesList.length > 0 && products.length > 0) {
      if (user?.category) {
        // Find the category object that matches the user's category name
        const matchedCategory = categoriesList.find(
          cat => cat.name.toLowerCase() === user.category.toLowerCase()
        );

        setUserCategory(matchedCategory);

        if (matchedCategory) {
          // Filter products by the matched category ID
          const filteredProducts = products.filter(
            product => product.category === matchedCategory._id
          );

          // Limit to 6 products for better slider experience
          setCategoryProducts(filteredProducts.slice(0, 6));
        } else {
          // If user has category but no match found, show featured products
          const featuredProducts = products.filter(product => product.isFeatured);
          setCategoryProducts(featuredProducts.slice(0, 6));
        }
      } else {
        // If no user or no user category (incognito users), show featured products as fallback
        setUserCategory(null);
        const featuredProducts = products.filter(product => product.isFeatured);

        if (featuredProducts.length > 0) {
          setCategoryProducts(featuredProducts.slice(0, 6));
        } else {
          // If no featured products, show the first 6 products as fallback
          setCategoryProducts(products.slice(0, 6));
        }
      }
    }
  }, [user?.category, categoriesList, products]);

  // Auto-slide functionality for infinite loop
  useEffect(() => {
    const itemsPerScroll = getItemsPerScroll();
    if (isAutoSliding && categoryProducts.length > itemsPerScroll) {
      autoSlideRef.current = setInterval(() => {
        setCurrentSlide(prev => prev + 1);
      }, 3000); // Change slide every 3 seconds
    }

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [isAutoSliding, categoryProducts.length, isMobile]);

  // Touch/swipe handlers for infinite scroll
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsAutoSliding(false); // Pause auto-sliding when user interacts
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentSlide(prev => prev + 1);
    } else if (isRightSwipe) {
      setCurrentSlide(prev => prev - 1);
    }
    
    // Resume auto-sliding after 5 seconds
    setTimeout(() => setIsAutoSliding(true), 5000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, []);

  // If no products to display, don't render the component
  if (categoryProducts.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className={`text-3xl md:text-4xl font-light uppercase tracking-wide mb-4 ${themeColors.cardText}`}>
            {title}
          </h2>
          <div className={`w-24 h-1 mx-auto mb-6 ${themeColors.dividerBg}`}></div>
          <p className={`text-lg ${themeColors.mutedText}`}>
            {userCategory
              ? `Selected ${userCategory.name} products just for you`
              : "Discover our curated collection of trending products"}
          </p>
        </div>

        {/* Single Row Slider Layout - 2 cards per scroll on mobile, 3 on desktop */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              ref={sliderRef}
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${(currentSlide % Math.ceil(categoryProducts.length / getItemsPerScroll())) * 100}%)`,
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTransitionEnd={() => {
                // Reset position for infinite loop without animation
                const itemsPerScroll = getItemsPerScroll();
                const totalSlides = Math.ceil(categoryProducts.length / itemsPerScroll);

                if (currentSlide >= totalSlides) {
                  sliderRef.current.style.transition = 'none';
                  setCurrentSlide(0);
                  setTimeout(() => {
                    sliderRef.current.style.transition = 'transform 500ms ease-in-out';
                  }, 50);
                } else if (currentSlide < 0) {
                  sliderRef.current.style.transition = 'none';
                  setCurrentSlide(totalSlides - 1);
                  setTimeout(() => {
                    sliderRef.current.style.transition = 'transform 500ms ease-in-out';
                  }, 50);
                }
              }}
            >
              {/* Create infinite loop by duplicating slides */}
              {(() => {
                const itemsPerScroll = getItemsPerScroll();
                const totalSlides = Math.ceil(categoryProducts.length / itemsPerScroll);
                return [...Array.from({ length: totalSlides }), ...Array.from({ length: totalSlides })].map((_, slideIndex) => {
                  const actualIndex = slideIndex % totalSlides;
                  return (
                    <div key={`slide-${slideIndex}`} className="w-full flex-shrink-0">
                      <div className={`grid gap-4 px-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
                        {categoryProducts
                          .slice(actualIndex * itemsPerScroll, actualIndex * itemsPerScroll + itemsPerScroll)
                          .map((product, productIndex) => (
                          <motion.div
                            key={`${product._id}-${slideIndex}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.5,
                              delay: productIndex * 0.1,
                              type: "spring",
                              stiffness: 50,
                            }}
                            className="flex justify-center"
                          >
                            <ShoppingProductTile
                              handleGetProductDetails={handleGetProductDetails}
                              product={product}
                              handleAddtoCart={handleAddtoCart}
                            />
                          </motion.div>
                        ))}
                    </div>
                  </div>
                );
              })})()}
            </div>
          </div>

          {/* Slide Indicators */}
          {(() => {
            const itemsPerScroll = getItemsPerScroll();
            const totalSlides = Math.ceil(categoryProducts.length / itemsPerScroll);

            return categoryProducts.length > itemsPerScroll && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentSlide(index);
                      setIsAutoSliding(false);
                      setTimeout(() => setIsAutoSliding(true), 5000);
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      (currentSlide % totalSlides) === index
                        ? 'bg-foreground'
                        : 'bg-muted-foreground/30'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            );
          })()}
        </div>

        {/* View all button */}
        {userCategory && (
          <div className="text-center mt-10">
            <button
              onClick={() => navigate(`/shop/collections?category=${userCategory._id}`)}
              className={`inline-block px-8 py-3 border-2 transition-colors duration-300 uppercase tracking-wider text-sm font-medium shadow-md ${themeColors.buttonOutline}`}
            >
              View All {userCategory.name} Products
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryPicks;