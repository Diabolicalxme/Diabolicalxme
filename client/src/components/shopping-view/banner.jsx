import React from 'react';

const Banner = ({ imageUrl, altText, description }) => {
  const descriptionPoints = description.split('.').filter(point => point.trim());

  return (
    <div className="relative overflow-hidden w-full h-[350px] md:h-[450px] ">
    <img
      src={imageUrl}
      alt={altText}
      className="object-fit md:object-cover w-full h-full"
    />

    {/* Points on Image */}
    <div className="absolute top-40 right-5 md:top-32 md:right-12 text-white space-y-4 text-lg">
      {descriptionPoints.map((point, index) => (
        <div key={index} className="py-0 md:py-4 flex items-center text-md md:text-2xl">
          <span className="mr-2 text-yellow-300">•</span>
          {point.trim()}
        </div>
      ))}
    </div>
  </div>
  );
};

export default Banner;
