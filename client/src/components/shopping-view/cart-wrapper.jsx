import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import UserCartItemsContent from "./cart-items-content";
import { memo, useMemo } from "react";
import { Loader2 } from "lucide-react";

// A simplified cart wrapper component that can be used inside any container
// This is kept for backward compatibility but we now use custom-cart-drawer.jsx
const UserCartWrapper = memo(function UserCartWrapper({ cartItems, isLoading, onCheckout }) {
  const navigate = useNavigate();

  // Calculate total with proper type conversion and error handling
  const { formattedTotal } = useMemo(() => {
    const total = cartItems && cartItems.length > 0
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

    // Format the total to 2 decimal places
    return {
      totalCartAmount: total,
      formattedTotal: total.toFixed(2)
    };
  }, [cartItems]);

  // Memoize the cart items to prevent unnecessary re-renders
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

  // Handle checkout
  const handleCheckout = () => {
    navigate("/shop/checkout");
    if (onCheckout) onCheckout();
  };

  return (
    <div className="cart-wrapper bg-card text-card-foreground p-4 rounded-md border border-input">
      {/* Cart Items */}
      <div className="mt-8 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {isLoading && cartItems.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : cartItemElements.length === 0 ? (
          <div className="text-center py-8 bg-muted/10 rounded-md border border-input">
            <h3 className="text-lg font-medium mb-2">Your Cart is Empty</h3>
            <p className="text-muted-foreground mb-4">Add items to your cart to see them here</p>
            <Button
              onClick={() => navigate('/shop')}
              className="bg-primary text-primary-foreground hover:bg-transparent hover:text-foreground border border-primary transition-colors duration-300"
            >
              Browse Products
            </Button>
          </div>
        ) : cartItemElements}
      </div>

      {/* Total */}
      <div className="mt-8 space-y-4">
        <div className="flex justify-between p-3 bg-muted/20 rounded-md">
          <span className="font-bold text-foreground">Total</span>
          <span className="font-bold text-foreground text-lg">₹{formattedTotal}</span>
        </div>
      </div>

      <Button
        onClick={handleCheckout}
        className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 border border-primary"
        disabled={isLoading || cartItems.length === 0}
      >
        {isLoading ? (
          <span className="flex items-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin text-primary-foreground" />
            Processing...
          </span>
        ) : (
          "Checkout"
        )}
      </Button>
    </div>
  );
});

export default UserCartWrapper;
