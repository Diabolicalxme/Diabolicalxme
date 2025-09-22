/**
 * Validate adding item to cart (works for both temp cart and actual cart)
 * @param {Object} params - Validation parameters
 * @param {string} params.productId - Product ID
 * @param {string} params.colorId - Color ID (optional)
 * @param {number} params.quantityToAdd - Quantity to add
 * @param {Array} params.cartItems - Current cart items (actual cart)
 * @param {Array} params.tempCartItems - Current temp cart items
 * @param {Array} params.productList - List of products for validation
 * @param {boolean} params.isAuthenticated - Whether user is authenticated
 * @returns {Object} Validation result with success status and message
 */
export const validateAddToCart = ({ 
  productId, 
  colorId, 
  quantityToAdd, 
  cartItems = [], 
  tempCartItems = [], 
  productList = [],
  isAuthenticated = false 
}) => {
  try {
    // Basic validation
    if (!productId || !quantityToAdd || quantityToAdd <= 0) {
      return { success: false, message: 'Invalid item data' };
    }

    // Find the product
    const product = productList.find(p => p._id === productId);
    if (!product) {
      return { success: false, message: 'Product not found' };
    }

    // Calculate current quantities in both carts
    let currentActualQuantity = 0;
    let currentTempQuantity = 0;

    // Check actual cart
    const existingActualItem = cartItems.find(
      item => item.productId === productId && item.colors?._id === colorId
    );
    if (existingActualItem) {
      currentActualQuantity = existingActualItem.quantity;
    }

    // Check temp cart
    const existingTempItem = tempCartItems.find(
      item => item.productId === productId && item.colorId === colorId
    );
    if (existingTempItem) {
      currentTempQuantity = existingTempItem.quantity;
    }

    // Calculate total quantity after adding
    const totalCurrentQuantity = currentActualQuantity + currentTempQuantity;
    const totalQuantityAfterAdd = totalCurrentQuantity + quantityToAdd;

    // Determine available inventory
    let availableInventory = 0;
    let inventorySource = '';

    if (colorId && product.colors && product.colors.length > 0) {
      // Product has colors - validate against specific color inventory
      const selectedColor = product.colors.find(c => c._id === colorId);
      if (!selectedColor) {
        return { success: false, message: 'Selected color not found' };
      }
      availableInventory = selectedColor.inventory || 0;
      inventorySource = `color "${selectedColor.title}"`;
    } else {
      // Product without colors - validate against total stock
      availableInventory = product.totalStock || 0;
      inventorySource = 'product';
    }

    // Check inventory availability
    if (availableInventory === 0) {
      return { 
        success: false, 
        message: colorId ? 'Selected color is out of stock' : 'This product is out of stock' 
      };
    }

    if (totalQuantityAfterAdd > availableInventory) {
      const remainingStock = Math.max(0, availableInventory - totalCurrentQuantity);
      
      if (remainingStock === 0) {
        return { 
          success: false, 
          message: `You already have the maximum available quantity for this ${inventorySource}` 
        };
      }
      
      return { 
        success: false, 
        message: `Only ${remainingStock} more item${remainingStock > 1 ? 's' : ''} can be added for this ${inventorySource}` 
      };
    }

    return { 
      success: true, 
      message: 'Item can be added to cart',
      availableInventory,
      totalQuantityAfterAdd
    };

  } catch (error) {
    console.error('Error validating add to cart:', error);
    return { success: false, message: 'Validation failed' };
  }
};

/**
 * Validate updating cart item quantity
 * @param {Object} params - Validation parameters
 * @param {string} params.productId - Product ID
 * @param {string} params.colorId - Color ID (optional)
 * @param {number} params.newQuantity - New quantity
 * @param {Array} params.cartItems - Current cart items (actual cart)
 * @param {Array} params.tempCartItems - Current temp cart items
 * @param {Array} params.productList - List of products for validation
 * @param {boolean} params.isAuthenticated - Whether user is authenticated
 * @returns {Object} Validation result with success status and message
 */
