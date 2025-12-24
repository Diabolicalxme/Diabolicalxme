import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SingleProductBanners = ({ products }) => {
    const navigate = useNavigate();

    if (!products || products.length === 0) return null;

    return (
        <div className="flex flex-col w-full">
            {products[0]?.image?.map((imgUrl, index) => (
                <div
                    key={`${products[0]._id}-${index}`}
                    className="relative w-full cursor-pointer block group"
                    onClick={() => navigate(`/shop/details/${products[0]._id}`)}
                >
                    {/* 
                      Desktop: Aspect Ratio ~2:1 (Cinematic Wide)
                      Mobile: Aspect Ratio ~3:4 (Vertical Portrait for impact)
                    */}
                    <div className="relative w-full aspect-[3/4] md:aspect-[2/1] overflow-hidden">
                        <img
                            src={imgUrl}
                            alt={`${products[0].title} - ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SingleProductBanners;
