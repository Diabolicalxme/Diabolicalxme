import React from "react";
import { Star } from "lucide-react";

function StarRatingComponent({ rating, handleRatingChange, disableHover = false, size = "default" }) {
  // Define size classes
  const sizeClasses = {
    small: "w-4 h-4",
    default: "w-5 h-5",
    large: "w-6 h-6"
  };
  
  // Define gap classes
  const gapClasses = {
    small: "gap-0.5",
    default: "gap-1",
    large: "gap-1.5"
  };
  
  // Get the appropriate size class
  const starSize = sizeClasses[size] || sizeClasses.default;
  const gapSize = gapClasses[size] || gapClasses.default;
  
  return (
    <div className={`flex items-center ${gapSize}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= rating;
        return (
          <button
            key={star}
            onClick={handleRatingChange ? () => handleRatingChange(star) : undefined}
            className={`
              transition-all duration-200
              ${!disableHover ? "hover:scale-110 hover:cursor-pointer" : "pointer-events-none"} 
              focus:outline-none
            `}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={`
                ${starSize} transition-colors duration-200
                ${isActive 
                  ? "fill-yellow-400 text-yellow-400" 
                  : !disableHover && handleRatingChange 
                    ? "fill-gray-200 text-gray-200 hover:fill-yellow-200 hover:text-yellow-200" 
                    : "fill-gray-200 text-gray-200"
                }
              `}
            />
          </button>
        );
      })}
    </div>
  );
}

export default StarRatingComponent;
