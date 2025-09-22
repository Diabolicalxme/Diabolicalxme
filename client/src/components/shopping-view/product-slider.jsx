
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@/styles/main.css";

const ProductImageCard = ({ product }) => {
  return (
    <div
      style={{
        width: "200px",  // Reduced for 6 items per row
        height: "320px", // Increased height as requested
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
            : "https://placehold.co/200x320/EDE8D0/093624?text=No+Image"
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
}) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [scrollX, setScrollX] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const itemWidth = 200;  // Reduced width for 6 items
  const spacing = 20;     // Reduced spacing for tighter layout
  const totalItemWidth = itemWidth + spacing;
  const visibleCount = products.length;

  // Define the slider height - optimized for 6 items
  const sliderHeight = 320; // height matching increased card dimensions

  // Get window width dynamically
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleWheel = (e) => {
    e.preventDefault();
    setScrollX((prev) => {
      const maxScroll = (visibleCount - 1) * totalItemWidth;
      // Ultra-smooth scroll sensitivity for seamless convex transitions
      let next = prev + e.deltaY * 0.8;
      if (next < 0) next = 0;
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
    const deltaX = touchStartX.current - touchCurrentX; // positive = swipe left, negative = swipe right
    const maxScroll = (visibleCount - 1) * totalItemWidth;

    // Ultra-smooth touch sensitivity for seamless convex transitions
    let next = lastScrollX.current + deltaX * 1.0;
    if (next < 0) next = 0;
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


  // Concave
  
  // const getItemStyle = (index, isHovered = false) => {
  //   const centerX = windowWidth / 2;
  //   const itemCenterX = index * totalItemWidth + itemWidth / 2;
  //   const relativeX = itemCenterX - scrollX;
  //   const distanceFromCenter = relativeX - centerX;
  //   const maxDistance = windowWidth / 2 + totalItemWidth;
  //   const normalizedDistance = Math.max(
  //     Math.min(distanceFromCenter / maxDistance, 1),
  //     -1
  //   );

  //   // Adjust rotation angle (smaller)
  //   const maxRotate = 15; // reduce from 45 to 15 degrees
  //   const rotateY = maxRotate * normalizedDistance;

  //   // Increase scale range for stronger effect
  //   const minScale = 0.5;
  //   const maxScale = 1.1;
  //   // Add a slight scale increase on hover, no box shadow though
  //   const hoverBoost = isHovered ? 0.1 : 0;
  //   const scale = minScale + (maxScale - minScale) * Math.abs(normalizedDistance) + hoverBoost;

  //   const translateX = distanceFromCenter * 0.8;
  //   const zIndex = Math.round((1 - Math.abs(normalizedDistance)) * 100);

  //   return {
  //     position: "absolute",
  //     top: "50%",
  //     left: "50%",
  //     transform: `translateX(${translateX}px) translateY(-50%) perspective(800px) rotateY(${rotateY}deg)`,
  //     cursor: "pointer",
  //     zIndex,
  //     scale,
  //     transition: "transform 0.3s ease",
  //     willChange: "transform",
  //   };
  // };

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

    // Ultra-dramatic scaling for maximum convex depth
    const minScale = 0.1;   // Extremely small minimum (10%) for deep hollow effect
    const maxScale = 1.3;   // Larger maximum (130%) for prominent center peak
    const hoverBoost = isHovered ? 0.1 : 0;
    const scale = minScale + (maxScale - minScale) * convexCurve + hoverBoost;

    // Subtle rotation
    const maxRotate = 3;
    const rotateY = maxRotate * normalizedDistance * 0.5;

    // Direct positioning
    const translateX = distanceFromCenter;

    // Enhanced vertical lift for deeper 3D effect
    const maxVerticalLift = 30;
    const translateY = -50 + (maxVerticalLift * convexCurve);

    // Z-index for proper layering
    const zIndex = Math.round(convexCurve * 100) + 10;

    return {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: `translateX(${translateX}px) translateY(${translateY}px) perspective(1000px) rotateY(${rotateY}deg) scale(${scale})`,
      cursor: "pointer",
      zIndex,
      transition: "all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      willChange: "transform",
    };
  };


  return (
    <section className="pb-48 relative">
      <div className="container mx-auto px-4 text-center mb-4">
        <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">
          {title}
        </h2>
        <div className="w-24 h-1 bg-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{description}</p>
      </div>

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
                <ProductImageCard product={product} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;
