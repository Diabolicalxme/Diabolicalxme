import Address from "@/components/shopping-view/address";
import img from "../../assets/jamandi.png";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import TempCartItemsContent from "@/components/shopping-view/temp-cart-items-content";
import { useState, useEffect, useCallback } from "react";
import { createNewOrder, capturePayment } from "@/store/shop/order-slice";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Loader } from "../../components/ui/loader";
import { Helmet } from "react-helmet-async";
import { MapPin, CreditCard, LogIn } from "lucide-react";
import { getTempCartItems, getTempCartTotal, clearTempCart } from "@/utils/tempCartManager";
import { addToCart } from "@/store/shop/cart-slice";
import { ShoppingCart as ShoppingBag } from "lucide-react";
import { getStateNameByCode } from "@/utils/locationUtils";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { getThemeColors } from "@/utils/theme-utils";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);
  const { addressList } = useSelector((state) => state.shopAddress);
  const { productList } = useSelector((state) => state.shopProducts);
  const { currentTheme } = useSelector((state) => state.theme);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymentStart] = useState(false);
  const [razorpayInstance, setRazorpayInstance] = useState(null);
  const [showCloseWarning, setShowCloseWarning] = useState(false);
  const { isPaymentLoading } = useSelector((state) => state.shopOrder);
  const [tempCartItems, setTempCartItems] = useState([]);

  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get theme-aware colors
  const themeColors = getThemeColors(currentTheme);

  // Calculate total with proper type conversion and error handling
  const totalCartAmount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce((sum, currentItem) => {
        // Get the price (sale price if available, otherwise regular price)
        const itemPrice = currentItem?.salePrice > 0
          ? parseFloat(currentItem.salePrice)
          : parseFloat(currentItem?.price || 0);

        // Get the quantity with fallback to 0
        const itemQuantity = parseInt(currentItem?.quantity || 0, 10);

        // Calculate item total and add to sum
        const itemTotal = itemPrice * itemQuantity;




        return sum + itemTotal;
      }, 0)
      : 0;

  // Format the total to 2 decimal places for display
  const formattedTotal = totalCartAmount.toFixed(2);

  // Load temporary cart items and fetch latest product data on component mount
  useEffect(() => {
    const tempItems = getTempCartItems();
    setTempCartItems(tempItems);

    // Fetch latest product data to ensure accurate stock information
    dispatch(fetchAllFilteredProducts({ filterParams: {}, sortParams: "price-lowtohigh" }));
  }, [dispatch]);

  // Auto-select address if user has only one address
  useEffect(() => {
    if (isAuthenticated && addressList && addressList.length === 1 && !currentSelectedAddress) {
      setCurrentSelectedAddress(addressList[0]);
    }
  }, [isAuthenticated, addressList, currentSelectedAddress]);

  // Note: Removed fetchAllFilteredProducts call to prevent infinite loops
  // Product data should already be available from the page that navigated to checkout

  // Calculate temporary cart total
  const tempCartTotal = getTempCartTotal();

  // Function to validate inventory before placing order
  const validateInventory = () => {
    const errors = [];

  

    // Debug: Log cart items structure to understand data format
    console.log('🔍 Validating inventory for cart items:', cartItems);
    if (cartItems.length > 0) {
      console.log('🔍 First cart item structure:', cartItems[0]);
    }

    if (isAuthenticated && cartItems.length > 0) {
      // Validate actual cart items
      cartItems.forEach((item, index) => {
        // Enhanced debugging for title issue
        console.log(`🔍 Cart item ${index}:`, {
          title: item.title,
          productId: item.productId,
          hasColors: !!item.colors,
          colorTitle: item.colors?.title,
          quantity: item.quantity,
          productColors: item.productColors,
          totalStock: item.totalStock,
          fullItem: item
        });

        // Get product title with multiple fallbacks, including from productList
        const productFromList = productList.find(p => p._id === item.productId);
        const productTitle = item.title ||
                           item.productTitle ||
                           item.name ||
                           productFromList?.title ||
                           `Product ${item.productId || 'Unknown'}`;

        if (item.colors && item.colors._id) {
          // For items with colors, check against color inventory
          const availableInventory = item.productColors
            ? item.productColors.find(color => color._id === item.colors._id)?.inventory || 0
            : item.colors.inventory || 0;

          console.log(`🔍 Color inventory check:`, {
            productTitle,
            colorTitle: item.colors.title,
            requestedQuantity: item.quantity,
            availableInventory
          });

          if (item.quantity > availableInventory) {
            const colorTitle = item.colors.title || 'Selected Color';
            if (availableInventory === 0) {
              errors.push(`Sorry, "${productTitle}" in ${colorTitle} is currently out of stock.`);
            } else {
              errors.push(`Sorry, only ${availableInventory} item${availableInventory === 1 ? '' : 's'} of "${productTitle}" in ${colorTitle} ${availableInventory === 1 ? 'is' : 'are'} available. Please reduce the quantity.`);
            }
          }
        } else {
          // For items without colors OR items with colors but no color selected
          // Check if this product actually has colors in the product list
          const productFromList = productList.find(p => p._id === item.productId);

          // Also check if the cart item has productColors data (more reliable)
          const hasColorsInCartItem = item.productColors && item.productColors.length > 0;
          const hasColorsInProductList = productFromList?.colors && productFromList.colors.length > 0;

          console.log(`🔍 Color data analysis:`, {
            productTitle,
            hasColorsInCartItem,
            hasColorsInProductList,
            cartItemProductColors: item.productColors?.length || 0,
            productListColors: productFromList?.colors?.length || 0,
            cartItemHasColors: !!item.colors,
            cartItemColorId: item.colors?._id,
            // Additional debugging
            productColorsData: item.productColors,
            productListColorsData: productFromList?.colors,
            totalStock: item.totalStock
          });

          if (hasColorsInCartItem) {
            // Use cart item's productColors data (most reliable)
            const totalAvailableStock = item.productColors.reduce((sum, color) => sum + (color.inventory || 0), 0);

            console.log(`🔍 Using cart item productColors:`, {
              productTitle,
              requestedQuantity: item.quantity,
              totalAvailableStock,
              colorsCount: item.productColors.length,
              colorInventories: item.productColors.map(c => ({ title: c.title, inventory: c.inventory }))
            });

            if (item.quantity > totalAvailableStock) {
              if (totalAvailableStock === 0) {
                errors.push(`Sorry, "${productTitle}" is currently out of stock.`);
              } else {
                errors.push(`Sorry, only ${totalAvailableStock} item${totalAvailableStock === 1 ? '' : 's'} of "${productTitle}" ${totalAvailableStock === 1 ? 'is' : 'are'} available. Please reduce the quantity.`);
              }
            }
          } else if (hasColorsInProductList) {
            // Fallback to product list colors
            const totalAvailableStock = productFromList.colors.reduce((sum, color) => sum + (color.inventory || 0), 0);

            console.log(`🔍 Using product list colors:`, {
              productTitle,
              requestedQuantity: item.quantity,
              totalAvailableStock,
              colorsCount: productFromList.colors.length,
              colorInventories: productFromList.colors.map(c => ({ title: c.title, inventory: c.inventory }))
            });

            if (item.quantity > totalAvailableStock) {
              if (totalAvailableStock === 0) {
                errors.push(`Sorry, "${productTitle}" is currently out of stock.`);
              } else {
                errors.push(`Sorry, only ${totalAvailableStock} item${totalAvailableStock === 1 ? '' : 's'} of "${productTitle}" ${totalAvailableStock === 1 ? 'is' : 'are'} available. Please reduce the quantity.`);
              }
            }
          } else {
            // Product truly has no colors, check total stock
            // Use current product list data instead of potentially stale cart item data
            const totalStock = productFromList?.totalStock || item.totalStock || 0;

            console.log(`🔍 Product without colors - total stock check:`, {
              productTitle,
              requestedQuantity: item.quantity,
              totalStock,
              cartItemTotalStock: item.totalStock,
              productListTotalStock: productFromList?.totalStock,
              usingSource: productFromList?.totalStock !== undefined ? 'productList' : 'cartItem'
            });

            if (item.quantity > totalStock) {
              if (totalStock === 0) {
                errors.push(`Sorry, "${productTitle}" is currently out of stock.`);
              } else {
                errors.push(`Sorry, only ${totalStock} item${totalStock === 1 ? '' : 's'} of "${productTitle}" ${totalStock === 1 ? 'is' : 'are'} available. Please reduce the quantity.`);
              }
            }
          }
        }
      });
    } else if (!isAuthenticated && tempCartItems.length > 0) {
      // Validate temp cart items against productList
      tempCartItems.forEach((tempItem, index) => {
        const product = productList.find(p => p._id === tempItem.productId);

        // Enhanced debugging for temp cart items
        console.log(`🔍 Temp cart item ${index}:`, {
          productId: tempItem.productId,
          productDetailsTitle: tempItem.productDetails?.title,
          productTitle: product?.title,
          colorId: tempItem.colorId,
          quantity: tempItem.quantity
        });

        const productTitle = tempItem.productDetails?.title ||
                           product?.title ||
                           `Product ${tempItem.productId || 'Unknown'}`;

        if (product && tempItem.colorId) {
          const color = product.colors?.find(c => c._id === tempItem.colorId);
          if (color && tempItem.quantity > color.inventory) {
            const colorTitle = color.title || 'Selected Color';
            if (color.inventory === 0) {
              errors.push(`Sorry, "${productTitle}" in ${colorTitle} is currently out of stock.`);
            } else {
              errors.push(`Sorry, only ${color.inventory} item${color.inventory === 1 ? '' : 's'} of "${productTitle}" in ${colorTitle} ${color.inventory === 1 ? 'is' : 'are'} available. Please reduce the quantity.`);
            }
          }
        } else if (product && !tempItem.colorId) {
          // For temp cart items without colors
          const totalStock = product.colors && product.colors.length > 0
            ? product.colors.reduce((sum, color) => sum + (color.inventory || 0), 0)
            : product.totalStock || 0;

          if (tempItem.quantity > totalStock) {
            if (totalStock === 0) {
              errors.push(`Sorry, "${productTitle}" is currently out of stock.`);
            } else {
              errors.push(`Sorry, only ${totalStock} item${totalStock === 1 ? '' : 's'} of "${productTitle}" ${totalStock === 1 ? 'is' : 'are'} available. Please reduce the quantity.`);
            }
          }
        }
      });
    }

    // Log final errors for debugging
    if (errors.length > 0) {
      console.log('🚨 Inventory validation errors:', errors);
    }

    return errors;
  };



  // Function to reset payment state
  const resetPaymentState = () => {
    setIsPaymentStart(false);
    setRazorpayInstance(null);
  };

  // Handle browser close warning during payment
  const handleBeforeUnload = useCallback((event) => {
    console.log('beforeunload event triggered, isPaymentStart:', isPaymentStart);
    if (isPaymentStart) {
      // Show custom warning modal first
      setShowCloseWarning(true);

      // Show browser's native confirmation dialog
      const message = "⚠️ PAYMENT IN PROGRESS! Closing this window may result in payment failure or loss of transaction. Are you sure you want to leave?";

      event.preventDefault();
      event.returnValue = message;
      return message;
    }
  }, [isPaymentStart]);

  // Handle keyboard shortcuts that might close the tab
  const handleKeyDown = useCallback((event) => {
    if (isPaymentStart) {
      // Detect common close tab shortcuts
      const isCloseShortcut =
        (event.ctrlKey && event.key === 'w') || // Ctrl+W
        (event.ctrlKey && event.key === 'F4') || // Ctrl+F4
        (event.altKey && event.key === 'F4') || // Alt+F4
        (event.ctrlKey && event.shiftKey && event.key === 'W'); // Ctrl+Shift+W

      if (isCloseShortcut) {
        event.preventDefault();

        // Show custom alert
        const userWantsToClose = window.confirm(
          "⚠️ PAYMENT IN PROGRESS!\n\n" +
          "Your payment is currently being processed. Closing this window now may:\n" +
          "• Result in payment failure\n" +
          "• Loss of transaction\n" +
          "• Require you to start over\n\n" +
          "Are you sure you want to close this tab?"
        );

        if (userWantsToClose) {
          // User confirmed, allow the close by removing protection temporarily
          setIsPaymentStart(false);
          setTimeout(() => {
            window.close();
          }, 100);
        }
      }
    }
  }, [isPaymentStart]);

  // Handle page visibility change (when user switches tabs or minimizes)
  const handleVisibilityChange = useCallback(() => {
    if (isPaymentStart && document.hidden) {
      // User switched away from tab during payment
      console.warn("User switched away from payment tab");
    }
  }, [isPaymentStart]);

  function handleInitiateRazorpayPayment() {
    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed.",
        variant: "destructive",
      });
      return;
    }

    if (currentSelectedAddress === null) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    // Validate inventory before proceeding
    const inventoryErrors = validateInventory();
    if (inventoryErrors.length > 0) {
      toast({
        title: "Unable to Complete Order",
        description: inventoryErrors[0], // Show first error with user-friendly message
        variant: "destructive",
      });
      return;
    }

    setIsPaymentStart(true);

    const orderData = {
      userId: user?.id,
      email: user?.email,
      cartId: cartItems?._id,
      cartItems: cartItems.map((item) => ({
        productId: item?.productId,
        title: item?.title,
        image: item?.image[0],
        price: item?.salePrice > 0 ? item?.salePrice : item?.price,
        quantity: item?.quantity,
        productCode: item?.productCode || null,
        colors: item?.colors ? {
          _id: item.colors._id,
          title: item.colors.title,
          image: item.colors.image
        } : null,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        name: currentSelectedAddress?.name || "",
        address: currentSelectedAddress?.address,
        state: currentSelectedAddress?.state || "",
        city: currentSelectedAddress?.city || "",
        pincode: currentSelectedAddress?.pincode || "",
        phone: currentSelectedAddress?.phone || "",
        notes: currentSelectedAddress?.notes || "",
      },
      totalAmount: totalCartAmount,
      orderStatus: "pending",
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      if (data?.payload?.success) {
        const { razorpayOrderId, amount, currency } = data.payload;

        // Check if Razorpay is available in the global scope
        if (typeof window.Razorpay === "undefined") {
          toast({
            title: "Razorpay SDK is not loaded. Please refresh the page.",
            variant: "destructive",
          });
          setIsPaymentStart(false);
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount,
          currency,
          name: "Rachana Boutique",
          description: "Order Payment",
          order_id: razorpayOrderId,
          handler: function (response) {
            dispatch(
              capturePayment({
                paymentId: response.razorpay_payment_id,
                orderId: data.payload.orderId,
              })
            ).then((captureResponse) => {
              if (captureResponse?.payload?.success) {
                // Clear payment warning before navigation
                window.removeEventListener('beforeunload', handleBeforeUnload);
                setIsPaymentStart(false);

                // Set payment success flags for protected route access
                sessionStorage.setItem('paymentSuccess', 'true');
                sessionStorage.setItem('recentPaymentTimestamp', Date.now().toString());

                toast({
                  title: "Payment successful! Redirecting to the success page...",
                  variant: "success",
                  className: "bg-green-50 text-green-800 border-green-200 font-medium",
                });
                navigate("/shop/payment-success");
              } else {
                toast({
                  title: "Payment was successful, but order confirmation failed. Please contact support.",
                  variant: "destructive",
                });
                resetPaymentState();
              }
            });
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone,
          },
          theme: {
            color: "#000000",
          },
        };

        try {
          // Create and store the Razorpay instance
          const razorpay = new window.Razorpay(options);
          setRazorpayInstance(razorpay);

          // Open the payment modal
          razorpay.open();

          // Handle payment failure
          razorpay.on("payment.failed", function (response) {
            toast({
              title: "Payment failed. Please try again.",
              description: response.error.description,
              variant: "destructive",
            });
            resetPaymentState();
          });

          // Handle modal close event
          razorpay.on("modal.close", function () {
            // Reset payment state when modal is closed without completing payment
            resetPaymentState();
            toast({
              title: "Payment process was cancelled.",
              variant: "warning",
            });
          });

          // Set a safety timeout to reset the state if other handlers fail
          setTimeout(() => {
            // Check if payment is still in progress after 5 minutes
            if (isPaymentStart) {
              resetPaymentState();
              toast({
                title: "Payment process timed out.",
                description: "Please try again.",
                variant: "warning",
              });
            }
          }, 5 * 60 * 1000); // 5 minutes timeout
        } catch (error) {
          console.error("Razorpay error:", error);
          resetPaymentState();
          toast({
            title: "Payment initialization failed.",
            description: "Please try again later.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Order creation failed. Please try again.",
          variant: "destructive",
        });
        setIsPaymentStart(false);
      }
    });
  }

  // Effect to manage payment state and browser close warning
  useEffect(() => {
    console.log('Payment state changed, isPaymentStart:', isPaymentStart);
    // Add event listeners when payment starts
    if (isPaymentStart) {
      console.log('Adding beforeunload and keyboard event listeners');
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('keydown', handleKeyDown);

      // Also set a global flag to prevent navigation
      window.onbeforeunload = handleBeforeUnload;
    } else {
      console.log('Removing beforeunload and keyboard event listeners');
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
      window.onbeforeunload = null;
    }

    // Cleanup function
    return () => {
      console.log('Cleanup: removing all event listeners');
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
      window.onbeforeunload = null;
    };
  }, [isPaymentStart, handleBeforeUnload, handleVisibilityChange, handleKeyDown]);

  // Cleanup effect to reset payment state when component unmounts
  useEffect(() => {
    return () => {
      if (razorpayInstance) {
        // Try to close the Razorpay modal if it's open
        try {
          razorpayInstance.close();
        } catch (error) {
          console.error("Error closing Razorpay instance:", error);
        }
      }
      resetPaymentState();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [razorpayInstance, handleBeforeUnload, handleKeyDown]);

  if (isPaymentLoading) return <Loader />;

  if (approvalURL) {
    window.location.href = approvalURL;
  }

  return (
    <>
      <Helmet>
        <title>Checkout | Rachana Boutique</title>
        <meta name="description" content="Complete your purchase at Rachana Boutique. Secure checkout process for your selected items." />
      </Helmet>

      <div className={themeColors.pageBg}>
        {/* Banner */}
        <div className="relative w-full h-[250px] md:h-[300px] overflow-hidden">
          <img
            src={img}
            alt="Checkout"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-light uppercase tracking-wide text-white mb-4">
                Checkout
              </h1>
              <div className="w-24 h-1 bg-white mx-auto"></div>
            </div>
          </div>
        </div>



        {/* Checkout Content */}
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-6xl mx-auto">
            {/* Checkout Steps */}
            <div className="mb-12">
              <div className="flex justify-between items-center max-w-md mx-auto">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${themeColors.primaryBg} ${themeColors.primaryText}`}>
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <span className={`text-xs uppercase tracking-wide ${themeColors.cardText}`}>Cart</span>
                </div>
                <div className={`flex-1 h-0.5 mx-2 ${themeColors.dividerBg}`}></div>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${themeColors.primaryBg} ${themeColors.primaryText}`}>
                    <MapPin className="h-5 w-5" />
                  </div>
                  <span className={`text-xs uppercase tracking-wide ${themeColors.cardText}`}>Address</span>
                </div>
                <div className={`flex-1 h-0.5 mx-2 ${themeColors.dividerBg}`}></div>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${themeColors.hoverBg} ${themeColors.mutedText}`}>
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <span className={`text-xs uppercase tracking-wide ${themeColors.cardText}`}>Payment</span>
                </div>
              </div>
            </div>

            {/* Sign In Section for Non-Authenticated Users */}
            {!isAuthenticated && tempCartItems.length > 0 && (
              <div className={`mb-8 border p-6 md:p-8 rounded-md shadow-sm `}>
                <div className="text-center">
                  <LogIn className={`h-12 w-12 mx-auto mb-4 `} />
                  <h2 className={`text-2xl font-light uppercase tracking-wide mb-4 `}>
                    Sign In to Continue
                  </h2>
                  <div className={`w-16 h-0.5 mx-auto mb-6`}></div>
                  <p className={`mb-6 `}>
                    You have {tempCartItems.length} item{tempCartItems.length > 1 ? 's' : ''} in your cart.
                    Please sign in to complete your purchase.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => navigate('/auth/login?redirect=checkout')}
                      className={`px-8 py-3 transition-colors duration-300 uppercase tracking-wider text-sm font-medium `}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => navigate('/auth/register?redirect=checkout')}
                      className={`px-8 py-3 border-2 transition-colors duration-300 uppercase tracking-wider text-sm font-medium `}
                    >
                      Create Account
                    </button>
                  </div>
                  <div className={`mt-6 p-4 border`}>
                    <h3 className={`font-medium mb-4`}>Your Cart Items:</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {tempCartItems.map((item, index) => (
                        <TempCartItemsContent
                          key={`checkout-temp-${item.productId}-${item.colorId || 'default'}-${index}`}
                          tempItem={item}
                          onUpdate={() => {
                            // Refresh temp cart items
                            const updatedItems = getTempCartItems();
                            setTempCartItems(updatedItems);
                          }}
                        />
                      ))}
                    </div>
                    <div className={`border-t pt-4 mt-4 `}>
                      <div className={`flex justify-between text-lg font-medium`}>
                        <span>Total:</span>
                        <span>₹{tempCartTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}



            {/* Main Content - Only show if authenticated */}
            {isAuthenticated && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side: Address Selection */}
                <div className={`border p-6 md:p-8 rounded-md shadow-sm `}>
                  <h2 className={`text-2xl font-light uppercase tracking-wide mb-4 `}>Shipping Address</h2>
                  <div className={`w-16 h-0.5 mb-6 `}></div>
                  <Address
                    setCurrentSelectedAddress={setCurrentSelectedAddress}
                    selectedId={currentSelectedAddress}
                  />

              </div>

              {/* Right Side: Order Summary */}
              <div className={`border p-6 md:p-8 rounded-md shadow-sm `}>
                <h2 className={`text-2xl font-light uppercase tracking-wide mb-4 `}>Order Summary</h2>
                <div className={`w-16 h-0.5 mb-6 `}></div>

                {/* Cart Items */}
                <div className="space-y-4 mb-8">
                  {cartItems && cartItems.length > 0 ? (
                    cartItems.map((item, index) => (
                      <UserCartItemsContent key={index} cartItem={item} />
                    ))
                  ) : (
                    <div className={`text-center py-8 ${themeColors.mutedText}`}>
                      Your cart is empty
                    </div>
                  )}
                </div>

                {/* Order Totals */}
                <div className={`border-t pt-4 space-y-3 `}>
                  <div className={`flex justify-between `}>
                    <span>Subtotal</span>
                    <span>₹{formattedTotal}</span>
                  </div>
                  <div className={`flex justify-between `}>
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className={`flex justify-between font-medium text-lg pt-3 border-t`}>
                    <span>Total</span>
                    <span>₹{formattedTotal}</span>
                  </div>
                </div>

                {/* Payment Warning */}
                {isPaymentStart && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Payment in Progress
                        </h3>
                        <div className="mt-1 text-sm text-yellow-700">
                          <p>Please do not close this window or navigate away. Doing so may result in payment failure or loss of transaction.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Checkout Button */}
                <div className="mt-8">
                  <button
                    onClick={handleInitiateRazorpayPayment}
                    disabled={isPaymentStart || cartItems.length === 0}
                    className={`w-full px-8 py-4 border-2 transition-colors duration-300 uppercase tracking-wider text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${themeColors.buttonPrimary}`}
                  >
                    {isPaymentStart ? "Processing Payment..." : "Proceed to Payment"}
                  </button>

                  <p className={`text-xs text-center mt-4 ${themeColors.mutedText}`}>
                    By proceeding, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Close Warning Modal */}
      {showCloseWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className={`rounded-lg p-8 max-w-md mx-4 shadow-2xl ${themeColors.cardBg}`}>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833-.23 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className={`text-lg font-medium mb-4 ${themeColors.cardText}`}>
                ⚠️ Payment in Progress!
              </h3>
              <div className={`text-sm mb-6 text-left ${themeColors.mutedText}`}>
                <p className="mb-3">Your payment is currently being processed. Closing this window now may:</p>
                <ul className="list-disc list-inside space-y-1 mb-4">
                  <li>Result in payment failure</li>
                  <li>Loss of transaction</li>
                  <li>Require you to start over</li>
                </ul>
                <p className="font-medium text-red-600">Are you sure you want to close this tab?</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowCloseWarning(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                >
                  Stay on Page
                </button>
                <button
                  onClick={() => {
                    setShowCloseWarning(false);
                    setIsPaymentStart(false);
                    setTimeout(() => {
                      window.close();
                    }, 100);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Close Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ShoppingCheckout;
