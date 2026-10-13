
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@/styles/main.css";

const ProductImageCard = ({ product, cardWidth = 200, cardHeight = 320 }) => {
  return (
    <div
      style={{
        width: `${cardWidth}px`,  // Dynamically set width
        height: `${cardHeight}px`, // Dynamically set height
        overflow: "visible",
        backgroundColor: "transparent",
        userSelect: "none",
        position: "relative",
        marginTop: "-60px",
      }}
    >
      <img
        src={
          product.image && product.image.length > 0
            ? product.image[0]
            : `https://placehold.co/${cardWidth}x${cardHeight}/EDE8D0/093624?text=No+Image`
        }
        alt={product.title || "Product"}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          userSelect: "none",
          pointerEvents: "none",
          borderRadius: "8px",
        }}
        draggable={false}
      />

      {/* Product info overlay */}
      {/* <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          right: "0",
          // background: "linear-gradient(transparent, rgba(0, 0, 0, 0.7))",
          color: "white",
          padding: "20px 15px 15px",
          // borderRadius: "0 0 8px 8px",
        }}
      >
        <h3 style={{
          fontSize: "14px",
          fontWeight: "600",
          margin: "0 0 5px 0",
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap"
        }}>
          {product.title || "Product Name"}
        </h3>
        <p style={{
          fontSize: "12px",
          margin: "0",
          opacity: "0.9"
        }}>
          ₹{product.salePrice || product.price || "0"}
        </p>
      </div> */}
    </div>
  );
};

