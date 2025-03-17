import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ShoppingProductTile from "./product-tile";

const CategoryPicks = ({ 
  products, 
  handleGetProductDetails, 
  handleAddtoCart,
  title = "Here are your picks",
  description = "Products selected just for you based on your preferences"
}) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { categoriesList } = useSelector((state) => state.shopCategories);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [userCategory, setUserCategory] = useState(null);

  // Find user's category and filter products accordingly
  useEffect(() => {
    if (user?.category && categoriesList.length > 0 && products.length > 0) {
      // Find the category object that matches the user's category name
      const matchedCategory = categoriesList.find(
        cat => cat.name.toLowerCase() === user.category.toLowerCase()
      );
      
      setUserCategory(matchedCategory);
      
      if (matchedCategory) {
        // Filter products by the matched category ID
        const filteredProducts = products.filter(
          product => product.category === matchedCategory._id
        );
        
        // Limit to 4 products for display
        setCategoryProducts(filteredProducts.slice(0, 4));
      }
    } else {
      // If no user category or no match, show featured products as fallback
      const featuredProducts = products.filter(product => product.isFeatured);
      setCategoryProducts(featuredProducts.slice(0, 4));
    }
  }, [user?.category, categoriesList, products]);

  // If no products to display, don't render the component
  if (categoryProducts.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">
            {title}
          </h2>
          <div className="w-24 h-1 bg-foreground mx-auto mb-6"></div>
          <p className="text-muted-foreground text-lg">
            {userCategory
              ? `Selected ${userCategory.name} products just for you`
              : description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryProducts.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                type: "spring",
                stiffness: 50,
              }}
              className="flex justify-center"
            >
              <ShoppingProductTile
                handleGetProductDetails={handleGetProductDetails}
                product={product}
                handleAddtoCart={handleAddtoCart}
              />
            </motion.div>
          ))}
        </div>

        {/* View all button */}
        {userCategory && (
          <div className="text-center mt-10">
            <button
              onClick={() => navigate(`/shop/collections?category=${userCategory._id}`)}
              className="inline-block px-8 py-3 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors duration-300 uppercase tracking-wider text-sm font-medium shadow-md"
            >
              View All {userCategory.name} Products
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryPicks;