import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import classNames from "classnames";
import { Heart, ExternalLink, X } from "lucide-react";
import { useToast } from "../ui/use-toast";

const FastMovingCard = ({ item, index, activeItem, handleAddtoCart }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Determine if the card is currently active (desktop slider logic)
  const isStripeOpen = activeItem === index;

  // State to track liked status for the heart icon
  const [liked, setLiked] = useState(false);

  // State to track mobile modal visibility and mobile detection
  const [modalOpen, setModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  // State to manage video loading for mobile modal
  const [videoLoading, setVideoLoading] = useState(true);
  // State to manage video loading for desktop video element
  const [desktopVideoLoading, setDesktopVideoLoading] = useState(true);

  // Listen for resize events to update mobile flag
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // When opening modal, reset video loading state
  const handleCardClick = () => {
    if (isMobile && item?.video) {
      setModalOpen(true);
      setVideoLoading(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleViewDetails = (productId) => {
    navigate(`/shop/details/${productId}`);
  };

  const handleAddToCartClick = (productId, totalStock) => {
    if (!isAuthenticated) {
      toast({
        title: "Please log in to add items to the cart!",
        variant: "destructive"
      });
    } else {
      // Pass the entire item object to handle color selection properly
      handleAddtoCart(productId, totalStock, item);
    }
  };

  return (
    <>
      <div
        className="relative h-full w-full overflow-hidden bg-foreground group cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Top Left Like Icon */}
        <div className="absolute top-2 left-2 z-20">
          <button
            onClick={(e) => {
              // Prevent triggering card click when toggling like
              e.stopPropagation();
              setLiked(!liked);
            }}
            className="p-1 rounded-full transition-colors duration-200 bg-white/20 hover:bg-white/30"
            title="Like"
          >
            <Heart className={classNames("w-5 h-5", liked ? "text-2xl text-muted" : "text-white")} />
          </button>
        </div>

        {/* Video Element for Desktop */}
        {item?.video && !isMobile && (
          <>
            <video
              className="absolute right-0 top-1/2 h-auto w-24 max-w-none -translate-y-1/2 object-cover md:left-1/2 md:h-[640px] md:w-[590px] md:-translate-x-1/2"
              src={item.video}
              autoPlay
              loop
              muted
              playsInline
              onLoadedData={() => setDesktopVideoLoading(false)}
            />
            {desktopVideoLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                <svg
                  className="animate-spin h-10 w-10 text-[#EC003F] drop-shadow-lg"
                  xmlns="https://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-20 stroke-current"
                    cx="12"
                    cy="12"
                    r="10"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-90 fill-current"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              </div>
            )}
          </>
        )}

        {/* Video Preview for Mobile: each small div shows autoplay preview */}
        {item?.video && isMobile && (
          <video
            className="w-full h-32 object-cover"
            src={item.video}
            autoPlay
            loop
            muted
            playsInline
          />
        )}

        {/* Texture Layer */}
        <div
          className={classNames(
            "inset-0 opacity-25 duration-300 before:absolute before:bottom-0 before:right-0 before:top-[-148px] before:z-10 before:bg-texture after:bottom-[28px] after:left-0 after:right-[-434px] after:top-0 after:z-10 after:bg-texture md:absolute md:transition-opacity",
            isStripeOpen ? "md:opacity-25" : "md:opacity-0"
          )}
        />

        {/* Overlay for Desktop */}
        <div className="hidden md:absolute inset-0 bg-black opacity-35"></div>

        {/* Text Content for Desktop */}
        <div
          className={classNames(
            "left-8 top-8 w-[590px] p-4 transition-[transform,opacity] md:absolute md:p-0",
            isStripeOpen
              ? "md:translate-x-0 md:opacity-100"
              : "md:translate-x-4 md:opacity-0"
          )}
        >
          <p className="leading-tight text-white text-lg font-bold md:text-4xl">
            {item?.title}
          </p>
        </div>

        {/* Action Area for Desktop */}
        {isStripeOpen && !isMobile && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[200px]  shadow-xl overflow-hidden backdrop-blur-md bg-white/10 border border-white/20 group-hover:scale-105 transition-transform duration-300 pr-6">
            <div className="absolute top-2 right-2">
              <ExternalLink
                className="text-white w-4 h-4 hover:text-gray-400 cursor-pointer"
                onClick={() => handleViewDetails(item?._id)}
              />
            </div>
            <div className="p-2 flex items-center justify-center gap-4">
              <div className="w-1/3">
                {item?.image && (
                  <img
                    src={item.image[0]}
                    alt={item.title}
                    className="w-16 h-20 object-cover shadow-md border border-gray-200"
                  />
                )}
              </div>
              <div className="flex flex-col gap-2 items-center w-2/3">
                <p className="text-lg font-bold text-white">₹ {item?.salePrice}</p>
                <button
                  onClick={() => handleAddToCartClick(item?._id, item?.totalStock)}
                  className="px-3 py-1 text-sm text-white rounded-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-800 transform transition-all hover:scale-105 shadow-lg animate-fade-slide-up delay-500"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Modal: Displays video with autoplay, a close button, title, price, and add-to-cart button */}
      {modalOpen && isMobile && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-2">
      <div className="relative bg-gray-900 rounded-lg overflow-hidden w-full max-w-md max-h-[90vh] m-4 flex flex-col">
        {/* Close Button */}
        <button
          onClick={handleCloseModal}
          className="absolute top-2 right-2 text-white z-10 p-1 bg-gray-800 rounded-full"
          title="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Video Section (Limited Height) */}
        <div className="relative w-full">
          {videoLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
              <svg
                className="animate-spin h-10 w-10 text-[#EC003F] drop-shadow-lg"
                xmlns="https://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-20 stroke-current"
                  cx="12"
                  cy="12"
                  r="10"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-90 fill-current"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            </div>
          )}
          {item?.video ? (
            <video
              className="w-full max-h-[70vh] h-auto object-cover rounded-t-lg"
              src={item.video}
              preload="auto"
              poster={item?.poster || ""}
              autoPlay
              loop
              muted
              playsInline
              onLoadedData={() => setVideoLoading(false)}
            />
          ) : (
            <div className="p-4">
              <p className="text-white">Video not available</p>
            </div>
          )}
        </div>

        {/* Text & Add to Cart Section */}
        <div className="p-4 bg-gray-800 overflow-y-auto flex-grow">
          <p className="text-white text-lg font-bold mb-2">{item?.title}</p>
          <p className="text-white text-lg font-bold mb-4">₹ {item?.salePrice}</p>
          <button
            onClick={() => handleAddToCartClick(item?._id, item?.totalStock)}
            className="w-full px-4 py-2 text-sm text-white rounded-md bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-800 transform transition-all hover:scale-105 shadow-lg"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )}
    </>
  );
};

export default FastMovingCard;