const ProductSlider = ({
  products,
  handleGetProductDetails,
  title,
  description,
  isHomeScreen = false,
}) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Get window width dynamically
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const palmDistance = Math.round(windowWidth * 0.23);
  const itemWidth = isHomeScreen ? 170 : 200;  // Dynamically set card width
  const cardHeight = isHomeScreen ? 260 : 320; // Dynamically set card height
  const spacing = isHomeScreen ? Math.max(30, palmDistance - itemWidth) : 30; // Spacing to align products exactly with palms
  const totalItemWidth = itemWidth + spacing;
  const visibleCount = products.length;

  const [scrollX, setScrollX] = useState(() => (itemWidth / 2) - (windowWidth / 2));
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Define the slider height - optimized for 6 items
  const sliderHeight = cardHeight + 40; // height matching card dimensions with extra padding

  const handleWheel = (e) => {
    // Industry Grade: Stop when the last item is centered, not when it drifts off-screen
    const firstItemCentered = itemWidth / 2 - windowWidth / 2;
    const lastItemCentered = (visibleCount - 1) * totalItemWidth + itemWidth / 2 - windowWidth / 2;
    
    const minScroll = firstItemCentered;
    const maxScroll = lastItemCentered;

    // Check if we've reached the boundaries
    const isAtStart = scrollX <= minScroll;
    const isAtEnd = scrollX >= maxScroll;
    const scrollingUp = e.deltaY < 0;
    const scrollingDown = e.deltaY > 0;

    // If we're at a boundary and trying to scroll further in that direction,
    // don't prevent default, so the parent page can scroll naturally.
    if ((isAtStart && scrollingUp) || (isAtEnd && scrollingDown)) {
      return;
    }

    // Otherwise, prevent page scroll and slide the products
    e.preventDefault();
    setScrollX((prev) => {
      let next = prev + e.deltaY * 0.8;
      if (next < minScroll) next = minScroll;
      if (next > maxScroll) next = maxScroll;
      return next;
    });
  };

  // Touch swipe support
  const touchStartX = useRef(0);
  const lastScrollX = useRef(scrollX);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    lastScrollX.current = scrollX;
  };

  const handleTouchMove = (e) => {
    const touchCurrentX = e.touches[0].clientX;
    const deltaX = touchStartX.current - touchCurrentX;
    
    const firstItemCentered = itemWidth / 2 - windowWidth / 2;
    const lastItemCentered = (visibleCount - 1) * totalItemWidth + itemWidth / 2 - windowWidth / 2;
    
    const minScroll = firstItemCentered;
    const maxScroll = lastItemCentered;

    let next = lastScrollX.current + deltaX * 1.0;
    if (next < minScroll) next = minScroll;
    if (next > maxScroll) next = maxScroll;

    setScrollX(next);
  };

  useEffect(() => {
    const ref = containerRef.current;
    if (ref) {
      ref.addEventListener("wheel", handleWheel, { passive: false });
      ref.addEventListener("touchstart", handleTouchStart, { passive: true });
      ref.addEventListener("touchmove", handleTouchMove, { passive: true });
    }
    return () => {
      if (ref) {
        ref.removeEventListener("wheel", handleWheel);
        ref.removeEventListener("touchstart", handleTouchStart);
        ref.removeEventListener("touchmove", handleTouchMove);
      }
    };
  }, [scrollX, visibleCount]);


  // Perfect Symmetrical Convex Effect - Fixed Left Side Issue
  const getItemStyle = (index, isHovered = false) => {
    const centerX = windowWidth / 2;
    const itemCenterX = index * totalItemWidth + itemWidth / 2;
    const relativeX = itemCenterX - scrollX;
    const distanceFromCenter = relativeX - centerX;

    // Enhanced symmetrical calculation - extend range for perfect left/right balance
    const extendedRange = windowWidth * 0.7; // Larger range to ensure symmetry
    const normalizedDistance = Math.max(
      Math.min(distanceFromCenter / extendedRange, 1),
      -1
    );

    // Linear convex curve for gradual, equal height reduction
    const absDistance = Math.abs(normalizedDistance);

    // Linear curve: gradual and equal reduction from center to edges
    const convexCurve = Math.max(0, 1 - absDistance); // Ensure non-negative values

    let scale, translateY, zIndex, opacity, filter, rotateY, translateX;

    if (isHomeScreen) {
      // Home screen custom dramatic concave palm depth effect
      // Use a power of 3 to drop scale off toward palm while keeping product sitting neatly in hand
      const scaleCurve = Math.pow(convexCurve, 3); 
      
      const minScale = 0.28; // Fits neatly inside the open palm
      const maxScale = 1.35; // Center featured card
      const hoverBoost = isHovered ? 0.08 : 0;
      scale = minScale + (maxScale - minScale) * scaleCurve + hoverBoost;

      // Rotate side items slightly facing toward center
      const maxRotate = 15;
      rotateY = maxRotate * normalizedDistance; 

      translateX = distanceFromCenter;

      // Vertical translation: side items drop DOWN into the cupped palms (+80px down)
      const verticalDrop = 85; 
      translateY = -15 + (verticalDrop * (1 - scaleCurve)); 

      zIndex = Math.round(scaleCurve * 100) + 10;
      
      // Palm normalized distance: 0 at center, 1 directly in palm. Fades out completely outside palm
      const palmNormalizedDist = Math.abs(distanceFromCenter) / totalItemWidth;
      opacity = palmNormalizedDist > 1.05 
        ? 0 
        : Math.max(0, (1 - Math.pow(palmNormalizedDist / 1.05, 2)) * 0.95);
      
      // Subtle depth blur at sides
      const blurAmount = 1.8 * (1 - scaleCurve);
      filter = blurAmount > 0.2 ? `blur(${blurAmount}px)` : 'none';
    } else {
      // Standard product details slider style
      const minScale = 0.1;
      const maxScale = 1.3;
      const hoverBoost = isHovered ? 0.1 : 0;
      scale = minScale + (maxScale - minScale) * convexCurve + hoverBoost;

      // Subtle rotation
      const maxRotate = 3;
      rotateY = maxRotate * normalizedDistance * 0.5;

      // Dynamic spread factor
      const spreadFactor = 1.5; 
      translateX = distanceFromCenter * (1 + (spreadFactor - 1) * convexCurve);

      // Enhanced vertical lift for deeper 3D effect
      const maxVerticalLift = 30;
      translateY = -50 + (maxVerticalLift * convexCurve);

      zIndex = Math.round(convexCurve * 100) + 10;
      opacity = 0.3 + 0.7 * convexCurve; 
      const blurAmount = 4 * (1 - convexCurve); 
      filter = `blur(${blurAmount}px)`;
    }

    return {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: `translateX(-50%) translateX(${translateX}px) translateY(${translateY}px) perspective(1000px) rotateY(${rotateY}deg) scale(${scale})`,
      cursor: "pointer",
      zIndex,
      opacity,
      filter,
      transition: "all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      willChange: "transform",
    };
  };


  return (
    <section className="pb-48 relative">
      {title && (
        <div className="container mx-auto px-4 text-center mb-4">
          <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">
            {title}
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-4"></div>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}

      <div
        className="relative overflow-visible"
        ref={containerRef}
        style={{ height: `${sliderHeight}px`, userSelect: "none" }}
      >
        <div
          className="relative h-full w-full"
          style={{ overflow: "visible", position: "relative" }}
        >
          {products.slice(0, 20).map((product, index) => {
            const isHovered = hoveredIndex === index;
            const style = getItemStyle(index, isHovered);
            return (
              <div
                key={product._id}
                style={{
                  position: style.position,
                  top: style.top,
                  left: style.left,
                  transform: style.transform,
                  cursor: style.cursor,
                  zIndex: style.zIndex,
                  opacity: style.opacity,
                  filter: style.filter,
                  transition: style.transition,
                  willChange: style.willChange,
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  navigate(`/shop/details/${product._id}`);
                  if (handleGetProductDetails) {
                    handleGetProductDetails(product._id);
                  }
                }}
              >
                <ProductImageCard 
                  product={product} 
                  cardWidth={itemWidth} 
                  cardHeight={cardHeight} 
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;
