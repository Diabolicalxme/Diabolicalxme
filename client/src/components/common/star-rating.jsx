import React from "react";
import { StarIcon } from "lucide-react";

function StarRatingComponent({ rating, handleRatingChange, disableHover = false }) {
  return (
    <div className="flex items-center gap-3">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= rating;
        return (
          <button
            key={star}
            onClick={handleRatingChange ? () => handleRatingChange(star) : undefined}
            className={`
              transition-transform duration-300 transform 
              ${!disableHover ? "hover:scale-125 hover:cursor-pointer" : "pointer-events-none"} 
              focus:outline-none
            `}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <StarIcon
              className={`
                w-10 h-10 transition-colors duration-300 
                ${isActive ? "fill-yellow-400 text-yellow-400 drop-shadow-md" : "fill-gray-300 text-gray-300"}
              `}
            />
          </button>
        );
      })}
    </div>
  );
}

export default StarRatingComponent;