export const validateUpdateCartQuantity = ({ 
  productId, 
  colorId, 
  newQuantity, 
  cartItems = [], 
  tempCartItems = [], 
  productList = [],
  isAuthenticated = false 
}) => {
  try {
    // Basic validation
    if (!productId || newQuantity < 0) {
      return { success: false, message: 'Invalid item data' };
    }

    if (newQuantity === 0) {
      return { success: true, message: 'Item will be removed from cart' };
    }

    // Find the product
    const product = productList.find(p => p._id === productId);
    if (!product) {
      return { success: false, message: 'Product not found' };
    }

    // Calculate quantities in other cart (cross-cart validation)
    let otherCartQuantity = 0;

    if (isAuthenticated) {
      // User is authenticated, check temp cart for conflicts
      const tempItem = tempCartItems.find(
        item => item.productId === productId && item.colorId === colorId
      );
      if (tempItem) {
        otherCartQuantity = tempItem.quantity;
      }
    } else {
      // User is not authenticated, check actual cart for conflicts
      const actualItem = cartItems.find(
        item => item.productId === productId && item.colors?._id === colorId
      );
      if (actualItem) {
        otherCartQuantity = actualItem.quantity;
      }
    }

    // Calculate total quantity across both carts
    const totalQuantity = newQuantity + otherCartQuantity;

    // Determine available inventory
    let availableInventory = 0;
    let inventorySource = '';

    if (colorId && product.colors && product.colors.length > 0) {
      // Product has colors - validate against specific color inventory
      const selectedColor = product.colors.find(c => c._id === colorId);
      if (!selectedColor) {
        return { success: false, message: 'Selected color not found' };
      }
      availableInventory = selectedColor.inventory || 0;
      inventorySource = `color "${selectedColor.title}"`;
    } else {
      // Product without colors - validate against total stock
      availableInventory = product.totalStock || 0;
      inventorySource = 'product';
    }

    // Check inventory availability
    if (totalQuantity > availableInventory) {
      return { 
        success: false, 
        message: `Only ${availableInventory} items available for this ${inventorySource}` 
      };
    }

    return { 
      success: true, 
      message: 'Quantity can be updated',
      availableInventory,
      totalQuantity
    };

  } catch (error) {
    console.error('Error validating update cart quantity:', error);
    return { success: false, message: 'Validation failed' };
  }
};

/**
 * Validate color change in cart
 * @param {Object} params - Validation parameters
 * @param {string} params.productId - Product ID
 * @param {string} params.oldColorId - Current color ID
 * @param {string} params.newColorId - New color ID
 * @param {number} params.quantity - Item quantity
 * @param {Array} params.cartItems - Current cart items (actual cart)
 * @param {Array} params.tempCartItems - Current temp cart items
 * @param {Array} params.productList - List of products for validation
 * @param {boolean} params.isAuthenticated - Whether user is authenticated
 * @returns {Object} Validation result with success status and message
 */
export const validateColorChange = ({ 
  productId, 
  oldColorId, 
  newColorId, 
  quantity, 
  cartItems = [], 
  tempCartItems = [], 
  productList = [],
  isAuthenticated = false 
}) => {
  try {
    // Basic validation
    if (!productId || !oldColorId || !newColorId || !quantity || quantity <= 0) {
      return { success: false, message: 'Invalid item data' };
    }

    if (oldColorId === newColorId) {
      return { success: true, message: 'No change needed' };
    }

    // Find the product
    const product = productList.find(p => p._id === productId);
    if (!product) {
      return { success: false, message: 'Product not found' };
    }

    // Find the new color
    const newColor = product.colors?.find(c => c._id === newColorId);
    if (!newColor) {
      return { success: false, message: 'Selected color not found' };
    }

    // Check if there's already an item with the new color in the relevant cart
    let existingNewColorQuantity = 0;
    let otherCartQuantity = 0;

    if (isAuthenticated) {
      // Check actual cart for existing new color item
      const existingActualItem = cartItems.find(
        item => item.productId === productId && item.colors?._id === newColorId
      );
      if (existingActualItem) {
        existingNewColorQuantity = existingActualItem.quantity;
      }

      // Check temp cart for conflicts
      const tempItem = tempCartItems.find(
        item => item.productId === productId && item.colorId === newColorId
      );
      if (tempItem) {
        otherCartQuantity = tempItem.quantity;
      }
    } else {
      // Check temp cart for existing new color item
      const existingTempItem = tempCartItems.find(
        item => item.productId === productId && item.colorId === newColorId
      );
      if (existingTempItem) {
        existingNewColorQuantity = existingTempItem.quantity;
      }

      // Check actual cart for conflicts
      const actualItem = cartItems.find(
        item => item.productId === productId && item.colors?._id === newColorId
      );
      if (actualItem) {
        otherCartQuantity = actualItem.quantity;
      }
    }

    // Calculate total quantity for new color
    const totalNewColorQuantity = existingNewColorQuantity + quantity + otherCartQuantity;

    // Check inventory for new color
    const availableInventory = newColor.inventory || 0;

    if (totalNewColorQuantity > availableInventory) {
      return { 
        success: false, 
        message: `Only ${availableInventory} items available for color "${newColor.title}"` 
      };
    }

    return { 
      success: true, 
      message: 'Color can be changed',
      availableInventory,
      totalNewColorQuantity,
      willMerge: existingNewColorQuantity > 0
    };

  } catch (error) {
    console.error('Error validating color change:', error);
    return { success: false, message: 'Validation failed' };
  }
};

