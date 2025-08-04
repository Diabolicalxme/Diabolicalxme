import { useDispatch, useSelector } from "react-redux";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useToast } from "../../components/ui/use-toast";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { addReview, getReviews } from "@/store/shop/review-slice";
import StarRatingComponent from "../../components/common/star-rating";
import ZoomableImage from "../../components/ui/zoomable-image";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { ChevronLeft, ChevronRight, Plus, Minus, ShoppingBag, CheckCircle, Star, Sparkles, Gem, Award, Heart, Scissors, Palette, Zap, Leaf, ChevronDown, ChevronUp } from "lucide-react";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import ProductSlider from "@/components/shopping-view/product-slider";
import { fetchAllProducts } from "@/store/admin/products-slice";
import { Helmet } from "react-helmet-async";
import { categoryMapping } from "@/config";

function ProductDetailsPage({ open, setOpen }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [expandedFAQ, setExpandedFAQ] = useState({});
  const { productList, productDetails } = useSelector((state) => state.shopProducts);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [zoomData, setZoomData] = useState({
    isHovering: false,
    zoomPosition: { x: 0, y: 0 },
    imageSrc: "",
  });
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { toast } = useToast();
  const { id: getCurrentProductId } = useParams();
  // Using location key so that even if same productId is used, we can fetch fresh details.
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [slideDirection, setSlideDirection] = useState(null);
  const [isSliding, setIsSliding] = useState(false);
  const swipeThreshold = 50; // Minimum swipe distance to trigger navigation

  // Touch references for direct swipe handling
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const mainImageRef = useRef(null);

  // Handle image navigation with animation
  const handleImageNavigation = (direction) => {
    if (isSliding) return;

    setSlideDirection(direction);
    setIsSliding(true);

    // Allow time for animation before changing the image
    setTimeout(() => {
      navigateImage(direction);

      // Reset animation state after transition completes
      setTimeout(() => {
        setIsSliding(false);
        setSlideDirection(null);
      }, 50);
    }, 150);
  };

  // Direct touch handlers for the main container
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const distance = touchEndX.current - touchStartX.current;

      // Check if the swipe distance is significant enough
      if (Math.abs(distance) > swipeThreshold && productDetails?.image && productDetails.image.length > 1) {
        // Determine swipe direction and navigate
        const direction = distance > 0 ? 'prev' : 'next';
        handleImageNavigation(direction);
      }
    }

    // Reset touch positions
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleZoomData = (data) => {
    setZoomData({
      ...data,
      imageSrc: selectedImage || ""
    });
  };

  const handleRatingChange = (getRating) => {
    setRating(getRating);
  };

  const handleAddToCart = (currentProductId, totalStock) => {
    setIsAddingToCart(true);
    if (!isAuthenticated) {
      toast({
        title: "Please log in to add items to the cart!",
        variant: "destructive",
      });
      // Reset the adding to cart state when user is not authenticated
      setIsAddingToCart(false);
      return;
    }

    // Check if a color is selected and if it's out of stock
    if (selectedColor && selectedColor.inventory <= 0) {
      toast({
        title: "Selected color is out of stock",
        variant: "destructive",
      });
      setIsAddingToCart(false);
      return;
    }

    // Check color inventory if a color is selected
    if (selectedColor) {
      let currentCartItems = cartItems.items || [];
      const itemIndex = currentCartItems.findIndex(
        (item) => item.productId === currentProductId &&
                  item.colors &&
                  item.colors._id === selectedColor._id
      );

      if (itemIndex > -1) {
        const currentQuantity = currentCartItems[itemIndex].quantity;
        if (currentQuantity + quantity > selectedColor.inventory) {
          toast({
            title: `Only ${selectedColor.inventory - currentQuantity} more can be added for this color`,
            variant: "destructive",
          });
          setIsAddingToCart(false);
          return;
        }
      } else if (quantity > selectedColor.inventory) {
        toast({
          title: `Only ${selectedColor.inventory} items available for this color`,
          variant: "destructive",
        });
        setIsAddingToCart(false);
        return;
      }
    } else {
      // Fallback to total stock check for products without colors
      let currentCartItems = cartItems.items || [];
      if (currentCartItems.length) {
        const itemIndex = currentCartItems.findIndex(
          (item) => item.productId === currentProductId
        );
        if (itemIndex > -1) {
          const currentQuantity = currentCartItems[itemIndex].quantity;
          if (currentQuantity + quantity > totalStock) {
            toast({
              title: `Only ${totalStock - currentQuantity} more can be added for this item`,
              variant: "destructive",
            });
            setIsAddingToCart(false);
            return;
          }
        }
      }
    }

    // Make sure we have a selected color
    if (!selectedColor && productDetails?.colors && productDetails.colors.length > 0) {
      setSelectedColor(productDetails.colors[0]);
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: currentProductId,
        quantity: quantity,
        colorId: selectedColor?._id,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        // Force a refresh of the cart items to ensure we have the latest data
        setIsAddingToCart(false);
        dispatch(fetchCartItems(user?.id)).then(() => {
          toast({
            title: `${quantity} item${quantity > 1 ? 's' : ''} added to cart`,
          });
          // Reset quantity to 1 after adding to cart
          setQuantity(1);
        });
      } else {
        // Reset loading state if the operation was not successful
        setIsAddingToCart(false);
        toast({
          title: data?.payload?.message || "Failed to add item to cart",
          variant: "destructive",
        });
      }
    }).catch(() => {
      // Reset loading state if there was an error
      setIsAddingToCart(false);
      toast({
        title: "An error occurred while adding to cart",
        variant: "destructive",
      });
    });
  };



  function handleRelatedProductsAddToCart(product) {
    const productId = product._id;
    const totalStock = product.totalStock;

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast({
        title: "Please log in to add items to the cart!",
        variant: "destructive",
      });
      // Return a rejected promise to signal the calling component to reset its loading state
      return Promise.reject("Not authenticated");
    }

    // Check if product is in stock
    if (totalStock <= 0) {
      toast({
        title: "This product is out of stock",
        variant: "destructive",
      });
      return Promise.reject("Out of stock");
    }

    // Check if adding one more would exceed stock limit
    let currentCartItems = cartItems.items || [];
    if (currentCartItems.length) {
      const itemIndex = currentCartItems.findIndex(
        (item) => item.productId === productId
      );
      if (itemIndex > -1) {
        const currentQuantity = currentCartItems[itemIndex].quantity;
        if (currentQuantity + 1 > totalStock) {
          toast({
            title: `Only ${totalStock} quantity available for this item`,
            variant: "destructive",
          });
          return Promise.reject("Exceeds stock limit");
        }
      }
    }

    // Get the first color if available
    const colorId = product?.colors && product.colors.length > 0
      ? product.colors[0]._id
      : undefined;

    // Add to cart
    return dispatch(
      addToCart({
        userId: user?.id,
        productId: productId,
        quantity: 1,
        colorId: colorId,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        // Force a refresh of the cart items to ensure we have the latest data
        return dispatch(fetchCartItems(user?.id)).then(() => {
          toast({
            title: "Product added to cart",
          });
          return data;
        });
      } else {
        // Show error message if the operation was not successful
        toast({
          title: data?.payload?.message || "Failed to add item to cart",
          variant: "destructive",
        });
        return Promise.reject("Operation failed");
      }
    }).catch((error) => {
      // Show error message if there was an exception
      if (error !== "Not authenticated" && error !== "Out of stock" && error !== "Exceeds stock limit" && error !== "Operation failed") {
        toast({
          title: "An error occurred while adding to cart",
          variant: "destructive",
        });
      }
      return Promise.reject(error);
    });
  }

  // Handle adding a review for the product
  const handleAddReview = () => {
    // Check authentication first before attempting to add a review
    if (!isAuthenticated) {
      toast({
        title: "Please log in to add a review!",
        variant: "destructive",
      });
      return;
    }

    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data.payload?.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({
          title: "Review added successfully!",
        });
      } else {
        const errorMessage =
          data.payload?.message || "Failed to add review. Please try again.";
        toast({
          title: errorMessage,
          variant: "destructive",
        });
      }
    }).catch(() => {
      toast({
        title: "An error occurred while adding your review",
        variant: "destructive",
      });
    });
  };

  // Calculate average review value
  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) / reviews.length
      : 0;

  // Handle color selection - directly use the color's image
  const handleColorSelect = (colorItem) => {
    setSelectedColor(colorItem);
    // Directly set the color's image as the selected image
    if (colorItem?.image) {
      setSelectedImage(colorItem.image);
    }
  };

  // Handle quantity increase
  const increaseQuantity = () => {
    // Check if increasing would exceed stock
    if (productDetails?.totalStock && quantity < productDetails.totalStock) {
      setQuantity(prev => prev + 1);
    } else {
      toast({
        title: `Maximum available quantity is ${productDetails?.totalStock}`,
        variant: "destructive",
      });
    }
  };

  // Handle quantity decrease
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Toggle FAQ section
  const toggleFAQ = (index) => {
    setExpandedFAQ(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const renderDescriptionBulletPoints = (description) => {
    return description
      // Split on both literal "\n" and actual new lines
      .split(/\\n|\n/)
      .filter((point) => point.trim() !== "")
      .map((point) => {
        const colonIndex = point.indexOf(":");
        if (colonIndex !== -1) {
          // Extract text before and after the colon, ensuring clean formatting
          const beforeColon = point.substring(0, colonIndex).trim();
          const afterColon = point.substring(colonIndex + 1).trim();
          return (
            <>
              <span className="font-semibold">{beforeColon}:</span> {afterColon}
            </>
          );
        }
        return point.trim();
      });
  };


  // Fetch product details when component mounts or when the location changes.
  useEffect(() => {
    const fetchData = async () => {
      if (getCurrentProductId) {
        await dispatch(fetchProductDetails(getCurrentProductId));
      }

      // Check if productList is empty or needs to be refreshed
      if (!productList || productList.length === 0) {
        await dispatch(fetchAllProducts()); // Make sure this action exists in your products-slice
      }
    };

    fetchData();
  }, [getCurrentProductId, location.key, dispatch]);

  // Fetch reviews and set the default selected image when product details are updated.
  useEffect(() => {
    if (productDetails?._id) {
      dispatch(getReviews(productDetails._id));

      // Set the default selected image
      if (productDetails?.image && productDetails.image.length > 0) {
        setSelectedImage(productDetails.image[0]);
      }

      // Set default selected color if available
      if (productDetails?.colors && productDetails.colors.length > 0) {
        setSelectedColor(productDetails.colors[0]);
      }

      // Reset quantity to 1 when product changes
      setQuantity(1);
    }
  }, [productDetails?._id, productDetails?.image, productDetails?.colors, dispatch]);

  // Separate useEffect to compute related products whenever productList or productDetails changes
  useEffect(() => {
    if (productList && productList.length > 0 && productDetails && productDetails._id && productDetails.category) {
      const filtered = productList.filter(
        (product) =>
          product?.category === productDetails?.category &&
          product._id !== productDetails?._id
      );
      setRelatedProducts(filtered);
    } else {
      // Reset related products if data is missing
      setRelatedProducts([]);
    }
  }, [productList, productDetails]);



  // Update zoomData.imageSrc when selectedImage changes
  useEffect(() => {
    if (selectedImage) {
      setZoomData(prevData => ({
        ...prevData,
        imageSrc: selectedImage
      }));
    }
  }, [selectedImage]);

  // Navigation functions for image carousel
  const navigateImage = (direction) => {
    if (!productDetails?.image || productDetails.image.length <= 1) return;

    const currentIndex = productDetails.image.findIndex(img => img === selectedImage);
    let newIndex;

    if (direction === 'next') {
      newIndex = (currentIndex + 1) % productDetails.image.length;
    } else {
      newIndex = (currentIndex - 1 + productDetails.image.length) % productDetails.image.length;
    }

    setSelectedImage(productDetails.image[newIndex]);
  };

  // Get CSS class for slide animation
  const getSlideAnimationClass = () => {
    if (!slideDirection) return '';

    return slideDirection === 'next'
      ? 'animate-slide-left'
      : 'animate-slide-right';
  };

  // Create structured data for product
  const structuredData = productDetails ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": productDetails.title,
    "image": productDetails.image,
    "description": productDetails.description,
    "sku": productDetails.productCode || "",
    "brand": {
      "@type": "Brand",
      "name": "Rachana Boutique"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "INR",
      "price": productDetails.salePrice > 0 ? productDetails.salePrice : productDetails.price,
      "availability": productDetails.totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "aggregateRating": reviews && reviews.length > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": averageReview.toFixed(1),
      "reviewCount": reviews.length
    } : undefined
  } : null;

  // Create breadcrumb structured data with SEO-friendly URLs
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://rachanaboutique.in/shop/home"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Collections",
        "item": "https://rachanaboutique.in/shop/collections"
      }
    ]
  };

  // Add category to breadcrumb if available
  if (productDetails?.category) {
    const categoryInfo = categoryMapping.find(cat => cat.id === productDetails.category);
    if (categoryInfo) {
      breadcrumbData.itemListElement.push({
        "@type": "ListItem",
        "position": 3,
        "name": categoryInfo.name,
        "item": `https://rachanaboutique.in/shop/category/${categoryInfo.slug}`
      });

      // Add product as the last item
      breadcrumbData.itemListElement.push({
        "@type": "ListItem",
        "position": 4,
        "name": productDetails?.title || "Product",
        "item": window.location.href
      });
    } else {
      // If category mapping not found, add product as the last item
      breadcrumbData.itemListElement.push({
        "@type": "ListItem",
        "position": 3,
        "name": productDetails?.title || "Product",
        "item": window.location.href
      });
    }
  } else {
    // If no category, add product as the last item
    breadcrumbData.itemListElement.push({
      "@type": "ListItem",
      "position": 3,
      "name": productDetails?.title || "Product",
      "item": window.location.href
    });
  }

  return (
    <>
      <Helmet>
        <title>{productDetails?.title ? `${productDetails.title} | Rachana Boutique` : 'Product Details | Rachana Boutique'}</title>
        <meta
          name="description"
          content={productDetails?.description ?
            `${productDetails.description.substring(0, 150)}... Buy now at Rachana Boutique.` :
            "Explore our exclusive collection of premium sarees and ethnic wear at Rachana Boutique."}
        />
        <meta
          name="keywords"
          content={`${productDetails?.title || 'saree'}, ${productDetails?.secondTitle || 'ethnic wear'}, ${productDetails?.productCode || ''}, Rachana Boutique, buy sarees online`}
        />
        <meta name="robots" content="index, follow" />

        {/* Open Graph tags */}
        <meta property="og:title" content={productDetails?.title ? `${productDetails.title} | Rachana Boutique` : 'Product Details | Rachana Boutique'} />
        <meta
          property="og:description"
          content={productDetails?.description ?
            `${productDetails.description.substring(0, 150)}... Shop now at Rachana Boutique.` :
            "Discover premium sarees and ethnic wear at Rachana Boutique."}
        />
        <meta property="og:image" content={productDetails?.image && productDetails.image.length > 0 ? productDetails.image[0] : ''} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="product" />
        <meta property="product:price:amount" content={productDetails?.salePrice > 0 ? productDetails.salePrice : productDetails?.price} />
        <meta property="product:price:currency" content="INR" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={productDetails?.title ? `${productDetails.title} | Rachana Boutique` : 'Product Details | Rachana Boutique'} />
        <meta
          name="twitter:description"
          content={productDetails?.description ?
            `${productDetails.description.substring(0, 150)}... Shop now at Rachana Boutique.` :
            "Discover premium sarees and ethnic wear at Rachana Boutique."}
        />
        <meta name="twitter:image" content={productDetails?.image && productDetails.image.length > 0 ? productDetails.image[0] : ''} />

        {/* Canonical URL */}
        <link rel="canonical" href={window.location.href} />

        {/* JSON-LD structured data */}
        {structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      </Helmet>

        <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr] gap-12 md:gap-16">

        <div className="flex items-start gap-4">
          {/* Left Arrow - Desktop Only */}
          {productDetails?.image && productDetails.image.length > 1 && (
            <button
              onClick={() => handleImageNavigation('prev')}
              className="mt-72 hidden md:block bg-white hover:bg-gray-100 rounded-full p-2 shadow-md transition-all duration-300 hover:scale-110 border border-gray-200"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
          )}

          <div className="flex flex-col gap-4">

            {/* Main Image Container */}
            <div
              className="flex-1 relative"
              ref={mainImageRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className={`${getSlideAnimationClass()}`}>
                <ZoomableImage
                  imageSrc={selectedImage}
                  imageAlt={productDetails?.title}
                  onZoomData={handleZoomData}
                  onNavigate={handleImageNavigation}
                  images={productDetails?.image}
                />
              </div>

              {/* Mobile Arrows - Only visible on mobile */}
              {productDetails?.image && productDetails.image.length > 1 && (
                <div className="md:hidden">
                  <button
                    onClick={() => handleImageNavigation("prev")}
                    className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-300"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-800" />
                  </button>
                  <button
                    onClick={() => handleImageNavigation("next")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-300"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-800" />
                  </button>
                </div>
              )}
            </div>
            {/* Render all images as thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {productDetails?.image?.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Thumbnail ${index}`}
                  className={`w-full h-24 md:h-32 object-cover cursor-pointer transition-all duration-300 ${selectedImage === image ? "border-4 border-black" : "border border-gray-200 hover:border-gray-400"}`}
                  onClick={() => setSelectedImage(image)}
                />
              ))}
            </div>
          </div>

          {/* Right Arrow - Desktop Only */}
          {productDetails?.image && productDetails.image.length > 1 && (
            <button
              onClick={() => handleImageNavigation('next')}
              className="mt-72 hidden md:block bg-white hover:bg-gray-100 rounded-full p-2 shadow-md transition-all duration-300 hover:scale-110 border border-gray-200"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>
          )}
        </div>




        <div className="flex flex-col gap-8 relative">
          {/* Enhanced Product Title Section with elegant styling */}
          <div className="text-center flex flex-col items-center relative">
            {/* Subtle decorative element */}
            {/* <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div> */}

            {/* Product code displayed above title for better hierarchy */}
            {productDetails?.productCode && (
              <div className="inline-block mb-4 tracking-widest">
                <span className="text-sm text-gray-400 uppercase">Product Code</span>
                <div className="text-base font-medium text-gray-600 mt-1">{productDetails?.productCode}</div>
              </div>
            )}

            {/* Main title with refined styling */}
            <h1 className="text-3xl text-black/80 md:text-4xl font-light uppercase tracking-wide mb-3 relative">
              {productDetails?.title}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-12 h-0.5 bg-black"></div>
            </h1>

            {/* Subtitle with improved styling */}
            <h2 className="text-lg md:text-xl text-gray-500 mt-4 max-w-lg">
              {productDetails?.secondTitle}
            </h2>
          </div>

          {/* Product Description with creative icons */}
          <div className="hidden md:block text-center max-w-2xl mx-auto">
            {productDetails?.description && (
              <div className="space-y-5">
                {renderDescriptionBulletPoints(productDetails.description).map((point, index) => {
                  // Array of Lucide icons to use for description points
                  const icons = [CheckCircle, Star, Sparkles, Gem, Award, Heart, Scissors, Palette, Zap, Leaf];
                  // Select an icon based on the index (cycling through the array)
                  const IconComponent = icons[index % icons.length];

                  return (
                    <div key={index} className="flex items-start gap-3 text-left transform transition-all duration-300 hover:translate-x-1">
                      <div className="text-black mt-1 flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-gray-700" strokeWidth={1.5} />
                      </div>
                      <div className="text-gray-700 text-lg">{point}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Clean Price Display */}
          <div className="flex items-center justify-center gap-8 mt-2">
            {productDetails?.salePrice > 0 ? (
              <>
                <div className="flex flex-col items-center">
                  <p className="text-2xl md:text-3xl font-medium line-through text-gray-400">
                    ₹{productDetails?.price}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-2xl md:text-3xl font-medium text-black">
                    ₹{productDetails?.salePrice}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <p className="text-2xl md:text-3xl font-medium">
                  ₹{productDetails?.price}
                </p>
              </div>
            )}
          </div>

          {/* Color Selection with clean styling */}
          {productDetails?.colors && productDetails.colors.length > 0 && (
            <div className="bg-black/5 p-4 mt-2 w-full">
              <div className="w-full text-center">
                <Label className="text-lg font-semibold uppercase tracking-wide mb-4 block relative inline-block">
                  Colors
                </Label>

                <div className="flex justify-center gap-5 mx-auto">
                  {productDetails.colors.map((colorItem, index) => {
                    const isOutOfStock = colorItem.inventory <= 0;
                    return (
                      <div
                        key={index}
                        onClick={() => !isOutOfStock && handleColorSelect(colorItem)}
                        className={`flex flex-col items-center transition-all duration-300 w-20 relative
                          ${isOutOfStock
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer"}
                          ${selectedColor && selectedColor._id === colorItem._id
                            ? "transform scale-110"
                            : !isOutOfStock ? "hover:scale-105" : ""}
                        `}
                      >
                        <div className={`w-full h-16 overflow-hidden ${selectedColor && selectedColor._id === colorItem._id ? "ring-2 ring-black ring-offset-2" : ""}`}>
                          <img
                            src={colorItem.image}
                            alt={colorItem.title}
                            className={`w-full h-full object-cover transition-transform duration-500 ${!isOutOfStock ? "hover:scale-110" : ""}`}
                          />
                          {/* {isOutOfStock && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">Out of Stock</span>
                            </div>
                          )} */}
                        </div>
                        <p className="mt-2 text-sm font-medium text-center">
                          {colorItem.title}
                        </p>
                        {isOutOfStock && (
                          <p className="text-xs text-red-500 font-medium">Out of Stock</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Quantity Control and Add to Cart Button on the same line */}
          <div className="mt-6">
            <div className="flex justify-center">
              {productDetails?.totalStock === 0 ? (
                <div className="w-full max-w-md px-8 py-3 opacity-60 cursor-not-allowed text-gray-500 uppercase tracking-wider text-sm font-medium flex items-center justify-center gap-2 border-b-2 border-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Out of Stock</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4 w-full max-w-md">
                  {/* Quantity Controls */}
                  {productDetails?.totalStock > 0 && (
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button
                        onClick={decreaseQuantity}
                        className="px-3 py-2 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
                        aria-label="Decrease quantity"
                        disabled={quantity <= 1}
                      >
                        <Minus className={`h-4 w-4 ${quantity <= 1 ? 'text-gray-300' : 'text-black'}`} />
                      </button>

                      <div className="px-3 py-2 min-w-[40px] text-center">
                        <span className="text-lg font-medium">{quantity}</span>
                      </div>

                      <button
                        onClick={increaseQuantity}
                        className="px-3 py-2 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
                        aria-label="Increase quantity"
                        disabled={quantity >= productDetails.totalStock}
                      >
                        <Plus className={`h-4 w-4 ${quantity >= productDetails.totalStock ? 'text-gray-300' : 'text-black'}`} />
                      </button>
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <button
                    className="flex-1 px-6 py-2 bg-black text-white hover:bg-white hover:text-black border-2 border-black transition-all duration-300 uppercase tracking-wider text-sm font-medium flex items-center justify-center gap-2 group"
                    onClick={() =>
                      handleAddToCart(productDetails?._id, productDetails?.totalStock)
                    }
                    disabled={isAddingToCart}
                  >
                    {isAddingToCart ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white group-hover:text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Adding to Cart...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* FAQ-Style Product Information - Desktop Only */}
          <div className="hidden md:block mt-8 w-full max-w-2xl mx-auto">
            <div className="w-full">
              {/* Color Accuracy Notice */}
              <div className="w-full border-b border-gray-200">
                <button
                  onClick={() => toggleFAQ('color')}
                  className="w-full flex items-center justify-between py-5 text-left hover:bg-gray-50/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-300">
                      <Palette className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="font-bold text-gray-800 text-lg">Color Accuracy Notice</span>
                  </div>
                  <div className={`transition-transform duration-300 ${expandedFAQ['color'] ? 'rotate-180' : ''}`}>
                    <Plus className="h-5 w-5 text-gray-600" />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  expandedFAQ['color'] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="pb-5 text-lg text-gray-700 leading-relaxed">
                    <div className="pl-11">
                      Slight variations in colour may occur due to photographic lighting and individual monitor settings. We strive to represent colors as accurately as possible to ensure your satisfaction.
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Order Processing */}
              <div className="w-full border-b border-gray-200">
                <button
                  onClick={() => toggleFAQ('shipping')}
                  className="w-full flex items-center justify-between py-5 text-left hover:bg-gray-50/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-300">
                      <Zap className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="font-bold text-gray-800 text-lg">Shipping Order Processing</span>
                  </div>
                  <div className={`transition-transform duration-300 ${expandedFAQ['shipping'] ? 'rotate-180' : ''}`}>
                    <Plus className="h-5 w-5 text-gray-600" />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  expandedFAQ['shipping'] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="pb-5 text-lg text-gray-700 leading-relaxed">
                    <div className="pl-11">
                      Orders are shipped after we receive them, which may affect processing time. A tracking link will be shared via email once dispatched for your convenience.
                    </div>
                  </div>
                </div>
              </div>

              {/* Wash Care Instructions */}
              <div className="w-full border-b border-gray-200">
                <button
                  onClick={() => toggleFAQ('washcare')}
                  className="w-full flex items-center justify-between py-5 text-left hover:bg-gray-50/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-300">
                      <Leaf className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="font-bold text-gray-800 text-lg">Wash Care Instructions</span>
                  </div>
                  <div className={`transition-transform duration-300 ${expandedFAQ['washcare'] ? 'rotate-180' : ''}`}>
                    <Plus className="h-5 w-5 text-gray-600" />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  expandedFAQ['washcare'] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="pb-5 text-lg text-gray-700 leading-relaxed">
                    <div className="pl-11">
                      Dry clean recommended for best results. If hand washing, use cold water with mild detergent. Avoid direct sunlight when drying to preserve fabric quality and colour.
                    </div>
                  </div>
                </div>
              </div>

              {/* Return & Exchange Policy */}
              <div className="w-full border-b border-gray-200">
                <button
                  onClick={() => toggleFAQ('return')}
                  className="w-full flex items-center justify-between py-5 text-left hover:bg-gray-50/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-300">
                      <Award className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="font-bold text-gray-800 text-lg">Return & Exchange Policy</span>
                  </div>
                  <div className={`transition-transform duration-300 ${expandedFAQ['return'] ? 'rotate-180' : ''}`}>
                    <Plus className="h-5 w-5 text-gray-600" />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  expandedFAQ['return'] ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="pb-5 text-lg text-gray-700 leading-relaxed">
                    <div className="pl-11 space-y-3">
                      <div>
                        <p className="font-bold text-gray-800 mb-1">Damaged or Incorrect Item</p>
                        <p>To be eligible for return/exchange, you must share an unedited unpacking video clearly showing the sealed package and the issue.</p>
                      </div>

                      <div>
                        <p className="font-bold text-gray-800 mb-1">Contact Timeline</p>
                        <p>Reach out within 2 days of delivery via WhatsApp at +91 9994412667 to initiate a return/exchange.</p>
                      </div>

                      <div>
                        <p className="font-bold text-gray-800 mb-1">Return Shipping Details</p>
                        <p>Return shipping by customer (unless wrong/damaged item) use INDIA POST only. Rs 100/- courier fee will be reimbursed.</p>
                      </div>

                      <div>
                        <p className="font-bold text-gray-800 mb-1">Replacement Timeline</p>
                        <p>Once your return is received and approved, a replacement will be shipped within 5 business days.</p>
                      </div>

                      <div>
                        <p className="font-bold text-gray-800 mb-1">💰 Refunds (if applicable)</p>
                        <p>If a replacement isn't available, a refund will be processed within 2 working days.</p>
                      </div>

                      <div>
                        <p className="font-bold text-gray-800 mb-1">⚠ No Return/Refund/Exchange for:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Items bought on sale or discounts</li>
                          <li>Beaded/sequined products (minor fall-off is considered normal)</li>
                          <li>Cases of personal dislike or unmet expectations</li>
                          <li>International Orders</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden">
          <div className="text-center max-w-2xl mx-auto">
            {productDetails?.description && (
              <div className="space-y-5">
                {renderDescriptionBulletPoints(productDetails.description).map((point, index) => {
                  // Array of Lucide icons to use for description points
                  const icons = [CheckCircle, Star, Sparkles, Gem, Award, Heart, Scissors, Palette, Zap, Leaf];
                  // Select an icon based on the index (cycling through the array)
                  const IconComponent = icons[index % icons.length];

                  return (
                    <div key={index} className="flex items-start gap-3 text-left transform transition-all duration-300 hover:translate-x-1">
                      <div className="text-black mt-1 flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-gray-700" strokeWidth={1.5} />
                      </div>
                      <div className="text-gray-700 text-lg">{point}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

            {/* FAQ-Style Product Information - Mobile Only */}
            <div className="mt-8 w-full">
              {/* Color Accuracy Notice */}
              <div className="w-full border-b border-gray-200">
                <button
                  onClick={() => toggleFAQ('color-mobile')}
                  className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors duration-300">
                      <Palette className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="font-bold text-gray-800 text-lg">Color Accuracy Notice</span>
                  </div>
                  <div className={`transition-transform duration-300 flex-shrink-0 ${expandedFAQ['color-mobile'] ? 'rotate-180' : ''}`}>
                    <Plus className="h-5 w-5 text-gray-600" />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  expandedFAQ['color-mobile'] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="pb-4 text-lg text-gray-700 leading-relaxed">
                    <div className="pl-11">
                      Slight variations in colour may occur due to photographic lighting and individual monitor settings. We strive to represent as accurately as possible.
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Order Processing */}
              <div className="w-full border-b border-gray-200">
                <button
                  onClick={() => toggleFAQ('shipping-mobile')}
                  className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors duration-300">
                      <Zap className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="font-bold text-gray-800 text-lg">Shipping Order Processing</span>
                  </div>
                  <div className={`transition-transform duration-300 flex-shrink-0 ${expandedFAQ['shipping-mobile'] ? 'rotate-180' : ''}`}>
                    <Plus className="h-5 w-5 text-gray-600" />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  expandedFAQ['shipping-mobile'] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="pb-4 text-lg text-gray-700 leading-relaxed">
                    <div className="pl-11">
                      Orders are shipped after we receive them, which may affect processing time. A tracking link will be shared via email once dispatched.
                    </div>
                  </div>
                </div>
              </div>

              {/* Wash Care Instructions */}
              <div className="w-full border-b border-gray-200">
                <button
                  onClick={() => toggleFAQ('washcare-mobile')}
                  className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors duration-300">
                      <Leaf className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="font-bold text-gray-800 text-lg">Wash Care Instructions</span>
                  </div>
                  <div className={`transition-transform duration-300 flex-shrink-0 ${expandedFAQ['washcare-mobile'] ? 'rotate-180' : ''}`}>
                    <Plus className="h-5 w-5 text-gray-600" />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  expandedFAQ['washcare-mobile'] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="pb-4 text-lg text-gray-700 leading-relaxed">
                    <div className="pl-11">
                      Dry clean recommended for best results. If hand washing use cold water with mild detergent. Avoid direct sunlight when drying to preserve fabric quality and colour.
                    </div>
                  </div>
                </div>
              </div>

              {/* Return & Exchange Policy */}
              <div className="w-full border-b border-gray-200">
                <button
                  onClick={() => toggleFAQ('return-mobile')}
                  className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors duration-300">
                      <Award className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="font-bold text-gray-800 text-lg">Return & Exchange Policy</span>
                  </div>
                  <div className={`transition-transform duration-300 flex-shrink-0 ${expandedFAQ['return-mobile'] ? 'rotate-180' : ''}`}>
                    <Plus className="h-5 w-5 text-gray-600" />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  expandedFAQ['return-mobile'] ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="pb-4 text-lg text-gray-700 leading-relaxed">
                    <div className="pl-11 space-y-3">
                      <div>
                        <p className="font-bold text-gray-800 mb-1">Damaged or Incorrect Item</p>
                        <p>To be eligible for return/exchange, you must share an unedited unpacking video clearly showing the sealed package and the issue.</p>
                      </div>

                      <div>
                        <p className="font-bold text-gray-800 mb-1">Contact Timeline</p>
                        <p>Reach out within 2 days of delivery via WhatsApp at +91 9994412667 to initiate a return/exchange.</p>
                      </div>

                      <div>
                        <p className="font-bold text-gray-800 mb-1">Return Shipping Details</p>
                        <p>Return shipping by customer (unless wrong/damaged item) use INDIA POST only. Rs 100/- courier fee will be reimbursed.</p>
                      </div>

                      <div>
                        <p className="font-bold text-gray-800 mb-1">Replacement Timeline</p>
                        <p>Once your return is received and approved, a replacement will be shipped within 5 business days.</p>
                      </div>

                      <div>
                        <p className="font-bold text-gray-800 mb-1">💰 Refunds (if applicable)</p>
                        <p>If a replacement isn't available, a refund will be processed within 2 working days.</p>
                      </div>

                      <div>
                        <p className="font-bold text-gray-800 mb-1">⚠ No Return/Refund/Exchange for:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Items bought on sale or discounts</li>
                          <li>Beaded/sequined products (minor fall-off is considered normal)</li>
                          <li>Cases of personal dislike or unmet expectations</li>
                          <li>International Orders</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        <div className="flex flex-col justify-between">



          {/* <div className="flex items-center gap-2 mt-4">
              <StarRatingComponent disableHover={true} rating={averageReview} />
              <span className="text-muted-foreground">
                ({averageReview.toFixed(2)})
              </span>
            </div> */}
          {zoomData.isHovering && (
            <div
              className="hidden md:block absolute top-[24%] left-[51%] z-10 w-[40%] h-3/4 overflow-hidden border shadow-lg bg-white"
              style={{
                backgroundImage: `url(${zoomData.imageSrc})`,
                backgroundPosition: `${zoomData.zoomPosition.x}% ${zoomData.zoomPosition.y}%`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "300%",
              }}
            ></div>
          )}



          {/* <div>
            <h2 className="text-xl font-bold mb-4">Reviews</h2>
            <div className="grid gap-6">
              {reviews && reviews.length > 0 ? (
                reviews.map((reviewItem) => (
                  <div className="flex gap-4" key={reviewItem._id}>
                    <Avatar className="w-10 h-10 border">
                      <AvatarFallback>
                        {reviewItem?.userName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">
                          {reviewItem?.userName}
                        </h3>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <StarRatingComponent disableHover rating={reviewItem?.reviewValue} />
                      </div>
                      <p className="text-muted-foreground">
                        {reviewItem.reviewMessage}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <h1>No Reviews</h1>
              )}
            </div>

            <div className="mt-10 flex-col flex gap-2">
              <Label>Write a review</Label>
              <div className="flex gap-1">
                <StarRatingComponent
                  rating={rating}
                  handleRatingChange={handleRatingChange}
                />
              </div>
              <Textarea
                name="reviewMsg"
                value={reviewMsg}
                onChange={(event) => setReviewMsg(event.target.value)}
                placeholder="Write a review..."
              />
              <Button className="w-24" onClick={handleAddReview} disabled={reviewMsg.trim() === ""}>
                Submit
              </Button>
            </div>
          </div> */}


        </div>

      </div>


      <Separator />
      {/* Related Products */}
      <div className="-mx-3.5">
        {relatedProducts && relatedProducts.length > 0 && (
          <ProductSlider
            products={relatedProducts}
            handleGetProductDetails={(productId) => navigate(`/shop/details/${productId}`)}
            handleAddtoCart={handleRelatedProductsAddToCart}
            title="You May Also Like"
            description="Discover more items that complement your style"
            bgColor="bg-white"
          />
        )}
        </div>
      </div>
    </>
  );
}

export default ProductDetailsPage;