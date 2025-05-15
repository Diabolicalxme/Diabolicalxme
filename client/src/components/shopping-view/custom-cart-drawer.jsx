import { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserCartItemsContent from "./cart-items-content";
import { memo } from "react";
import { useSelector } from "react-redux";
// Button is used inline instead of the imported component

// Custom overlay component
const CartOverlay = memo(({ isOpen, onClose }) => {
  // Close the cart when clicking on the overlay
  return (
    <div
      className={`fixed inset-0 z-50 bg-black/80 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    />
  );
});

// Custom cart drawer component
const CustomCartDrawer = memo(function CustomCartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  isLoading
}) {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const drawerRef = useRef(null);
  const prevCartLength = useRef(cartItems.length);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Track if this is the initial load or a subsequent update
  const isInitialLoad = useRef(true);

  // Reset initial load flag when drawer opens
  useEffect(() => {
    if (isOpen) {
      // If drawer is opening, mark as initial load
      isInitialLoad.current = true;
    }
  }, [isOpen]);

  // Track cart updates with debounce to prevent flickering
  // Only show loading state if it persists for more than a short delay
  useEffect(() => {
    let timer;

    // Check if cart length has changed to determine if this is an update or initial load
    const cartLengthChanged = prevCartLength.current !== cartItems.length;
    prevCartLength.current = cartItems.length;

    // If cart length changed, this is definitely not an initial load
    if (cartLengthChanged) {
      isInitialLoad.current = false;
    }

    // If we have cart items, we're ready for checkout regardless of loading state

    if (isLoading) {
      // Only show loading indicator for updates, not initial loads
      // or if the loading persists for a while
      timer = setTimeout(() => {
        // Only show updating message for non-initial loads or if loading takes too long
        // But don't show it if we're just opening the cart with items already in it
        if ((!isInitialLoad.current && cartLengthChanged) || cartItems.length === 0) {
          setIsUpdating(true);
        }
      }, 400); // Only show loading if it takes longer than 400ms
    } else {
      // When loading completes, mark as not initial load and hide updating message
      isInitialLoad.current = false;

      // When loading completes, remove the indicator after a short delay
      timer = setTimeout(() => {
        setIsUpdating(false);
      }, 200);
    }

    return () => clearTimeout(timer);
  }, [isLoading, cartItems.length]);

  // Calculate total with proper type conversion and error handling
  // Use useMemo to prevent recalculation on every render
  const { formattedTotal } = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return { totalCartAmount: 0, formattedTotal: "0.00" };

    const total = cartItems.reduce((sum, currentItem) => {
      // Get the price (sale price if available, otherwise regular price)
      const itemPrice = currentItem?.salePrice > 0
        ? parseFloat(currentItem.salePrice)
        : parseFloat(currentItem?.price || 0);

      // Get the quantity with fallback to 0
      const itemQuantity = parseInt(currentItem?.quantity || 0, 10);

      // Calculate item total and add to sum
      return sum + (itemPrice * itemQuantity);
    }, 0);

    return {
      totalCartAmount: total,
      formattedTotal: total.toFixed(2)
    };
  }, [cartItems]);

  // Memoize the checkout handler to prevent unnecessary re-renders
  const handleCheckout = useMemo(() => {
    return () => {
      // If we have items in the cart, proceed to checkout
      if (cartItems.length > 0) {
        navigate("/shop/checkout");
        onClose();
      }
    };
  }, [navigate, onClose, cartItems.length]);

  // Memoize cart items to prevent unnecessary re-renders
  const cartItemElements = useMemo(() => {
    if (!cartItems || cartItems.length === 0) {
      return <p className="text-center">Your cart is empty</p>;
    }

    return cartItems.map((item) => (
      <UserCartItemsContent
        key={`${item.productId}-${item.colors?._id || 'default'}`}
        cartItem={item}
      />
    ));
  }, [cartItems]);

  // Close on escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Create portal for the drawer
  return createPortal(
    <>
      <CartOverlay isOpen={isOpen} onClose={onClose} />
      <div
        ref={drawerRef}
        className={`fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-card text-card-foreground p-4 shadow-lg transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="relative flex flex-col space-y-2 text-center sm:text-left">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">Your Cart</h2>
            <button
              onClick={onClose}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          {/* Only show updating message when items are being modified, not on initial load */}
          {isUpdating && !isInitialLoad.current && cartItems.length > 0 && (
            <div className="flex items-center justify-center w-full mt-2 mb-1">
              <div className="h-[1px] bg-foreground/10 w-full relative overflow-hidden">
                <div className="h-full bg-foreground absolute animate-loading-bar"></div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap px-2">Updating cart</span>
              <div className="h-[1px] bg-foreground/10 w-full relative overflow-hidden">
                <div className="h-full bg-foreground absolute animate-loading-bar"></div>
              </div>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="mt-6 space-y-4 min-h-[200px]">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                <LogIn className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Sign In to View Your Cart</h3>
              <p className="text-muted-foreground mb-6">Please sign in to view and manage your cart items.</p>
              <button
                onClick={() => {
                  onClose();
                  navigate('/auth/login');
                }}
                className="px-6 py-3 border-2 border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-foreground transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
              >
                Sign In
              </button>
            </div>
          ) : isLoading && cartItems.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-8">
              <div className="mb-4 h-10 w-10 border-2 border-t-foreground border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-muted-foreground">Loading your cart...</p>
            </div>
          ) : (
            /* Otherwise show cart items - they'll update automatically when data changes */
            cartItemElements
          )}
        </div>

        {/* Total */}
        <div className="mt-8 space-y-3">
          <div className="flex justify-between text-foreground">
            <span>Subtotal</span>
            <span>₹{formattedTotal}</span>
          </div>
          <div className="flex justify-between text-foreground">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between font-medium text-lg pt-3 border-t border-input">
            <span className="text-foreground">Total</span>
            <span className="text-foreground">₹{formattedTotal}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={!isAuthenticated || cartItems.length === 0}
          className="w-full mt-6 px-6 py-3 border-2 border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-foreground transition-colors duration-300 uppercase tracking-wider text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Only show loading state in the button when we're actually processing a checkout */}
          {isUpdating && cartItems.length > 0 ? (
            <span className="flex items-center justify-center">
              <div className="mr-2 h-4 w-4 border-2 border-t-primary-foreground border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              Checkout
            </span>
          ) : (
            "Checkout"
          )}
        </button>
      </div>
    </>,
    document.body
  );
});

export default CustomCartDrawer;