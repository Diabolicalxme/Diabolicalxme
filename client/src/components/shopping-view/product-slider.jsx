// import React, { useRef, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import "@/styles/main.css";

// const ProductImageCard = ({ product, scale }) => {
//   return (
//     <div
//       style={{
//         width: "250px",
//         height: "350px", // fixed max height for container
//         overflow: "visible", // allow image to scale inside container
//         backgroundColor: "transparent",
//         userSelect: "none",
//         position: "relative",
//       }}
//     >
//       <img
//         src={
//           product.image && product.image.length > 0
//             ? product.image[0]
//             : "https://placehold.co/250x350/EDE8D0/093624?text=No+Image"
//         }
//         alt={product.title || "Product"}
//         style={{
//           width: "100%",
//           height: "100%",
//           objectFit: "contain", // keep entire image visible, no cropping
//           transform: `scale(${scale})`, // scale image smoothly
//           transition: "transform 0.3s ease",
//           display: "block",
//           userSelect: "none",
//           pointerEvents: "none",
//           margin: "0 auto",
//         }}
//         draggable={false}
//       />
//     </div>
//   );
// };

// const ProductSlider = ({
//   products,
//   handleGetProductDetails,
//   title,
//   description,
// }) => {
//   const navigate = useNavigate();
//   const containerRef = useRef(null);
//   const [scrollX, setScrollX] = useState(0);
//   const [hoveredIndex, setHoveredIndex] = useState(null);

//   const itemWidth = 250;
//   const spacing = 40;
//   const totalItemWidth = itemWidth + spacing;
//   const visibleCount = products.length;

//   // Define the slider height
//   const sliderHeight = 350; // height of the slider container

//   // Get window width dynamically
//   const [windowWidth, setWindowWidth] = useState(window.innerWidth);
//   useEffect(() => {
//     const handleResize = () => setWindowWidth(window.innerWidth);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const handleWheel = (e) => {
//     e.preventDefault();
//     setScrollX((prev) => {
//       const maxScroll = (visibleCount - 1) * totalItemWidth;
//       let next = prev + e.deltaY * 0.7;
//       if (next < 0) next = 0;
//       if (next > maxScroll) next = maxScroll;
//       return next;
//     });
//   };

//   // Touch swipe support
//   const touchStartX = useRef(0);
//   const lastScrollX = useRef(scrollX);

//   const handleTouchStart = (e) => {
//     touchStartX.current = e.touches[0].clientX;
//     lastScrollX.current = scrollX;
//   };

//   const handleTouchMove = (e) => {
//     const touchCurrentX = e.touches[0].clientX;
//     const deltaX = touchStartX.current - touchCurrentX; // positive = swipe left, negative = swipe right
//     const maxScroll = (visibleCount - 1) * totalItemWidth;

//     let next = lastScrollX.current + deltaX;
//     if (next < 0) next = 0;
//     if (next > maxScroll) next = maxScroll;

//     setScrollX(next);
//   };

//   useEffect(() => {
//     const ref = containerRef.current;
//     if (ref) {
//       ref.addEventListener("wheel", handleWheel, { passive: false });
//       ref.addEventListener("touchstart", handleTouchStart, { passive: true });
//       ref.addEventListener("touchmove", handleTouchMove, { passive: true });
//     }
//     return () => {
//       if (ref) {
//         ref.removeEventListener("wheel", handleWheel);
//         ref.removeEventListener("touchstart", handleTouchStart);
//         ref.removeEventListener("touchmove", handleTouchMove);
//       }
//     };
//   }, [scrollX, visibleCount]);

//   const getItemStyle = (index, isHovered = false) => {
//     const centerX = windowWidth / 2;
//     const itemCenterX = index * totalItemWidth + itemWidth / 2;
//     const relativeX = itemCenterX - scrollX;
//     const distanceFromCenter = relativeX - centerX;
//     const maxDistance = windowWidth / 2 + totalItemWidth;
//     const normalizedDistance = Math.max(
//       Math.min(distanceFromCenter / maxDistance, 1),
//       -1
//     );

//     // Adjust rotation angle (smaller)
//     const maxRotate = 15; // reduce from 45 to 15 degrees
//     const rotateY = maxRotate * normalizedDistance;

//     // Increase scale range for stronger effect
//     const minScale = 0.5;
//     const maxScale = 1.1;
//     // Add a slight scale increase on hover, no box shadow though
//     const hoverBoost = isHovered ? 0.1 : 0;
//     const scale = minScale + (maxScale - minScale) * Math.abs(normalizedDistance) + hoverBoost;

