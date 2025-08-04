import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [userCategory, setUserCategory] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const sliderRef = useRef(null);
  const autoSlideRef = useRef(null);

  // Find user's category and filter products accordingly
  useEffect(() => {
    if (user?.category && categoriesList.length > 0 && products.length > 0) {
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
      }
    } else {
      // If no user category or no match, show featured products as fallback
      const featuredProducts = products.filter(product => product.isFeatured);
      setCategoryProducts(featuredProducts.slice(0, 6));
    }
  }, [user?.category, categoriesList, products]);

  // Auto-slide functionality for infinite loop
  useEffect(() => {
    if (isAutoSliding && categoryProducts.length > 3) {
      autoSlideRef.current = setInterval(() => {
        setCurrentSlide(prev => prev + 1);
      }, 3000); // Change slide every 3 seconds
    }

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [isAutoSliding, categoryProducts.length]);

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
          <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">
            {title}
          </h2>
          <div className="w-24 h-1 bg-foreground mx-auto mb-6"></div>
          <p className="text-muted-foreground text-lg">
            {userCategory
              ? `Selected ${userCategory.name} products just for you`
              : description}
          </p>
        </div>

        {/* Single Row Slider Layout - 3 cards per scroll for all devices */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              ref={sliderRef}
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${(currentSlide % Math.ceil(categoryProducts.length / 3)) * 100}%)`,
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTransitionEnd={() => {
                // Reset position for infinite loop without animation
                if (currentSlide >= Math.ceil(categoryProducts.length / 3)) {
                  sliderRef.current.style.transition = 'none';
                  setCurrentSlide(0);
                  setTimeout(() => {
                    sliderRef.current.style.transition = 'transform 500ms ease-in-out';
                  }, 50);
                } else if (currentSlide < 0) {
                  sliderRef.current.style.transition = 'none';
                  setCurrentSlide(Math.ceil(categoryProducts.length / 3) - 1);
                  setTimeout(() => {
                    sliderRef.current.style.transition = 'transform 500ms ease-in-out';
                  }, 50);
                }
              }}
            >
              {/* Create infinite loop by duplicating slides */}
              {[...Array.from({ length: Math.ceil(categoryProducts.length / 3) }), ...Array.from({ length: Math.ceil(categoryProducts.length / 3) })].map((_, slideIndex) => {
                const actualIndex = slideIndex % Math.ceil(categoryProducts.length / 3);
                return (
                  <div key={`slide-${slideIndex}`} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-3 gap-4 px-2">
                      {categoryProducts
                        .slice(actualIndex * 3, actualIndex * 3 + 3)
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
              })}
            </div>
          </div>

          {/* Slide Indicators */}
          {categoryProducts.length > 3 && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: Math.ceil(categoryProducts.length / 3) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSlide(index);
                    setIsAutoSliding(false);
                    setTimeout(() => setIsAutoSliding(true), 5000);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    (currentSlide % Math.ceil(categoryProducts.length / 3)) === index
                      ? 'bg-foreground'
                      : 'bg-muted-foreground/30'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View all button */}
        {userCategory && (
          <div className="text-center mt-10">
            <button
              onClick={() => navigate(`/shop/collections?category=${userCategory._id}`)}
              className="inline-block px-8 py-3 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors duration-300 uppercase tracking-wider text-sm font-medium shadow-md"
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