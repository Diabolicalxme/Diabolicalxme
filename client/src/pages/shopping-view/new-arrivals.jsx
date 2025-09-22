import ShoppingProductTile from "@/components/shopping-view/product-tile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { sortOptions } from "@/config";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { ArrowUpDownIcon, ShoppingBag } from "lucide-react";
import FilterDrawer from "@/components/shopping-view/filter-drawer";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader } from "@/components/ui/loader";
import { Helmet } from "react-helmet-async";
import newArrivalsBanner from "@/assets/account.jpg";
import { addToTempCart } from "@/utils/tempCartManager";

function NewArrivals() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productList, isLoading } = useSelector(
    (state) => state.shopProducts
  );
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const categorySearchParam = searchParams.get("category");

  // Initialize sort and filters from sessionStorage (when category changes)
  useEffect(() => {
    setSort("price-lowtohigh");
    const storedFilters = sessionStorage.getItem("filters");
    setFilters(storedFilters ? JSON.parse(storedFilters) : {});
  }, [categorySearchParam]);

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchAllFilteredProducts({
      filterParams: {},
      sortParams: "price-lowtohigh"
    }));
    setInitialLoadComplete(true);
  }, [dispatch]);

  // Dispatch the fetch action only when sort and filters change, but after initial load
  useEffect(() => {
    if (sort !== null && initialLoadComplete) {
      dispatch(
        fetchAllFilteredProducts({ filterParams: filters, sortParams: sort })
      );
    }
  }, [dispatch, sort, filters, initialLoadComplete]);

  function handleSort(value) {
    setSort(value);
  }

  function handleGetProductDetails(getCurrentProductId) {
    navigate(`/shop/product/${getCurrentProductId}`);
  }

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
    let currentCartItems = cartItems.items || [];

    if (currentCartItems.length) {
      const indexOfCurrentItem = currentCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = currentCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    const product = productList.find((p) => p._id === getCurrentProductId);
    if (!product) {
      toast({
        title: "Product not found",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated) {
      // Add to temp cart for non-authenticated users
      const selectedColor = product.colors && product.colors.length > 0 ? product.colors[0] : null;

      const tempCartItem = {
        productId: getCurrentProductId,
        colorId: selectedColor?._id || null,
        quantity: 1,
        productDetails: {
          title: product.title,
          price: product.price,
          salePrice: product.salePrice,
          image: product.image?.[0] || '',
          category: product.category,
          productCode: product.productCode
        }
      };

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
      const selectedColor = product.colors && product.colors.length > 0 ? product.colors[0] : null;
      const quantity = 1;

      const validation = validateAddToCart({
        productId: getCurrentProductId,
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
          productId: getCurrentProductId,
          quantity: quantity,
          colorId: selectedColor?._id || null,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchCartItems(user?.id));
          toast({
            title: `${quantity} item${quantity > 1 ? 's' : ''} added to cart!`
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

  // Filter products for new arrivals (isNewArrival === true)
  const newArrivalProducts = productList
    ? productList.filter((product) => product.isNewArrival === true)
    : [];

  // Show loader only on initial load, not when filters change
  const isInitialLoading = !initialLoadComplete && isLoading;
  if (isInitialLoading) return <Loader />;

  return (
    <>
      <Helmet>
        <title>New Arrivals | DiabolicalXme</title>
        <meta name="description" content="Discover our latest arrivals - fresh designs and bold styles just added to our collection at DiabolicalXme." />
      </Helmet>

      <div className="bg-background">
        {/* Banner */}
        <div className="relative w-full h-[250px] md:h-[350px] overflow-hidden">
          <img
            src={newArrivalsBanner}
            alt="New Arrivals"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-35 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-light uppercase tracking-wide text-white mb-4">
                New Arrivals
              </h1>
              <div className="w-24 h-1 bg-white mx-auto"></div>
            </div>
          </div>
        </div>



        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="p-6 rounded-md shadow-sm ">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-input">
              <div>
                <h2 className="text-2xl font-light uppercase tracking-wide mb-2">
                  New Arrivals
                </h2>
                <div className="w-16 h-0.5 bg-primary mb-3"></div>
                <p className="text-muted-foreground">
                  Showing {newArrivalProducts.length} products
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-muted/30 transition-colors">
                    <ArrowUpDownIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Sort by: {sortOptions.find(option => option.id === sort)?.label || 'Default'}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="mt-2 bg-card p-2 rounded-md shadow-lg border border-input">
                    <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
                      {sortOptions.map((sortItem) => (
                        <DropdownMenuRadioItem
                          className="hover:bg-muted/30 cursor-pointer px-4 py-2 rounded-md text-foreground"
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
              {newArrivalProducts && newArrivalProducts.length > 0 ? (
                newArrivalProducts.map((productItem) => (
                  <ShoppingProductTile
                    key={productItem._id}
                    handleGetProductDetails={handleGetProductDetails}
                    product={productItem}
                    handleAddtoCart={handleAddtoCart}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-muted/30">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No New Arrivals Found</h3>
                  <p className="text-muted-foreground mb-6">Check back soon for our latest products</p>
                  <button
                    onClick={() => navigate('/shop')}
                    className="px-6 py-2 border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
                  >
                    Browse All Products
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
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

export default NewArrivals;