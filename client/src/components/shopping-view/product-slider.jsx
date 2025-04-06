import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ShoppingProductTile from "./product-tile";
import '@/styles/main.css';

const ProductSlider = ({
  products,
  handleGetProductDetails,
  handleAddtoCart,
  title,
  description,
  bgColor = "bg-gray-50"
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoScrollIntervalRef = useRef(null);
  const sliderRef = useRef(null);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

  // Always show 6 products at a time
  const visibleProducts = 6;
  const scrollThreshold = 30; // Lower threshold for more responsive scrolling
  const scrollDeltaRef = useRef(0);
  const animationTimeoutRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const goToNextProduct = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => 
      prevIndex >= products.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevProduct = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => 
      prevIndex <= 0 ? products.length - 1 : prevIndex - 1
    );
  };

  // Smooth wheel handling with momentum
  const handleWheel = (e) => {
    if (isMobile) return;
    
    e.preventDefault();
    scrollDeltaRef.current += e.deltaY;

    // Clear any pending animation
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    animationTimeoutRef.current = setTimeout(() => {
      if (Math.abs(scrollDeltaRef.current) >= scrollThreshold) {
        if (scrollDeltaRef.current > 0) {
          goToNextProduct();
        } else {
          goToPrevProduct();
        }
        scrollDeltaRef.current = 0;
      }
    }, 50); // Small delay to accumulate scroll events
  };

  // Touch handling
  const [touchStart, setTouchStart] = useState(0);
  const touchDistanceRef = useRef(0);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    touchDistanceRef.current = 0;
  };

  const handleTouchMove = (e) => {
    const currentTouch = e.targetTouches[0].clientX;
    touchDistanceRef.current = touchStart - currentTouch;
    e.preventDefault(); // Prevent page scroll
  };

  const handleTouchEnd = () => {
    if (touchDistanceRef.current > 50) {
      goToNextProduct();
    } else if (touchDistanceRef.current < -50) {
      goToPrevProduct();
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider && !isMobile) {
      slider.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (slider) {
        slider.removeEventListener('wheel', handleWheel);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [isMobile]);

  useEffect(() => {
    if (products.length > visibleProducts && !isPaused) {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
      autoScrollIntervalRef.current = setInterval(goToNextProduct, 3000);
    }
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [products.length, isPaused]);

  const getVisibleProducts = () => {
    const visible = [];
    for (let i = 0; i < visibleProducts; i++) {
      const index = (currentIndex + i) % products.length;
      visible.push({
        ...products[index],
        position: i
      });
    }
    return visible;
  };

  // Animation variants for smooth transitions
  const itemVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0
    })
  };

  const scaleVariants = {
    0: { scale: 1.1, zIndex: 10 },
    1: { scale: 1.05, zIndex: 5 },
    2: { scale: 1.0, zIndex: 1 },
    3: { scale: 1.0, zIndex: 1 },
    4: { scale: 1.05, zIndex: 5 },
    5: { scale: 1.1, zIndex: 10 }
  };

  if (products.length <= visibleProducts) {
    return (
      <section className={`py-16 ${bgColor}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">{title}</h2>
            <div className="w-24 h-1 bg-foreground mx-auto mb-6"></div>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 md:gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 50 }}
                className={`
                  ${index === 0 || index === 5 ? 'md:scale-110 md:z-10' : ''}
                  ${index === 1 || index === 4 ? 'md:scale-105 md:z-5' : ''}
                  ${index === 2 || index === 3 ? 'md:scale-100' : ''}
                  transition-transform duration-300
                `}
              >
                <ShoppingProductTile
                  handleGetProductDetails={handleGetProductDetails}
                  product={product}
                  handleAddtoCart={handleAddtoCart}
                />
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/shop/collections")}
              className="inline-block px-8 py-3 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
            >
              View All Products
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 ${bgColor}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">{title}</h2>
          <div className="w-24 h-1 bg-foreground mx-auto mb-6"></div>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div
          ref={sliderRef}
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="overflow-hidden">
            <AnimatePresence custom={direction} initial={false}>
              <motion.div
                key={currentIndex}
                className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-6"} gap-6 md:gap-8`}
                initial="enter"
                animate="center"
                exit="exit"
                custom={direction}
                transition={{ staggerChildren: 0.05 }}
              >
                {getVisibleProducts().map((product, index) => (
                  <motion.div
                    key={`${product._id}-${currentIndex}-${index}`}
                    custom={direction}
                    variants={itemVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <motion.div
                      variants={scaleVariants}
                      animate={index.toString()}
                      transition={{ duration: 0.3 }}
                      className="transition-all duration-300 ease-in-out"
                    >
                      <ShoppingProductTile
                        handleGetProductDetails={handleGetProductDetails}
                        product={product}
                        handleAddtoCart={handleAddtoCart}
                      />
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {!isMobile && (
            <>
              <button
                onClick={goToPrevProduct}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-background p-2 rounded-full shadow-md hover:bg-foreground hover:text-background transition-colors z-20"
                aria-label="Previous product"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNextProduct}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-background p-2 rounded-full shadow-md hover:bg-foreground hover:text-background transition-colors z-20"
                aria-label="Next product"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
        <div className="text-center mt-12">
          <button
            onClick={() => navigate("/shop/collections")}
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