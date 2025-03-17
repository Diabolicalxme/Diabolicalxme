import { Minus, Plus, Trash, ChevronDown, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { useState, useRef, useEffect, memo, useMemo, useCallback } from "react";

// Helper function to compute initial selection based on cartItem and available colors
const getInitialSelection = (cartItem, availableColors) => {
  // Make sure cartItem has images
  if (!cartItem?.image || !Array.isArray(cartItem.image) || cartItem.image.length === 0) {
    return { defaultColor: null, defaultImage: "default-image-url.jpg" };
  }

  if (availableColors && availableColors.length > 0) {
    // First try to find the exact color that was selected for this cart item
    const matchingColor = availableColors.find(
      (color) => color._id === cartItem.colors?._id
    );
    const defaultColor = matchingColor || availableColors[0];

    // Use the color's image directly if available
    if (defaultColor?.image) {
      return { defaultColor, defaultImage: defaultColor.image };
    }
  }

  // If no colors available, just use the first image
  return { defaultColor: null, defaultImage: cartItem.image[0] };
};

// Create a custom equality function for memo to prevent unnecessary re-renders
const areEqual = (prevProps, nextProps) => {
  // Only re-render if the cart item's essential properties have changed
  return (
    prevProps.cartItem._id === nextProps.cartItem._id &&
    prevProps.cartItem.quantity === nextProps.cartItem.quantity &&
    prevProps.cartItem.colors?._id === nextProps.cartItem.colors?._id
  );
};

const UserCartItemsContent = function UserCartItemsContent({ cartItem }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { productList } = useSelector((state) => state.shopProducts);
  // Use a more specific selector to prevent unnecessary re-renders
  const cartItems = useSelector((state) => state.shopCart.cartItems);
  const dropdownRef = useRef(null);

  // Find the product in productList to get available colors - memoize this calculation
  const { currentProduct, availableColors } = useMemo(() => {
    const product = productList.find(p => p._id === cartItem.productId);
    return {
      currentProduct: product,
      availableColors: product?.colors || []
    };
  }, [productList, cartItem.productId]);

  // Initialize state by computing defaults using our helper function - memoize this calculation
  const { defaultColor, defaultImage } = useMemo(() =>
    getInitialSelection(cartItem, availableColors),
    [cartItem, availableColors]
  );

  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(defaultImage);

  // Ensure images are properly loaded when the component mounts or cartItem changes
  // Use a ref to track if this is the first render to prevent unnecessary state updates
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (!isFirstRender.current && cartItem && availableColors.length > 0) {
      const { defaultColor, defaultImage } = getInitialSelection(cartItem, availableColors);

      // Only update if we have valid data and it's different from current state
      if (defaultColor && defaultColor._id !== selectedColor?._id) {
        setSelectedColor(defaultColor);
      }

      if (defaultImage && defaultImage !== selectedImage) {
        setSelectedImage(defaultImage);
      }
    }
    isFirstRender.current = false;
  }, [cartItem, availableColors]);

  // Add loading states
  const [isColorUpdating, setIsColorUpdating] = useState(false);
  const [isQuantityUpdating, setIsQuantityUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    // Only add the event listener if the dropdown is open
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Handle color change from dropdown selection - memoize with useCallback
  const handleColorChange = useCallback((color) => {
    // Close dropdown first to prevent UI issues
    setDropdownOpen(false);

    // Don't proceed if the selected color is the same as current
    if (selectedColor?._id === color._id) {
      return;
    }

    // Check if there's already an item with this color in the cart
    const existingItemWithSameColor = cartItems.find(
      item => item.productId === cartItem.productId &&
              item.colors &&
              item.colors._id === color._id &&
              // Make sure it's not the current item
              (cartItem.colors?._id !== color._id)
    );

    // If there's an existing item with the same color, show a message about merging
    if (existingItemWithSameColor) {
      toast({
        title: "Merging items",
        description: "Items with the same color will be combined",
      });
    }

    // Immediately update the selected color for better UX
    setSelectedColor(color);
    setIsColorUpdating(true);

    // Optimistically update the UI immediately for better user experience
    if (color?.image) {
      setSelectedImage(color.image);
    } else {
      setSelectedImage(cartItem?.image?.[0] || "default-image-url.jpg");
    }

    // Create the payload for the API call
    const updatePayload = {
      userId: user?.id,
      productId: cartItem?.productId,
      colorId: color._id,
      oldColorId: cartItem.colors?._id // Pass the current color ID to help with merging
    };

    // Only add quantity if we're not merging with an existing item
    if (!existingItemWithSameColor) {
      updatePayload.quantity = cartItem?.quantity;
    }

    // Pass the payload to the updateCartQuantity action
    dispatch(updateCartQuantity(updatePayload))
      .then((data) => {
        if (data?.payload?.success) {
          // Refresh cart items to ensure we have the latest data
          dispatch(fetchCartItems(user?.id));

          // Show appropriate message based on whether items were merged
          if (existingItemWithSameColor) {
            toast({
              title: "Items merged successfully",
              description: "Quantities have been combined"
            });
          } else {
            toast({ title: "Color updated successfully" });
          }
        } else {
          toast({
            title: "Failed to update color",
            description: data?.payload?.message || "Please try again",
            variant: "destructive",
          });
        }
        // Small delay before removing loading state to prevent UI flicker
        setTimeout(() => {
          setIsColorUpdating(false);
        }, 300);
      })
      .catch((error) => {
        console.error("Error updating color:", error);
        toast({
          title: "Failed to update color",
          variant: "destructive",
        });
        setTimeout(() => {
          setIsColorUpdating(false);
        }, 300);
      });
  }, [cartItem, cartItems, selectedColor, user, dispatch, toast]);

  const handleQuantityChange = useCallback((newQuantity) => {
    // Don't update if the quantity is the same
    if (newQuantity === cartItem?.quantity) {
      return;
    }

    setIsQuantityUpdating(true);

    // Optimistically update UI to show the new quantity
    // This is handled by Redux state updates

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: cartItem?.productId,
        quantity: newQuantity,
        colorId: selectedColor?._id,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        // Refresh cart items to ensure we have the latest data
        dispatch(fetchCartItems(user?.id));
        toast({ title: "Cart updated successfully" });
      }
      // Small delay before removing loading state to prevent UI flicker
      setTimeout(() => {
        setIsQuantityUpdating(false);
      }, 300);
    }).catch((error) => {
      console.error("Error updating quantity:", error);
      toast({
        title: "Failed to update quantity",
        variant: "destructive",
      });
      setTimeout(() => {
        setIsQuantityUpdating(false);
      }, 300);
    });
  }, [cartItem, selectedColor, user, dispatch, toast]);

  const handleCartItemDelete = useCallback(() => {
    // Set deleting state for UI feedback
    setIsDeleting(true);

    dispatch(deleteCartItem({
      userId: user?.id,
      productId: cartItem?.productId,
      colorId: selectedColor?._id || cartItem?.colors?._id
    })).then((data) => {
      if (data?.payload?.success) {
        // Refresh cart items to ensure we have the latest data
        dispatch(fetchCartItems(user?.id));
        toast({ title: "Cart item deleted successfully" });
      }
      // Small delay before removing loading state to prevent UI flicker
      setTimeout(() => {
        setIsDeleting(false);
      }, 300);
    }).catch((error) => {
      console.error("Error deleting cart item:", error);
      toast({
        title: "Failed to delete item",
        variant: "destructive",
      });
      setTimeout(() => {
        setIsDeleting(false);
      }, 300);
    });
  }, [cartItem, selectedColor, user, dispatch, toast]);

  // Format currency with proper parsing
  const formatCurrency = (amount) => {
    // Ensure amount is a valid number
    const numericAmount = parseFloat(amount) || 0;

    // Format with Indian locale and 2 decimal places
    return `₹${numericAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <div className="flex flex-col w-full border-b border-gray-200 last:border-b-0 py-4 px-2">
      <div className="flex items-start gap-3">
        {/* Product Image */}
        <div className="w-16 h-16 flex-shrink-0">
          <img
            src={selectedColor?.image || selectedImage || cartItem?.image?.[0] || "default-image-url.jpg"}
            alt={cartItem?.title || "Product"}
            className="w-full h-full object-cover border border-gray-200"
            onError={(e) => {
              // If image fails to load, try the first image from cartItem
              if (cartItem?.image?.[0] && e.target.src !== cartItem.image[0]) {
                e.target.src = cartItem.image[0];
              } else {
                // If that also fails, use a default image
                e.target.src = "default-image-url.jpg";
              }
            }}
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start w-full">
            <h3 className="text-sm font-medium mb-1 line-clamp-2 pr-6">{cartItem?.title}</h3>

            {/* Delete Button - Top Right */}
            <button
              type="button"
              className="p-1 text-gray-400 hover:text-black transition-colors flex-shrink-0"
              onClick={handleCartItemDelete}
              disabled={isDeleting}
              aria-label="Remove item"
            >
              {isDeleting ? (
                <span className="w-3.5 h-3.5 block animate-pulse">...</span>
              ) : (
                <Trash className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Price - Show single item price and total */}
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-600">
              {formatCurrency(cartItem?.salePrice > 0 ? parseFloat(cartItem.salePrice) : parseFloat(cartItem?.price || 0))}
              {cartItem?.quantity > 1 && <span> × {cartItem?.quantity}</span>}
            </p>
            <p className="text-sm font-medium">
              {formatCurrency((cartItem?.salePrice > 0 ? parseFloat(cartItem.salePrice) : parseFloat(cartItem?.price || 0)) *
                parseInt(cartItem?.quantity || 0, 10))}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
            {/* Color Selection - Only show if product has colors */}
            {availableColors.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isColorUpdating) {
                      setDropdownOpen(!dropdownOpen);
                    }
                  }}
                  className="flex items-center justify-between w-28 px-2 py-1 border border-gray-300 rounded-sm hover:border-black transition-colors"
                  disabled={isColorUpdating}
                >
                  {isColorUpdating ? (
                    <div className="flex items-center justify-center w-full">
                      <span className="text-xs text-gray-500 animate-pulse">Updating...</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5">
                        {selectedColor?.image ? (
                          <div className="relative w-4 h-4 overflow-hidden rounded-sm border border-gray-300">
                            <img
                              src={selectedColor.image}
                              alt={selectedColor.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className="w-4 h-4 rounded-sm border border-gray-300"
                            style={{ backgroundColor: selectedColor?.colorCode || '#ccc' }}
                          ></div>
                        )}
                        <span className="text-xs uppercase tracking-wide truncate">{selectedColor?.title || "Color"}</span>
                      </div>
                      <ChevronDown className="w-3 h-3 flex-shrink-0" />
                    </>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 w-40 mt-1 bg-white border border-gray-200 rounded-sm shadow-lg z-50">
                    <div className="py-1">
                      <div className="px-2 pb-1 mb-1 border-b border-gray-100">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Select Color</span>
                      </div>

                      <div className="max-h-40 overflow-y-auto">
                        {availableColors.map((color) => (
                          <button
                            key={color._id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleColorChange(color);
                            }}
                            className="w-full text-left flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <div className="relative flex items-center">
                              {color.image ? (
                                <div className="relative w-6 h-6 overflow-hidden rounded-sm border border-gray-200">
                                  <img
                                    src={color.image}
                                    alt={color.title}
                                    className="w-full h-full object-cover"
                                  />
                                  {selectedColor?._id === color._id && (
                                    <div className="absolute inset-0 border-2 border-black"></div>
                                  )}
                                </div>
                              ) : (
                                <div
                                  className={`w-6 h-6 rounded-sm ${selectedColor?._id === color._id ? 'border-2 border-black' : 'border border-gray-300'}`}
                                  style={{ backgroundColor: color?.colorCode || '#ccc' }}
                                ></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs uppercase tracking-wide block truncate">{color.title}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity Controls */}
            <div className="flex items-center gap-1">
              {isQuantityUpdating ? (
                <div className="flex items-center justify-center w-20">
                  <span className="text-xs text-gray-500 animate-pulse">Updating...</span>
                </div>
              ) : (
                <>
                  <button
                    className="w-6 h-6 flex items-center justify-center border border-gray-300 hover:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={cartItem?.quantity === 1}
                    onClick={() => handleQuantityChange(cartItem?.quantity - 1)}
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="w-6 text-center text-xs">{cartItem?.quantity}</span>
                  <button
                    className="w-6 h-6 flex items-center justify-center border border-gray-300 hover:border-black transition-colors"
                    onClick={() => handleQuantityChange(cartItem?.quantity + 1)}
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export with custom equality function to prevent unnecessary re-renders
export default memo(UserCartItemsContent, areEqual);