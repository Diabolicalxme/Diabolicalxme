import React, { useRef, useEffect, useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Menu } from "lucide-react";
import { useScroll, useTransform, useSpring } from "framer-motion";
import FilterDrawer from "@/components/shopping-view/filter-drawer";
import "@/styles/masonry.css";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import { fetchCategories } from "@/store/shop/categories-slice";
import { fetchBanners } from "@/store/shop/banners-slice";
import { fetchInstaFeed } from "@/store/shop/instafeed-slice";
import CategoryCard from "@/components/shopping-view/categoryCard";
import InstagramFeed from "@/components/shopping-view/instagramFeed";
import Testimonials from "@/components/shopping-view/testimonials-new";
import Banner from "@/components/shopping-view/banner";
import { addToTempCart, getTempCartItems } from "@/utils/tempCartManager";
import { validateAddToCart } from "@/utils/cartValidation";
import ProductSlider from "@/components/shopping-view/product-slider";
import SingleProductBanners from "@/components/shopping-view/single-product-banners";
import CategoryPicks from "@/components/shopping-view/category-picks";
import BackgroundModel from "@/components/shopping-view/BackgroundModel";
import banner from "../../assets/banner.jpg";
import { Loader } from "../../components/ui/loader";

function ShoppingHome() {
  const navigate = useNavigate();
  const { productList, isLoading: productsLoading } = useSelector((state) => state.shopProducts);
  const { isLoading: bannersLoading } = useSelector((state) => state.shopBanners);
  const { categoriesList, isLoading: categoriesLoading } = useSelector((state) => state.shopCategories);
  const { instaFeedPosts, isLoading: instaFeedLoading } = useSelector((state) => state.shopInstaFeed);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);

  const dispatch = useDispatch();
  const { toast } = useToast();

  // Track background model loading state
  const [isBackgroundModelLoaded, setIsBackgroundModelLoaded] = useState(false);

  // State for filters and loading state
  const [filters, setFilters] = useState({});
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [use3DBackground, setUse3DBackground] = useState(true);

  // Track scroll for New Arrivals visibility (same as model transition)
  const [scrollY, setScrollY] = useState(0);

  // Scroll tracking for model transition
  const { scrollYProgress } = useScroll();
  const smoothScrollYProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Track scroll position for New Arrivals visibility
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // If 3D background is disabled, consider model as loaded
  useEffect(() => {
    if (!use3DBackground) {
      setIsBackgroundModelLoaded(true);
    }
  }, [use3DBackground]);

  // Fallback timeout and initial scroll reset
  useEffect(() => {
    // Ensure we start at the top so the model is centered
    window.scrollTo(0, 0);

    const timeout = setTimeout(() => {
      if (!isBackgroundModelLoaded) {
        console.warn('3D model loading timeout, proceeding without model');
        setIsBackgroundModelLoaded(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isBackgroundModelLoaded]);

  const timeoutRef = useRef(null);

  // Determine 3D model based on user category (reactive like themes)
  const getModelName = useMemo(() => {
    if (!user?.category) return 'Arthur'; // Default fallback

    switch (user.category) {
      case 'Author':
        return 'Arthur';
      case 'Bravo':
        return 'Bravo';
      case 'Hector':
        return 'Hector';
      default:
        return 'Arthur'; // Default fallback
    }
  }, [user?.category]); // React to user category changes

  // Filter out theme categories and ensure we have the categories shown in the image
  const filteredCategoryList = categoriesList.filter(category =>
    !['author', 'bravo', 'hector'].includes(category.name.trim().toLowerCase())
  );

  // Create a sorted list to ensure the categories appear in the right order for the grid layout
  const sortedCategories = [...filteredCategoryList].sort((a, b) => {
    // Define the preferred order
    const preferredOrder = ['jeans', 't-shirts', 'combo sets', 'shirts', 'sneakers'];

    const aIndex = preferredOrder.findIndex(name =>
      a.name.toLowerCase().includes(name.toLowerCase()));
    const bIndex = preferredOrder.findIndex(name =>
      b.name.toLowerCase().includes(name.toLowerCase()));

    // If both categories are in the preferred order, sort by that order
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    // If only one is in the preferred order, prioritize it
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    // Otherwise, sort alphabetically
    return a.name.localeCompare(b.name);
  });

  // Clean up any timeouts when component unmounts
  useEffect(() => {
    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  // Fetch all required data once
  useEffect(() => {
    // Fetch all initial data
    dispatch(fetchAllFilteredProducts({ filterParams: {}, sortParams: "price-lowtohigh" }));
    dispatch(fetchBanners());
    dispatch(fetchCategories());
    dispatch(fetchInstaFeed());

    // Mark initial load as complete after data is fetched
    setInitialLoadComplete(true);
  }, [dispatch]);

  // Apply filters when they change, but only after initial load

  useEffect(() => {
    // Skip the first render to avoid double fetching
    if (initialLoadComplete) {
      dispatch(fetchAllFilteredProducts({
        filterParams: Object.keys(filters).length > 0 ? filters : {},
        sortParams: "price-lowtohigh"
      }));
    }
  }, [dispatch, filters, initialLoadComplete]);

  function handleGetProductDetails(productId) {
    dispatch(fetchProductDetails(productId));
  }

  function handleAddtoCart(productId) {
    const product = productList.find((p) => p._id === productId);
    if (!product) {
      toast({
        title: "Product not found",
        variant: "destructive",
      });
      return;
    }

    // Select first available color or null for products without colors
    const selectedColor = product.colors && product.colors.length > 0 ? product.colors[0] : null;
    const quantity = 1;

    if (!isAuthenticated) {
      // NON-AUTHENTICATED: Add to temp cart (localStorage)
      const tempCartItem = {
        productId: productId,
        colorId: selectedColor?._id || null,
        quantity: quantity,
        productDetails: {
          title: product.title,
          price: product.price,
          salePrice: product.salePrice,
          image: product.image?.[0] || '',
          category: product.category,
          productCode: product.productCode
        }
      };

      // Add with inventory validation
      const result = addToTempCart(tempCartItem, [product], cartItems || []);

      if (result.success) {
        toast({
          title: result.message,
        });
      } else {
        toast({
          title: result.message,
          variant: "destructive",
        });
      }
    } else {
      // AUTHENTICATED: Validate then add to actual cart
      const validation = validateAddToCart({
        productId: productId,
        colorId: selectedColor?._id,
        quantityToAdd: quantity,
        cartItems: cartItems || [],
        tempCartItems: [], // No temp cart for authenticated users
        productList: [product],
        isAuthenticated: true
      });

      if (!validation.success) {
        toast({
          title: validation.message,
          variant: "destructive",
        });
        return;
      }

      // Add to database cart
      dispatch(
        addToCart({
          userId: user?.id,
          productId: productId,
          quantity: quantity,
          colorId: selectedColor?._id || null,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchCartItems(user?.id));
          toast({
            title: `${quantity} item${quantity > 1 ? 's' : ''} added to cart!`,
          });
        } else {
          toast({
            title: data?.payload?.message || "Failed to add item to cart",
            variant: "destructive",
          });
        }
      });
    }
  }

  // Only show loader on initial load, not when filters change
  const isInitialLoading = !initialLoadComplete && (productsLoading || bannersLoading || categoriesLoading || instaFeedLoading);

  // Show loader until both data and background model are loaded
  const showLoader = isInitialLoading || (use3DBackground && !isBackgroundModelLoaded);

  return (
    <>
      <Helmet>
        <title>Bold Contemporary Fashion | DiabolicalXme</title>
        <meta name="description" content="Discover bold, avant-garde clothing with exclusive designs. Shop now for the best collections at DiabolicalXme!" />
        <meta name="keywords" content="fashion, clothing brand, contemporary fashion, designer wear, streetwear" />
        <meta name="author" content="DiabolicalXme" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Bold Contemporary Fashion | DiabolicalXme" />
        <meta property="og:description" content="Explore a wide range of bold contemporary fashion at DiabolicalXme. Perfect for every occasion!" />
        <meta property="og:image" content="https://example.com/path-to-your-image.jpg" />
        <meta property="og:url" content="https://diabolicalxme.com" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bold Contemporary Fashion | DiabolicalXme" />
        <meta name="twitter:description" content="Shop the best contemporary fashion with exclusive offers at DiabolicalXme!" />
        <meta name="twitter:image" content="https://example.com/path-to-your-image.jpg" />
      </Helmet>

      {/* Full-page 3D background model based on user category */}
      {/* Full-page 3D background model based on user category */}
      {/* Only show model if authenticated. It handles its own scroll logic internally */}
      {isAuthenticated && use3DBackground && (
        <BackgroundModel
          modelName={getModelName}
          onError={() => setUse3DBackground(false)}
          onModelLoaded={() => setIsBackgroundModelLoaded(true)}
        />
      )}

      {/* Show loader until everything is ready */}
      {showLoader && <Loader />}

      {/* Main content - only show when not loading */}
      {!showLoader && (
        <div className="pt-[110vh] flex flex-col relative z-10 w-full animate-in fade-in duration-700">

          {/* New Arrivals as overlay from model's hands - Now moves with scroll and fades out */}
          {isAuthenticated && (
            <div className="absolute top-[35vh] left-0 w-full z-[5] pointer-events-none transition-opacity duration-300"
              style={{
                opacity: Math.max(0, 1 - scrollY / 400)
              }}>
              <div className="pointer-events-auto">
                <ProductSlider
                  products={productList.filter(p => p.isNewArrival)}
                  handleGetProductDetails={handleGetProductDetails}
                  handleAddtoCart={handleAddtoCart}
                  title=""
                  description=""
                />
              </div>
            </div>
          )}

          {/* View All Collection Button - Appears immediately after model hero */}
          <div className="text-center py-12">
            <button
              onClick={() => navigate("/shop/collections")}
              className="inline-block px-12 py-4 border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-all duration-500 uppercase tracking-[0.3em] text-sm font-bold rounded-full backdrop-blur-md bg-background/5 shadow-2xl hover:scale-105 active:scale-95"
            >
              View All Collection
            </button>
          </div>

          {/* Featured Products - Now appearing right after Collections button */}
          {productList && productList.filter(product => product?.isFeatured).length > 0 && (
            <div className="mb-16">
              <SingleProductBanners
                products={productList.filter(product => product?.isFeatured)}
              />
            </div>
          )}

          <section>
            <Banner
              imageUrl={banner}
              altText="Banner 3"
              description="Exciting Offers & Discounts. Don't miss out! Shop now and save big. Best deals on your favorite products."
            />
          </section>

          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center mb-12 backdrop-blur-sm p-6 rounded-lg">
                <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4 text-foreground">Follow Our Style</h2>
                <div className="w-24 h-1 bg-foreground mx-auto mb-6"></div>
                <p className="text-foreground">Get inspired by our Instagram feed and share your looks with #OurFashionStyle</p>
              </div>
              <InstagramFeed posts={instaFeedPosts} />

              <div className="text-center mt-10">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm uppercase tracking-wider font-medium hover:underline backdrop-blur-sm px-4 py-2 rounded text-foreground"
                >
                  Follow us on Instagram
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center mb-12 backdrop-blur-sm p-6 rounded-lg">
                <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4 text-foreground">Customer Stories</h2>
                <div className="w-24 h-1 bg-foreground mx-auto mb-6"></div>
                <p className="text-foreground">Hear what our customers have to say about their experience</p>
              </div>
              <Testimonials />
            </div>
          </section>

          {/* Add extra space to ensure footer visibility */}
          <div className="h-16"></div>

          {/* Filter Drawer */}
          <FilterDrawer
            filters={filters}
            setFilters={setFilters}
            handleFilter={(filterKey, filterValue) => {
              // Ensure filters is an object
              const safeFilters = filters || {};
              const updatedFilters = { ...safeFilters };

              // Add or remove filter value
              if (!updatedFilters[filterKey]) {
                updatedFilters[filterKey] = [filterValue];
              } else {
                const index = updatedFilters[filterKey].indexOf(filterValue);
                if (index === -1) {
                  updatedFilters[filterKey].push(filterValue);
                } else {
                  updatedFilters[filterKey].splice(index, 1);
                }
              }

              // Remove filter if empty after removal
              if (updatedFilters[filterKey]?.length === 0) {
                delete updatedFilters[filterKey];
              }

              setFilters(updatedFilters);
            }}
          />
        </div>
      )}

    </>
  );
}

export default ShoppingHome;