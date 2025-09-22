import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import FilterDrawer from "@/components/shopping-view/filter-drawer";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowUpDownIcon, ShoppingBag } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { sortOptions } from "@/config";
import { Helmet } from "react-helmet-async";
import { fetchCategories } from "@/store/shop/categories-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import banner from '@/assets/account.jpg';
import { addToTempCart } from "@/utils/tempCartManager";

function ShoppingListing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productList, isLoading } = useSelector((state) => state.shopProducts);
  const { categoriesList } = useSelector((state) => state.shopCategories);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { toast } = useToast();
  const categorySearchParam = searchParams.get("category");
  const [currentCategory, setCurrentCategory] = useState(null);

  // Find current category details
  useEffect(() => {
    if (categorySearchParam && categoriesList.length > 0) {
      const category = categoriesList.find(cat => cat._id === categorySearchParam);
      setCurrentCategory(category);
    } else {
      setCurrentCategory(null);
    }
  }, [categorySearchParam, categoriesList]);

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchAllFilteredProducts({
      filterParams: categorySearchParam ? { category: categorySearchParam } : null,
      sortParams: "price-lowtohigh"
    }));
    setInitialLoadComplete(true);
  }, [dispatch, categorySearchParam]);

  const filteredProducts = useMemo(() => {
    let updatedProducts = [...productList];

    // Apply category filter from URL parameters
    if (categorySearchParam) {
      updatedProducts = updatedProducts.filter(
        (product) => product.category === categorySearchParam
      );
    }

    // Apply additional filters from the filters state
    if (Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([key, values]) => {
        if (key === "price") {
          // Handle price filter, including "6000 and above"
          updatedProducts = updatedProducts.filter((product) =>
            values.some((range) => {
              const [minStr, maxStr] = range.split("-");
              const min = Number(minStr);
              const max = maxStr ? Number(maxStr) : Infinity;
              return product.salePrice >= min && product.salePrice <= max;
            })
          );
        } else {
          // Handle other filters
          updatedProducts = updatedProducts.filter((product) =>
            values.some((value) => product[key] === value)
          );
        }
      });
    }

    // Apply sorting
    if (sort === "price-lowtohigh") {
      updatedProducts.sort((a, b) => a.salePrice - b.salePrice);
    } else if (sort === "price-hightolow") {
      updatedProducts.sort((a, b) => b.salePrice - a.salePrice);
    }

    return updatedProducts;
  }, [productList, filters, sort, categorySearchParam]);

  const handleFilter = (filterKey, filterValue) => {
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
  };

  function handleSort(value) {
    setSort(value);
  }

  function handleGetProductDetails(getCurrentProductId) {
    navigate(`/shop/product/${getCurrentProductId}`);
  }

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
    const product = productList.find((p) => p._id === getCurrentProductId);
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
        productId: getCurrentProductId,
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
      // AUTHENTICATED: Enhanced validation then add to actual cart
      const getCartItems = cartItems || [];

      // Find existing item in cart
      const existingItemIndex = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId && item.colors?._id === selectedColor?._id
      );

      const currentQuantity = existingItemIndex > -1 ? getCartItems[existingItemIndex].quantity : 0;
      const totalQuantityAfterAdd = currentQuantity + quantity;

      // Validate inventory
      let availableInventory = 0;
      let inventorySource = '';

      if (selectedColor) {
        availableInventory = selectedColor.inventory || 0;
        inventorySource = `color "${selectedColor.title}"`;
      } else {
        availableInventory = getTotalStock || product.totalStock || 0;
        inventorySource = 'product';
      }

      if (availableInventory === 0) {
        toast({
          title: selectedColor ? 'Selected color is out of stock' : 'This product is out of stock',
          variant: "destructive",
        });
        return;
      }

      if (totalQuantityAfterAdd > availableInventory) {
        const remainingStock = Math.max(0, availableInventory - currentQuantity);

        if (remainingStock === 0) {
          toast({
            title: `You already have the maximum available quantity for this ${inventorySource}`,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: `Only ${remainingStock} more item${remainingStock > 1 ? 's' : ''} can be added for this ${inventorySource}`,
          variant: "destructive",
        });
        return;
      }

      // Add to database cart
      dispatch(
        addToCart({
          userId: user?.id,
          productId: getCurrentProductId,
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

  // Optimize fetching by using a single useEffect for filter/sort changes
  // Only run after initial load is complete
  useEffect(() => {
    if (initialLoadComplete) {
      const filterParams = {};
      if (categorySearchParam) {
        filterParams.category = categorySearchParam;
      }
      if (Object.keys(filters).length > 0) {
        Object.entries(filters).forEach(([key, values]) => {
          filterParams[key] = values;
        });
      }
      dispatch(
        fetchAllFilteredProducts({
          filterParams: Object.keys(filterParams).length > 0 ? filterParams : null,
          sortParams: sort || "price-lowtohigh",
        })
      );
    }
  }, [dispatch, categorySearchParam, filters, sort, initialLoadComplete]);

  // Show loader only on initial load, not when filters change
  const isInitialLoading = !initialLoadComplete && isLoading;
  if (isInitialLoading) return <Loader />;

  return (
    <>
      <Helmet>
        <title>{currentCategory ? `${currentCategory?.name} Collection` : 'All Products'} | DiabolicalXme</title>
        <meta name="description" content={`Explore our ${currentCategory ? currentCategory?.name : 'exclusive'} collection of bold contemporary fashion at DiabolicalXme.`} />
      </Helmet>

      <div className="bg-background">
        {/* Category Banner */}
        <div className="relative w-full h-[250px] md:h-[350px] overflow-hidden">
          <img
            src={currentCategory?.image || banner}
            alt={currentCategory?.title || "All Products"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-35 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-light uppercase tracking-wide text-white mb-4">
                {currentCategory?.name || "All Products"}
              </h1>
              <div className="w-24 h-1 bg-white mx-auto"></div>
            </div>
          </div>
        </div>



        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Product Listing */}
          <div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-light uppercase tracking-wide mb-2">
                    {currentCategory?.title || "All Products"}
                  </h2>
                  <div className="w-16 h-0.5 bg-primary mb-3"></div>
                  <p className="text-muted-foreground">
                    Showing {filteredProducts.length} products
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted/30 transition-colors">
                      <ArrowUpDownIcon className="h-4 w-4" />
                      <span>Sort by: {sortOptions.find(option => option.id === sort)?.label || 'Default'}</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="mt-2 bg-card p-2 rounded-md shadow-lg border border-border">
                      <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
                        {sortOptions.map((sortItem) => (
                          <DropdownMenuRadioItem
                            className="hover:bg-muted/30 cursor-pointer px-4 py-2 rounded-md"
                            value={sortItem.id}
                            key={sortItem.id}
                          >
                            {sortItem.label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Products Grid - Using Original ShoppingProductTile */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((productItem) => (
                  <ShoppingProductTile
                    key={productItem._id}
                    handleGetProductDetails={handleGetProductDetails}
                    product={productItem}
                    handleAddtoCart={handleAddtoCart}
                  />
                ))}
              </div>

              {/* Empty State */}
              {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-muted/30">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Products Found</h3>
                  <p className="text-muted-foreground mb-6">Try adjusting your filters or browse our other collections</p>
                  <button
                    onClick={() => {
                      setFilters({});
                      setSort(null);
                    }}
                    className="px-6 py-2 border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
          </div>
        </div>
        {/* Filter Drawer */}
        <FilterDrawer
          filters={filters}
          setFilters={setFilters}
          handleFilter={handleFilter}
        />
      </div>
    </>
  );
}

export default ShoppingListing;