//     const translateX = distanceFromCenter * 0.8;
//     const zIndex = Math.round((1 - Math.abs(normalizedDistance)) * 100);

//     return {
//       position: "absolute",
//       top: "50%",
//       left: "50%",
//       transform: `translateX(${translateX}px) translateY(-50%) perspective(800px) rotateY(${rotateY}deg)`,
//       cursor: "pointer",
//       zIndex,
//       scale,
//       transition: "transform 0.3s ease",
//       willChange: "transform",
//     };
//   };

//   return (
//     <section className="py-16 relative">
//       <div className="container mx-auto px-4 text-center mb-12">
//         <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">
//           {title}
//         </h2>
//         <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
//         <p className="text-muted-foreground">{description}</p>
//       </div>

//       <div
//         className="relative overflow-visible"
//         ref={containerRef}
//         style={{ height: `${sliderHeight}px`, userSelect: "none" }}
//       >
//         <div
//           className="relative h-full w-full"
//           style={{ overflow: "visible", position: "relative" }}
//         >
//           {products.slice(0, 20).map((product, index) => {
//             const isHovered = hoveredIndex === index;
//             const style = getItemStyle(index, isHovered);
//             return (
//               <div
//                 key={product._id}
//                 style={{
//                   position: style.position,
//                   top: style.top,
//                   left: style.left,
//                   transform: style.transform,
//                   cursor: style.cursor,
//                   zIndex: style.zIndex,
//                   transition: style.transition,
//                   willChange: style.willChange,
//                 }}
//                 onMouseEnter={() => setHoveredIndex(index)}
//                 onMouseLeave={() => setHoveredIndex(null)}
//                 onClick={() => {
//                   navigate(`/shop/details/${product._id}`);
//                   if (handleGetProductDetails) {
//                     handleGetProductDetails(product._id);
//                   }
//                 }}
//               >
//                 <ProductImageCard product={product} scale={style.scale} />
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default ProductSlider;



import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@/styles/main.css";

const ProductImageCard = ({ product, scale }) => {
  return (
    <div
      style={{
        width: "250px",
        height: "350px", // fixed max height for container
        overflow: "visible", // allow image to scale inside container
        backgroundColor: "transparent",
        userSelect: "none",
        position: "relative",
      }}
    >
      <img
        src={
          product.image && product.image.length > 0
            ? product.image[0]
            : "https://placehold.co/250x350/EDE8D0/093624?text=No+Image"
        }
        alt={product.title || "Product"}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain", // keep entire image visible, no cropping
          transform: `scale(${scale})`, // scale image smoothly
          transition: "transform 0.3s ease",
          display: "block",
          userSelect: "none",
          pointerEvents: "none",
          margin: "0 auto",
        }}
        draggable={false}
      />
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

  const itemWidth = 250;
  const spacing = 40;
  const totalItemWidth = itemWidth + spacing;
  const visibleCount = products.length;

  // Define the slider height
  const sliderHeight = 350; // height of the slider container

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
      let next = prev + e.deltaY * 0.7;
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

    let next = lastScrollX.current + deltaX;
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

  const getItemStyle = (index, isHovered = false) => {
    const centerX = windowWidth / 2;
    const itemCenterX = index * totalItemWidth + itemWidth / 2;
    const relativeX = itemCenterX - scrollX;
    const distanceFromCenter = relativeX - centerX;
    const maxDistance = windowWidth / 2 + totalItemWidth;
    const normalizedDistance = Math.max(
      Math.min(distanceFromCenter / maxDistance, 1),
      -1
    );

    // Adjust rotation angle (smaller)
    const maxRotate = 15; // reduce from 45 to 15 degrees
    const rotateY = maxRotate * normalizedDistance;

    // Increase scale range for stronger effect
    const minScale = 0.5;
    const maxScale = 1.1;
    // Add a slight scale increase on hover, no box shadow though
    const hoverBoost = isHovered ? 0.1 : 0;
    const scale = minScale + (maxScale - minScale) * Math.abs(normalizedDistance) + hoverBoost;

    const translateX = distanceFromCenter * 0.8;
    const zIndex = Math.round((1 - Math.abs(normalizedDistance)) * 100);

    return {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: `translateX(${translateX}px) translateY(-50%) perspective(800px) rotateY(${rotateY}deg)`,
      cursor: "pointer",
      zIndex,
      scale,
      transition: "transform 0.3s ease",
      willChange: "transform",
    };
  };

  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4 text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">
          {title}
        </h2>
        <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
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
                <ProductImageCard product={product} scale={style.scale} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;
