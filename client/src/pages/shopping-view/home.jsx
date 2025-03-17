import React, { useRef, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import classNames from "classnames";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import "@/styles/masonry.css";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import { fetchCategories } from "@/store/shop/categories-slice";
import { fetchBanners } from "@/store/shop/banners-slice";
import { fetchInstaFeed } from "@/store/shop/instafeed-slice";
import CategoryCard from "@/components/shopping-view/categoryCard";
import Carousel from "@/components/shopping-view/carousel";
import FastMovingCard from "@/components/shopping-view/fast-moving-card";
import InstagramFeed from "@/components/shopping-view/instagramFeed";
import Testimonials from "@/components/shopping-view/testimonials-new";
import Banner from "@/components/shopping-view/banner";
import ProductSlider from "@/components/shopping-view/product-slider";
import CategoryPicks from "@/components/shopping-view/category-picks";
import BackgroundImage from "@/components/shopping-view/background-image";
import banner from "../../assets/banner.jpg";
import { Loader } from "../../components/ui/loader";

function ShoppingHome() {
  const [activeItem, setActiveItem] = useState(0);
  let screenWidth = window.innerWidth;
  const navigate = useNavigate();
  const { productList, isLoading: productsLoading } = useSelector((state) => state.shopProducts);
  const { bannersList, isLoading: bannersLoading } = useSelector((state) => state.shopBanners);
  const { categoriesList, isLoading: categoriesLoading } = useSelector((state) => state.shopCategories);
  const { instaFeedPosts, isLoading: instaFeedLoading } = useSelector((state) => state.shopInstaFeed);
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const { toast } = useToast();

  const wrapperRef = useRef(null);
  const timeoutRef = useRef(null);

  const { ref, inView } = useInView({
    rootMargin: screenWidth <= 768 ? "3100px" : "0px",
    threshold: 0.2,
  });


  useEffect(() => {
    if (!wrapperRef.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    wrapperRef.current.style.setProperty(
      "--transition",
      "600ms cubic-bezier(0.22, 0.61, 0.36, 1)"
    );

    timeoutRef.current = setTimeout(() => {
      wrapperRef.current?.style.removeProperty("--transition");
    }, 900);

    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, [activeItem]);

  // Fetch all required data once
  useEffect(() => {
    dispatch(fetchAllFilteredProducts({ filterParams: {}, sortParams: "price-lowtohigh" }));
    dispatch(fetchBanners());
    dispatch(fetchCategories());
    dispatch(fetchInstaFeed());
  }, [dispatch]);

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

  const isAnyLoading = productsLoading || bannersLoading || categoriesLoading || instaFeedLoading;
  if (isAnyLoading) return <Loader />;
console.log(categoriesList  )
  return (
    <>
      <Helmet>
        <title>Best Sarees Online - Buy Now | Rachana Boutique</title>
        <meta name="description" content="Discover the finest sarees with exclusive designs. Shop now for the best collections at Rachana Boutique!" />
        <meta name="keywords" content="sarees, buy sarees online, silk sarees, wedding sarees, designer sarees, traditional sarees" />
        <meta name="author" content="Mohan Raj A" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Best Sarees Online - Buy Now | Rachana Boutique" />
        <meta property="og:description" content="Explore a wide range of premium sarees at Rachana Boutique. Perfect for every occasion!" />
        <meta property="og:image" content="https://example.com/path-to-your-saree-image.jpg" />
        <meta property="og:url" content="https://rachana-boutique.com" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Best Sarees Online - Buy Now | Rachana Boutique" />
        <meta name="twitter:description" content="Shop the best sarees online with exclusive offers at Rachana Boutique!" />
        <meta name="twitter:image" content="https://example.com/path-to-your-saree-image.jpg" />
      </Helmet>

      {/* Full-page background image that changes with theme */}
      <BackgroundImage />

      <div className="flex flex-col min-h-screen relative z-10">
        {/* Category-based Product Picks */}
        <CategoryPicks
          products={productList}
          handleGetProductDetails={handleGetProductDetails}
          handleAddtoCart={handleAddtoCart}
        />

        <section className="pt-8 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12 backdrop-blur-sm p-6 rounded-lg">
              <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4 text-foreground">Shop by Category</h2>
              <div className="w-24 h-1 bg-foreground mx-auto mb-6"></div>
              <p className="text-foreground">Discover our curated collections designed for every style and occasion</p>
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

            <div className="text-center mt-12">
              <button
                onClick={() => navigate("/shop/collections")}
                className="inline-block px-8 py-3 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors duration-300 uppercase tracking-wider text-sm font-medium backdrop-blur-sm"
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
      </div>
    </>
  );
}

export default ShoppingHome;