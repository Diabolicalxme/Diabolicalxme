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
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import { ArrowUpDownIcon, ChevronRight, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader } from "@/components/ui/loader";
import { Helmet } from "react-helmet-async";
import newArrivalsBanner from "@/assets/newarrivals.png";

function NewArrivals() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productList, productDetails, isLoading } = useSelector(
    (state) => state.shopProducts
  );
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const categorySearchParam = searchParams.get("category");

  // Initialize sort and filters from sessionStorage (when category changes)
  useEffect(() => {
    setSort("price-lowtohigh");
    const storedFilters = sessionStorage.getItem("filters");
    setFilters(storedFilters ? JSON.parse(storedFilters) : {});
  }, [categorySearchParam]);

  // Dispatch the fetch action only when sort and filters are available.
  useEffect(() => {
    if (sort !== null) {
      dispatch(
        fetchAllFilteredProducts({ filterParams: filters, sortParams: sort })
      );
    }
  }, [dispatch, sort, filters]);

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

    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
        colorId: productList.find(
          (product) => product._id === getCurrentProductId
        )?.colors[0]?._id,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({ title: "Product is added to cart" });
      }
    });
  }

  // Filter products for new arrivals (isNewArrival === true)
  const newArrivalProducts = productList
    ? productList.filter((product) => product.isNewArrival === true)
    : [];

  // Show loader only when the product list is not yet available
  if (isLoading && productList.length === 0) return <Loader />;

  return (
    <>
      <Helmet>
        <title>New Arrivals | DiabolicalXMe</title>
        <meta name="description" content="Discover our latest arrivals - fresh designs and styles just added to our collection at Rachana Boutique." />
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
          <div className="bg-card">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b">
              <div>
                <h2 className="text-2xl font-light uppercase tracking-wide mb-2">
                  New Arrivals
                </h2>
                <p className="text-muted-foreground">
                  Showing {newArrivalProducts.length} products
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NewArrivals;