/**
 * Validate entire cart for checkout
 * @param {Object} params - Validation parameters
 * @param {Array} params.cartItems - Cart items to validate
 * @param {Array} params.productList - List of products for validation
 * @param {boolean} params.isTempCart - Whether validating temp cart
 * @returns {Object} Validation result with success status, message, and errors array
 */
export const validateCartForCheckout = ({ cartItems = [], productList = [], isTempCart = false }) => {
  try {
    const errors = [];
    let hasErrors = false;

    if (cartItems.length === 0) {
      return { success: false, message: 'Cart is empty', errors: [] };
    }

    cartItems.forEach(item => {
      const productId = isTempCart ? item.productId : item.productId;
      const colorId = isTempCart ? item.colorId : item.colors?._id;
      const quantity = item.quantity;
      const productTitle = isTempCart ? item.productDetails?.title : item.title;

      // Find product
      const product = productList.find(p => p._id === productId);
      if (!product) {
        errors.push(`${productTitle}: Product no longer available`);
        hasErrors = true;
        return;
      }

      // Check inventory
      let availableInventory = 0;
      let colorName = '';

      if (colorId && product.colors && product.colors.length > 0) {
        const color = product.colors.find(c => c._id === colorId);
        if (!color) {
          errors.push(`${productTitle}: Selected color no longer available`);
          hasErrors = true;
          return;
        }
        availableInventory = color.inventory || 0;
        colorName = ` (${color.title})`;
      } else {
        availableInventory = product.totalStock || 0;
      }

      if (quantity > availableInventory) {
        if (availableInventory === 0) {
          errors.push(`${productTitle}${colorName}: Out of stock`);
        } else {
          errors.push(`${productTitle}${colorName}: Only ${availableInventory} items available`);
        }
        hasErrors = true;
      }
    });

    if (hasErrors) {
      return { 
        success: false, 
        message: 'Some items in your cart are no longer available', 
        errors 
      };
    }

    return { 
      success: true, 
      message: 'Cart is valid for checkout', 
      errors: [] 
    };

  } catch (error) {
    console.error('Error validating cart for checkout:', error);
    return { 
      success: false, 
      message: 'Cart validation failed', 
      errors: ['Validation error occurred'] 
    };
  }
};

/**
 * Get inventory status for a product/color combination
 * @param {Object} params - Parameters
 * @param {string} params.productId - Product ID
 * @param {string} params.colorId - Color ID (optional)
 * @param {Array} params.productList - List of products
 * @returns {Object} Inventory status
 */
export const getInventoryStatus = ({ productId, colorId, productList = [] }) => {
  try {
    const product = productList.find(p => p._id === productId);
    if (!product) {
      return { available: 0, status: 'not_found' };
    }

    let available = 0;
    let status = 'in_stock';

    if (colorId && product.colors && product.colors.length > 0) {
      const color = product.colors.find(c => c._id === colorId);
      if (!color) {
        return { available: 0, status: 'color_not_found' };
      }
      available = color.inventory || 0;
    } else {
      available = product.totalStock || 0;
    }

    if (available === 0) {
      status = 'out_of_stock';
    } else if (available <= 5) {
      status = 'low_stock';
    }

    return { available, status };
  } catch (error) {
    console.error('Error getting inventory status:', error);
    return { available: 0, status: 'error' };
  }
};
