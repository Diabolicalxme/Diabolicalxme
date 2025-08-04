import React, { useRef, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
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
import ProductSlider from "@/components/shopping-view/product-slider";
import CategoryPicks from "@/components/shopping-view/category-picks";
import BackgroundImage from "@/components/shopping-view/background-image";
import banner from "../../assets/banner.jpg";
import { Loader } from "../../components/ui/loader";

function ShoppingHome() {
  const navigate = useNavigate();
  const { productList, isLoading: productsLoading } = useSelector((state) => state.shopProducts);
  const { isLoading: bannersLoading } = useSelector((state) => state.shopBanners);
  const { categoriesList, isLoading: categoriesLoading } = useSelector((state) => state.shopCategories);
  const { instaFeedPosts, isLoading: instaFeedLoading } = useSelector((state) => state.shopInstaFeed);
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const { toast } = useToast();

  // State for filters and loading state
  const [filters, setFilters] = useState({});
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const timeoutRef = useRef(null);

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
    dispatch(
      addToCart({
        userId: user?.id,
        productId: productId,
        quantity: 1,
        colorId: productList.find((product) => product._id === productId)?.colors[0]?._id,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product added to cart",
        });
      }
    });
  }

  // Only show loader on initial load, not when filters change
  const isInitialLoading = !initialLoadComplete && (productsLoading || bannersLoading || categoriesLoading || instaFeedLoading);
  if (isInitialLoading) return <Loader />;

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

      {/* Full-page background image that changes with theme */}
      <BackgroundImage />

      <div className="pt-32 flex flex-col relative z-10">
        {/* Category-based Product Picks */}
        <CategoryPicks
          products={productList}
          handleGetProductDetails={handleGetProductDetails}
          handleAddtoCart={handleAddtoCart}
        />


        {/* Category Grid Layout - Revamped Design */}
        <section className="py-16 ">
          <div className="container mx-auto px-4">
       

           {/* Masonry layout desktop */}
        <section className="hidden md:block py-8 ">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">Shop by Category</h2>
              <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
              <p className="text-gray-600">Discover our curated collections designed for every style and occasion</p>
            </div>

            {/* Masonry layout container */}
            <div className="columns-1 sm:columns-2 md:columns-3 gap-4">
              {categoriesList &&
                categoriesList.map((categoryItem, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 50,
                    }}
                    className="break-inside-avoid mb-4"
                  >
                    <CategoryCard
                      categoryItem={categoryItem}
                      index={index}
                      variant="masonry"
                    />
                  </motion.div>
                ))}
            </div>

           
          </div>
        </section>
        {/* Mobile layout */}
        <section className="py-8  md:hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">Shop by Category</h2>
              <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
              <p className="text-gray-600">Discover our curated collections designed for every style and occasion</p>
            </div>

            {/* Custom layout container - mobile: first card full width, rest in 2 columns; desktop: masonry */}
            <div className="hidden sm:block columns-2 md:columns-3 gap-4">
              {categoriesList &&
                categoriesList.map((categoryItem, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 50,
                    }}
                    className="break-inside-avoid mb-4"
                  >
                    <CategoryCard
                      categoryItem={categoryItem}
                      index={index}
                      variant="masonry"
                    />
                  </motion.div>
                ))}
            </div>

            {/* Mobile layout - first card full width, rest in 2 columns, pattern repeats every 5 cards */}
            <div className="sm:hidden">
              {categoriesList && categoriesList.length > 0 &&
                Array.from({ length: Math.ceil(categoriesList.length / 5) }).map((_, groupIndex) => {
                  const startIndex = groupIndex * 5;
                  const groupItems = categoriesList.slice(startIndex, startIndex + 5);

                  return (
                    <div key={`group-${groupIndex}`} className="mb-4">
                      {/* First item in group - full width */}
                      {groupItems[0] && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: false, amount: 0.1 }}
                          transition={{
                            duration: 0.5,
                            delay: 0.1,
                            type: "spring",
                            stiffness: 50,
                          }}
                          className="mb-4"
                        >
                          <CategoryCard
                            categoryItem={groupItems[0]}
                            index={startIndex}
                            variant="masonry"
                          />
                        </motion.div>
                      )}

                      {/* Remaining items in group - 2 column grid */}
                      {groupItems.length > 1 && (
                        <div className="grid grid-cols-2 gap-4">
                          {groupItems.slice(1).map((categoryItem, idx) => (
                            <motion.div
                              key={startIndex + idx + 1}
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: false, amount: 0.1 }}
                              transition={{
                                duration: 0.5,
                                delay: (idx + 1) * 0.1,
                                type: "spring",
                                stiffness: 50,
                              }}
                            >
                              <CategoryCard
                                categoryItem={categoryItem}
                                index={startIndex + idx + 1}
                                variant="masonry"
                              />
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              }
            </div>

            <div className="text-center mt-12">
              <button
                onClick={() => navigate("/shop/collections")}
                className="inline-block px-8 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
              >
                View All Collections
              </button>
            </div>
          </div>
        </section>



            <div className="text-center mt-12">
              <button
                onClick={() => navigate("/shop/collections")}
                className="inline-block px-8 py-3 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors duration-300 uppercase tracking-wider text-sm font-medium text-foreground"
              >
                View All Collections
              </button>
            </div>
          </div>
        </section>

        {/* Featured Products Slider */}
        {productList && productList.filter(product => product?.isFeatured).length > 0 && (
          <ProductSlider
            products={productList.filter(product => product?.isFeatured)}
            handleGetProductDetails={handleGetProductDetails}
            handleAddtoCart={handleAddtoCart}
            title="Featured Collection"
            description="Discover our most popular styles and seasonal favorites"
            bgColor="backdrop-blur-sm"
          />
        )}

        {/* New Arrivals Slider */}
        {productList && productList.filter(product => product?.isNewArrival).length > 0 && (
          <ProductSlider
            products={productList.filter(product => product?.isNewArrival)}
            handleGetProductDetails={handleGetProductDetails}
            handleAddtoCart={handleAddtoCart}
            title="New Arrivals"
            description="Explore our latest additions and be the first to wear them"
            bgColor="backdrop-blur-sm"
          />
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
    </>
  );
}

export default ShoppingHome;