import { useState, useCallback, useEffect, useMemo } from "react";
import { Trash, Plus, Minus } from "lucide-react";
import { useToast } from "../ui/use-toast";
import {
  removeFromTempCart,
  updateTempCartQuantity,
  changeTempCartColor
} from "@/utils/tempCartManager";
import { validateUpdateCartQuantity, validateColorChange } from "@/utils/cartValidation";
import { useSelector } from "react-redux";
import { getThemeColors } from "@/utils/theme-utils";

const TempCartItemsContent = ({ tempItem, onUpdate, productList = [] }) => {
  const { toast } = useToast();
  const { cartItems } = useSelector((state) => state.shopCart);
  const { currentTheme } = useSelector((state) => state.theme);

  // Get theme-aware colors
  const themeColors = getThemeColors(currentTheme);
  
  // Local state for UI interactions
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(tempItem?.quantity || 1);

  // Find the product details
  const product = useMemo(() => {
    return productList.find(p => p._id === tempItem?.productId);
  }, [productList, tempItem?.productId]);

  // Initialize selected color
  useEffect(() => {
    if (tempItem?.colorId && product?.colors) {
      const color = product.colors.find(c => c._id === tempItem.colorId);
      setSelectedColor(color || null);
    }
  }, [tempItem?.colorId, product?.colors]);

  // Update local quantity when tempItem changes
  useEffect(() => {
    setQuantity(tempItem?.quantity || 1);
  }, [tempItem?.quantity]);

  // Get the display image
  const selectedImage = useMemo(() => {
    if (selectedColor?.image) return selectedColor.image;
    if (tempItem?.productDetails?.image) return tempItem.productDetails.image;
    if (product?.image?.[0]) return product.image[0];
    return "default-image-url.jpg";
  }, [selectedColor, tempItem?.productDetails?.image, product?.image]);

  // Calculate price
  const displayPrice = useMemo(() => {
    const salePrice = tempItem?.productDetails?.salePrice || product?.salePrice;
    const regularPrice = tempItem?.productDetails?.price || product?.price;
    return salePrice > 0 ? salePrice : regularPrice;
  }, [tempItem?.productDetails, product]);

  // Handle quantity update
  const handleQuantityUpdate = useCallback(async (newQuantity) => {
    if (isUpdating || newQuantity < 0) return;

    setIsUpdating(true);

    try {
      // Validate the quantity update
      const validation = validateUpdateCartQuantity({
        productId: tempItem.productId,
        colorId: tempItem.colorId,
        newQuantity,
        cartItems: cartItems || [],
        tempCartItems: [], // We'll handle this in the temp cart manager
        productList: productList,
        isAuthenticated: false
      });

      if (!validation.success) {
        toast({
          title: validation.message,
          variant: "destructive",
        });
        setIsUpdating(false);
        return;
      }

      // Update temp cart
      const result = updateTempCartQuantity(
        tempItem.productId,
        tempItem.colorId,
        newQuantity,
        productList
      );

      if (result.success) {
        setQuantity(newQuantity);
        if (onUpdate) onUpdate();
        
        if (newQuantity === 0) {
          toast({ title: "Item removed from cart" });
        } else {
          toast({ title: result.message });
        }
      } else {
        toast({
          title: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Failed to update quantity",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }, [tempItem, isUpdating, cartItems, productList, onUpdate, toast]);

  // Handle item deletion
  const handleDelete = useCallback(() => {
    if (isDeleting) return;

    setIsDeleting(true);

    try {
      const result = removeFromTempCart(tempItem.productId, tempItem.colorId);
      
      if (result.success) {
        if (onUpdate) onUpdate();
        toast({ title: result.message });
      } else {
        toast({
          title: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Failed to remove item",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsDeleting(false), 300);
    }
  }, [tempItem, isDeleting, onUpdate, toast]);

  // Handle color change
  const handleColorChange = useCallback(async (newColor) => {
    if (isUpdating || !newColor || newColor._id === tempItem.colorId) return;

    setIsUpdating(true);

    try {
      // Validate color change
      const validation = validateColorChange({
        productId: tempItem.productId,
        oldColorId: tempItem.colorId,
        newColorId: newColor._id,
        quantity: tempItem.quantity,
        cartItems: cartItems || [],
        tempCartItems: [], // We'll handle this in the temp cart manager
        productList: productList,
        isAuthenticated: false
      });

      if (!validation.success) {
        toast({
          title: validation.message,
          variant: "destructive",
        });
        setIsUpdating(false);
        return;
      }

      // Change color in temp cart
      const result = changeTempCartColor(
        tempItem.productId,
        tempItem.colorId,
        newColor._id,
        productList
      );

      if (result.success) {
        setSelectedColor(newColor);
        if (onUpdate) onUpdate();
        toast({ title: result.message });
      } else {
        toast({
          title: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error changing color:", error);
      toast({
        title: "Failed to change color",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }, [tempItem, isUpdating, cartItems, productList, onUpdate, toast]);

  if (!tempItem) return null;

  return (
    <div className={`flex flex-col w-full border-b last:border-b-0 py-4 px-2 transition-colors rounded-sm ${themeColors.borderColor} ${themeColors.hoverBg}`}>
      <div className="flex items-start gap-3">
        {/* Product Image */}
        <div className="w-16 h-16 flex-shrink-0">
          <img
            src={selectedImage}
            alt={tempItem.productDetails?.title || "Product"}
            className={`w-full h-full object-cover border rounded-sm ${themeColors.borderColor}`}
            onError={(e) => {
              if (product?.image?.[0] && e.target.src !== product.image[0]) {
                e.target.src = product.image[0];
              } else {
                e.target.src = "default-image-url.jpg";
              }
            }}
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start w-full">
            <h3 className={`text-sm font-medium mb-1 line-clamp-2 pr-6 ${themeColors.cardText}`}>
              {tempItem.productDetails?.title}
            </h3>

            {/* Delete Button */}
            <button
              type="button"
              className={`p-1 hover:text-destructive transition-colors flex-shrink-0 ${themeColors.mutedText}`}
              onClick={handleDelete}
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

          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-sm font-semibold ${themeColors.cardText}`}>
              ₹{displayPrice}
            </span>
            {tempItem.productDetails?.salePrice > 0 && (
              <span className={`text-xs line-through ${themeColors.mutedText}`}>
                ₹{tempItem.productDetails.price}
              </span>
            )}
          </div>

          {/* Color Selection */}
          {product?.colors && product.colors.length > 0 && (
            <div className="mb-3">
              <span className={`text-xs mb-1 block ${themeColors.mutedText}`}>Color:</span>
              <div className="flex gap-1 flex-wrap">
                {product.colors.map((color) => (
                  <button
                    key={color._id}
                    onClick={() => handleColorChange(color)}
                    disabled={isUpdating}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      selectedColor?._id === color._id
                        ? "border-primary scale-110"
                        : "border-muted hover:border-muted-foreground"
                    } ${isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    style={{ backgroundColor: color.title.toLowerCase() }}
                    title={color.title}
                  />
                ))}
              </div>
              {selectedColor && (
                <span className={`text-xs mt-1 block ${themeColors.mutedText}`}>
                  {selectedColor.title}
                </span>
              )}
            </div>
          )}

          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <span className={`text-xs ${themeColors.mutedText}`}>Qty:</span>
            <div className={`flex items-center border rounded ${themeColors.borderColor}`}>
              <button
                onClick={() => handleQuantityUpdate(quantity - 1)}
                disabled={isUpdating || quantity <= 1}
                className="p-1 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="px-3 py-1 text-sm min-w-[2rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityUpdate(quantity + 1)}
                disabled={isUpdating}
                className="p-1 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Total Price */}
          <div className="mt-2">
            <span className="text-sm font-semibold text-foreground">
              Total: ₹{(displayPrice * quantity).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-sm">
          <span className="text-sm text-muted-foreground">Updating...</span>
        </div>
      )}
    </div>
  );
};

export default TempCartItemsContent;
