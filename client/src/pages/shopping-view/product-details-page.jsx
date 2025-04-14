import { useDispatch, useSelector } from "react-redux";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "../../components/ui/use-toast";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { addReview, getReviews } from "@/store/shop/review-slice";
import StarRatingComponent from "../../components/common/star-rating";
import ZoomableImage from "../../components/ui/zoomable-dialog-box";
import { Label } from "../../components/ui/label";
import { ChevronLeft, ChevronRight, Plus, Minus, ShoppingBag, CheckCircle, Star, Sparkles, Gem, Award, Heart, Scissors, Palette, Zap, Leaf } from "lucide-react";
import ReviewSection from "@/components/shopping-view/review-section";
import ProductSlider from "@/components/shopping-view/product-slider";
import { fetchAllProducts } from "@/store/admin/products-slice";
import { Helmet } from "react-helmet-async";
import { categoryMapping } from "@/config";

function ProductDetailsPage() {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
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
  // Minimum swipe distance to trigger navigation

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
          return;
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
        dispatch(fetchProductDetails(getCurrentProductId));
      }

      // Check if productList is empty or needs to be refreshed
      if (!productList || productList.length === 0) {
        dispatch(fetchAllProducts()); // Make sure this action exists in your products-slice
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
      "name": "DiabolicalXme"
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
        <title>{productDetails?.title ? `${productDetails.title} | DiabolicalXme` : 'Product Details | DiabolicalXme'}</title>
        <meta
          name="description"
          content={productDetails?.description ?
            `${productDetails.description.substring(0, 150)}... Buy now at DiabolicalXme.` :
            "Explore our exclusive collection of bold contemporary fashion at DiabolicalXme."}
        />
        <meta
          name="keywords"
          content={`${productDetails?.title || 'clothing'}, ${productDetails?.secondTitle || 'contemporary fashion'}, ${productDetails?.productCode || ''}, DiabolicalXme, bold fashion`}
        />
        <meta name="robots" content="index, follow" />

        {/* Open Graph tags */}
        <meta property="og:title" content={productDetails?.title ? `${productDetails.title} | DiabolicalXme` : 'Product Details | DiabolicalXme'} />
        <meta
          property="og:description"
          content={productDetails?.description ?
            `${productDetails.description.substring(0, 150)}... Shop now at DiabolicalXme.` :
            "Discover bold contemporary fashion at DiabolicalXme."}
        />
        <meta property="og:image" content={productDetails?.image && productDetails.image.length > 0 ? productDetails.image[0] : ''} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="product" />
        <meta property="product:price:amount" content={productDetails?.salePrice > 0 ? productDetails.salePrice : productDetails?.price} />
        <meta property="product:price:currency" content="INR" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={productDetails?.title ? `${productDetails.title} | DiabolicalXme` : 'Product Details | DiabolicalXme'} />
        <meta
          name="twitter:description"
          content={productDetails?.description ?
            `${productDetails.description.substring(0, 150)}... Shop now at DiabolicalXme.` :
            "Discover bold contemporary fashion at DiabolicalXme."}
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
        {/* Product Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr] gap-12 md:gap-16">

        <div className="flex items-start gap-4">
          {/* Left Arrow - Desktop Only */}
          {productDetails?.image && productDetails.image.length > 1 && (
            <button
              onClick={() => handleImageNavigation('prev')}
              className="mt-72 hidden md:block bg-card hover:bg-muted/30 rounded-full p-2 shadow-md transition-all duration-300 hover:scale-110 border border-input"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6 text-foreground" />
            </button>
          )}

          <div className="flex flex-col gap-4">

            {/* Main Image Container */}
            <div className="flex-1 relative">
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
                    className="absolute left-1 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card rounded-full p-2 shadow-md transition-all duration-300"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5 text-foreground" />
                  </button>
                  <button
                    onClick={() => handleImageNavigation("next")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card rounded-full p-2 shadow-md transition-all duration-300"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5 text-foreground" />
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
                  className={`w-full h-24 md:h-32 object-cover cursor-pointer transition-all duration-300 ${selectedImage === image ? "border-4 border-primary" : "border border-input hover:border-muted-foreground"}`}
                  onClick={() => setSelectedImage(image)}
                />
              ))}
            </div>
          </div>

          {/* Right Arrow - Desktop Only */}
          {productDetails?.image && productDetails.image.length > 1 && (
            <button
              onClick={() => handleImageNavigation('next')}
              className="mt-72 hidden md:block bg-card hover:bg-muted/30 rounded-full p-2 shadow-md transition-all duration-300 hover:scale-110 border border-input"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6 text-foreground" />
            </button>
          )}
        </div>




        <div className="flex flex-col gap-8 relative">
          {/* Enhanced Product Title Section with elegant styling */}
          <div className="text-center flex flex-col items-center relative">
            {/* Subtle decorative element */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

            {/* Product code displayed above title for better hierarchy */}
            {productDetails?.productCode && (
              <div className="inline-block mb-4 tracking-widest">
                <span className="text-sm text-gray-400 uppercase">Product Code</span>
                <div className="text-base font-medium text-gray-600 mt-1">{productDetails?.productCode}</div>
              </div>
            )}

            {/* Main title with refined styling */}
            <h1 className="text-3xl md:text-4xl font-light uppercase tracking-wide my-3 relative">
              {productDetails?.title}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-12 h-0.5 bg-primary"></div>
            </h1>

            {/* Subtitle with improved styling */}
            <h2 className="text-lg md:text-xl text-muted-foreground mt-4 max-w-lg">
              {productDetails?.secondTitle}
            </h2>

            {/* Star Rating - Moved to a more prominent position */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <StarRatingComponent disableHover={true} rating={averageReview} size="default" />
              <span className="text-muted-foreground">
                ({reviews?.length || 0} {reviews?.length === 1 ? 'review' : 'reviews'}) • {averageReview.toFixed(1)}/5
              </span>
            </div>
          </div>

          {/* Product Description with creative icons */}
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
                      <div className="text-foreground mt-1 flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-primary" strokeWidth={1.5} />
                      </div>
                      <div className="text-foreground text-lg">{point}</div>
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
                  <p className="text-2xl md:text-3xl font-medium line-through text-muted-foreground">
                    ₹{productDetails?.price}
                  </p>
                </div>
               {/*  <div className="flex flex-col items-center">
                  <p className="text-2xl md:text-3xl font-medium text-foreground">
                    ₹{productDetails?.salePrice}
                  </p>
                </div> */}
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
            <div className="mt-2 w-full">
              <div className="w-full text-center">
                <Label className="text-lg font-semibold uppercase tracking-wide mb-4 block relative inline-block">
                  Colors
                </Label>

                <div className="flex justify-center gap-5 mx-auto">
                  {productDetails.colors.map((colorItem, index) => (
                    <div
                      key={index}
                      onClick={() => handleColorSelect(colorItem)}
                      className={`cursor-pointer flex flex-col items-center transition-all duration-300 w-20
                        ${selectedColor && selectedColor._id === colorItem._id
                          ? "transform scale-110"
                          : "hover:scale-105"}
                      `}
                    >
                      <div className={`w-full h-16 overflow-hidden ${selectedColor && selectedColor._id === colorItem._id ? "ring-2 ring-primary ring-offset-2" : ""}`}>
                        <img
                          src={colorItem.image}
                          alt={colorItem.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                      </div>
                      <p className="mt-2 text-sm font-medium text-center">
                        {colorItem.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Creative Quantity Control and Add to Cart Button */}
          <div className="mt-6 flex flex-col gap-6">
            <div className="flex justify-center">
              {productDetails?.totalStock === 0 ? (
                <div className="w-full max-w-md px-8 py-3 opacity-60 cursor-not-allowed text-muted-foreground uppercase tracking-wider text-sm font-medium flex items-center justify-center gap-2 border-b-2 border-input">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Out of Stock</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 w-full max-w-md">
                  {/* Creative Quantity Controls */}
                  {productDetails?.totalStock > 0 && (
                    <div className="flex justify-center items-center w-full">
                      <div className="relative flex items-center justify-center">
                        {/* Circular quantity display with creative styling */}
                        <div className="relative w-20 h-20 flex items-center justify-center">
                          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--muted)" strokeWidth="2" />
                            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--primary)" strokeWidth="2"
                              strokeDasharray="283"
                              strokeDashoffset={283 - (283 * (quantity / (productDetails.totalStock > 10 ? 10 : productDetails.totalStock)))}
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                          <span className="text-2xl font-medium text-foreground">{quantity}</span>
                        </div>

                        {/* Decrease button positioned to the left with more spacing */}
                        <button
                          onClick={decreaseQuantity}
                          className="absolute -left-10 w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform duration-300 focus:outline-none"
                          aria-label="Decrease quantity"
                          disabled={quantity <= 1}
                        >
                          <Minus className={`h-5 w-5 text-muted-foreground`} />
                        </button>

                        {/* Increase button positioned to the right with more spacing */}
                        <button
                          onClick={increaseQuantity}
                          className="absolute -right-10 w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform duration-300 focus:outline-none"
                          aria-label="Increase quantity"
                          disabled={quantity >= productDetails.totalStock}
                        >
                          <Plus className={`h-5 w-5 text-muted-foreground`} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Clean Add to Cart Button */}
                  <button
                    className="w-full px-8 py-3 bg-primary text-primary-foreground hover:bg-transparent hover:text-foreground border-2 border-primary transition-all duration-300 uppercase tracking-wider text-sm font-medium flex items-center justify-center gap-2 group"
                    onClick={() =>
                      handleAddToCart(productDetails?._id, productDetails?.totalStock)
                    }
                    disabled={isAddingToCart}
                  >
                    {isAddingToCart ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground group-hover:text-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

            {/* No stock information as requested */}
          </div>
        </div>




        {/* Zoom preview container */}
        {zoomData.isHovering && (
          <div
            className="hidden md:block absolute top-[3.3%] left-[52%] z-10 w-[40%] h-[920px] overflow-hidden border shadow-lg bg-white"
            style={{
              backgroundImage: `url(${zoomData.imageSrc})`,
              backgroundPosition: `${zoomData.zoomPosition.x}% ${zoomData.zoomPosition.y}%`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "300%",
            }}
          ></div>
        )}

      </div>

      {/* Reviews Section - Moved to a dedicated section with full width */}
      <div className="bg-card/5 py-12 mt-12 border-t border-b border-input">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-light uppercase tracking-wide mb-6 text-center">
            Customer Reviews
          </h2>
          <div className="w-24 h-0.5 bg-primary mx-auto mb-8"></div>

          <div className="max-w-3xl mx-auto">
            <ReviewSection
              reviews={reviews}
              averageReview={averageReview}
              rating={rating}
              reviewMsg={reviewMsg}
              handleRatingChange={handleRatingChange}
              setReviewMsg={setReviewMsg}
              handleAddReview={handleAddReview}
            />
          </div>
        </div>
      </div>




          <div className="-mx-3.5">
            {relatedProducts && relatedProducts.length > 0 && (
              <ProductSlider
                products={relatedProducts}
                handleGetProductDetails={(productId) => navigate(`/shop/details/${productId}`)}
                handleAddtoCart={handleRelatedProductsAddToCart}
                hideTitle={true}
                 title="You May Also Like"
            description="Discover more items that complement your style"
              />
            )}

      </div>
    </div>
    </>
  );
}

export default ProductDetailsPage;