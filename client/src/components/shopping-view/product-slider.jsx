import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ShoppingProductTile from "./product-tile";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ProductSlider = ({
  products,
  handleGetProductDetails,
  handleAddtoCart,
  title,
  description,
  bgColor = "bg-gray-50" // Default background color
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoScrollIntervalRef = useRef(null);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Responsive items per slide: 1 for mobile, 4 for desktop
  const itemsPerSlide = isMobile ? 1 : 4;

  // Update isMobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate how many complete slides we can make
  const totalSlides = Math.ceil(products.length / itemsPerSlide);

  // Function to advance to the next slide
  const goToNextSlide = () => {
    setCurrentIndex((prevIndex) => {
      // If we're at the last slide, go back to the beginning
      if (prevIndex >= totalSlides - 1) {
        return 0;
      }
      // Otherwise, advance by 1
      return prevIndex + 1;
    });
  };

  // Function to go to the previous slide
  const goToPrevSlide = () => {
    setCurrentIndex((prevIndex) => {
      // If we're at the first slide, go to the last slide
      if (prevIndex <= 0) {
        return totalSlides - 1;
      }
      // Otherwise, go back by 1
      return prevIndex - 1;
    });
  };

  // Auto-scroll effect
  useEffect(() => {
    if (products.length > itemsPerSlide && !isPaused) {
      // Clear any existing interval
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }

      // Set up new interval for auto-scrolling (every 3 seconds)
      autoScrollIntervalRef.current = setInterval(goToNextSlide, 4000);
    }

    // Cleanup function to clear interval when component unmounts
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [products.length, isPaused, itemsPerSlide]);

  // If we have 4 or fewer products on desktop or 1 product on mobile, just display them without sliding
  if (products.length <= itemsPerSlide) {
    return (
      <section className={`py-16 ${bgColor}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">{title}</h2>
            <div className="w-24 h-1 bg-foreground mx-auto mb-6"></div>
            <p className="text-muted-foreground">{description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 50,
                }}
              >
                <ShoppingProductTile
                  handleGetProductDetails={handleGetProductDetails}
                  product={product}
                  handleAddtoCart={handleAddtoCart}
                />
              </motion.div>
            ))}
          </div>

          {/* View all products button */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/shop/collections')}
              className="inline-block px-8 py-3 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
            >
              View All Products
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Get current slide products
  const getCurrentSlideProducts = () => {
    const startIdx = currentIndex * itemsPerSlide;
    return products.slice(startIdx, startIdx + itemsPerSlide);
  };

  return (
    <section className={`py-16 ${bgColor}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">{title}</h2>
          <div className="w-24 h-1 bg-foreground mx-auto mb-6"></div>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
         

          {/* Visible products container */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'} gap-6 md:gap-8`}
              >
                {getCurrentSlideProducts().map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 50,
                    }}
                  
                  >
                    <ShoppingProductTile
                      handleGetProductDetails={handleGetProductDetails}
                      product={product}
                      handleAddtoCart={handleAddtoCart}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Navigation */}
          {totalSlides > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-foreground border-2 border-background scale-125"
                      : "bg-muted"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>
          )}
        </div>

        {/* View all products button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/shop/collections')}
            className="inline-block px-8 py-3 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
          >
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;