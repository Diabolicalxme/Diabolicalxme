const TEMP_CART_KEY = 'tempCart';
const TEMP_CART_BACKUP_KEY = 'tempCartBackup';

/**
 * Get all temp cart items from localStorage
 * @returns {Array} Array of temp cart items
 */
export const getTempCartItems = () => {
  try {
    const tempCart = localStorage.getItem(TEMP_CART_KEY);
    console.log('getTempCartItems - raw data from localStorage:', tempCart);
    const parsed = tempCart ? JSON.parse(tempCart) : [];
    console.log('getTempCartItems - parsed data:', parsed);
    return parsed;
  } catch (error) {
    console.error('Error getting temp cart items:', error);
    return [];
  }
};

/**
 * Save temp cart items to localStorage
 * @param {Array} items - Array of cart items to save
 */
const saveTempCartItems = (items) => {
  try {
    localStorage.setItem(TEMP_CART_KEY, JSON.stringify(items));
    // Dispatch custom event to notify components of cart update
    window.dispatchEvent(new CustomEvent('tempCartUpdated'));
  } catch (error) {
    console.error('Error saving temp cart items:', error);
  }
};

/**
 * Add item to temp cart with validation
 * @param {Object} tempCartItem - Item to add to cart
 * @param {Array} productList - List of products for validation
 * @param {Array} existingCartItems - Existing actual cart items for cross-validation
 * @returns {Object} Result object with success status and message
 */
export const addToTempCart = (tempCartItem, productList = [], existingCartItems = []) => {
  try {
    const { productId, colorId, quantity, productDetails } = tempCartItem;

    if (!productId || !quantity || quantity <= 0) {
      return { success: false, message: 'Invalid item data' };
    }

    // Find the product for validation
    const product = productList.find(p => p._id === productId);
    if (!product) {
      return { success: false, message: 'Product not found' };
    }

    const tempCartItems = getTempCartItems();

    // Find existing temp cart item with same product and color
    const existingTempItemIndex = tempCartItems.findIndex(
      item => item.productId === productId && item.colorId === colorId
    );

    // Calculate current quantity in temp cart
    const currentTempQuantity = existingTempItemIndex >= 0 ? tempCartItems[existingTempItemIndex].quantity : 0;

    // Calculate current quantity in actual cart
    const existingActualItem = existingCartItems.find(
      item => item.productId === productId && item.colors?._id === colorId
    );
    const currentActualQuantity = existingActualItem ? existingActualItem.quantity : 0;

    // Calculate total quantity after adding
    const totalQuantityAfterAdd = currentTempQuantity + currentActualQuantity + quantity;

    // Validate inventory
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

    // Enhanced inventory validation with specific messages
    if (availableInventory === 0) {
      return {
        success: false,
        message: colorId ? 'Selected color is out of stock' : 'This product is out of stock'
      };
    }

    if (totalQuantityAfterAdd > availableInventory) {
      const remainingStock = Math.max(0, availableInventory - (currentTempQuantity + currentActualQuantity));

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

    // Add or update item in temp cart
    if (existingTempItemIndex >= 0) {
      // Update existing item quantity
      tempCartItems[existingTempItemIndex].quantity += quantity;
    } else {
      // Add new item to temp cart
      const newTempCartItem = {
        productId,
        colorId: colorId || null,
        quantity,
        productDetails: {
          title: productDetails?.title || product.title,
          price: productDetails?.price || product.price,
          salePrice: productDetails?.salePrice || product.salePrice,
          image: productDetails?.image || product.image?.[0] || '',
          category: productDetails?.category || product.category,
          productCode: productDetails?.productCode || product.productCode
        },
        addedAt: new Date().toISOString()
      };
      tempCartItems.push(newTempCartItem);
    }

    saveTempCartItems(tempCartItems);
    return {
      success: true,
      message: `${quantity} item${quantity > 1 ? 's' : ''} added to cart!`
    };

  } catch (error) {
    console.error('Error adding to temp cart:', error);
    return { success: false, message: 'Failed to add item to cart' };
  }
};

/**
 * Remove item from temp cart
 * @param {string} productId - Product ID to remove
 * @param {string} colorId - Color ID to remove (optional)
 * @returns {Object} Result object with success status and message
 */
export const removeFromTempCart = (productId, colorId = null) => {
  try {
    const tempCartItems = getTempCartItems();
    const filteredItems = tempCartItems.filter(
      item => !(item.productId === productId && item.colorId === colorId)
    );
    
    saveTempCartItems(filteredItems);
    return { success: true, message: 'Item removed from cart' };
  } catch (error) {
    console.error('Error removing from temp cart:', error);
    return { success: false, message: 'Failed to remove item from cart' };
  }
};

/**
 * Update quantity of item in temp cart
 * @param {string} productId - Product ID
 * @param {string} colorId - Color ID (optional)
 * @param {number} newQuantity - New quantity
 * @param {Array} productList - List of products for validation
 * @returns {Object} Result object with success status and message
 */
export const updateTempCartQuantity = (productId, colorId = null, newQuantity, productList = []) => {
  try {
    if (newQuantity <= 0) {
      return removeFromTempCart(productId, colorId);
    }

    const tempCartItems = getTempCartItems();
    const itemIndex = tempCartItems.findIndex(
      item => item.productId === productId && item.colorId === colorId
    );

    if (itemIndex === -1) {
      return { success: false, message: 'Item not found in cart' };
    }

    // Find product for validation
    const product = productList.find(p => p._id === productId);
    if (!product) {
      return { success: false, message: 'Product not found' };
    }

    // Validate inventory
    let availableInventory = 0;
    if (colorId && product.colors && product.colors.length > 0) {
      const selectedColor = product.colors.find(c => c._id === colorId);
      if (!selectedColor) {
        return { success: false, message: 'Selected color not found' };
      }
      availableInventory = selectedColor.inventory || 0;
    } else {
      availableInventory = product.totalStock || 0;
    }

    if (newQuantity > availableInventory) {
      return { 
        success: false, 
        message: `Only ${availableInventory} items available for this product` 
      };
    }

    // Update quantity
    tempCartItems[itemIndex].quantity = newQuantity;
    saveTempCartItems(tempCartItems);
    
    return { success: true, message: 'Cart updated successfully' };
  } catch (error) {
    console.error('Error updating temp cart quantity:', error);
    return { success: false, message: 'Failed to update cart' };
  }
};

/**
 * Change color of item in temp cart
 * @param {string} productId - Product ID
 * @param {string} oldColorId - Current color ID
 * @param {string} newColorId - New color ID
 * @param {Array} productList - List of products for validation
 * @returns {Object} Result object with success status and message
 */
export const changeTempCartColor = (productId, oldColorId, newColorId, productList = []) => {
  try {
    const tempCartItems = getTempCartItems();
    const itemIndex = tempCartItems.findIndex(
      item => item.productId === productId && item.colorId === oldColorId
    );

    if (itemIndex === -1) {
      return { success: false, message: 'Item not found in cart' };
    }

    const product = productList.find(p => p._id === productId);
    if (!product) {
      return { success: false, message: 'Product not found' };
    }

    const newColor = product.colors?.find(c => c._id === newColorId);
    if (!newColor) {
      return { success: false, message: 'Selected color not found' };
    }

    const currentQuantity = tempCartItems[itemIndex].quantity;

    // Check if there's already an item with the new color
    const existingNewColorIndex = tempCartItems.findIndex(
      item => item.productId === productId && item.colorId === newColorId
    );

    if (existingNewColorIndex >= 0) {
      // Merge quantities
      const totalQuantity = tempCartItems[existingNewColorIndex].quantity + currentQuantity;
      
      // Validate inventory for new color
      if (totalQuantity > (newColor.inventory || 0)) {
        return { 
          success: false, 
          message: `Only ${newColor.inventory || 0} items available for this color` 
        };
      }

      // Update existing item and remove old one
      tempCartItems[existingNewColorIndex].quantity = totalQuantity;
      tempCartItems.splice(itemIndex, 1);
    } else {
      // Validate inventory for new color
      if (currentQuantity > (newColor.inventory || 0)) {
        return { 
          success: false, 
          message: `Only ${newColor.inventory || 0} items available for this color` 
        };
      }

      // Just change the color
      tempCartItems[itemIndex].colorId = newColorId;
    }

    saveTempCartItems(tempCartItems);
    return { success: true, message: 'Color changed successfully' };
  } catch (error) {
    console.error('Error changing temp cart color:', error);
    return { success: false, message: 'Failed to change color' };
  }
};

/**
 * Calculate total price of temp cart
 * @returns {number} Total price
 */
export const getTempCartTotal = () => {
  try {
    const tempCartItems = getTempCartItems();
    return tempCartItems.reduce((total, item) => {
      const price = item.productDetails?.salePrice > 0 
        ? item.productDetails.salePrice 
        : item.productDetails?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  } catch (error) {
    console.error('Error calculating temp cart total:', error);
    return 0;
  }
};

/**
 * Get count of unique products in temp cart (not total quantity)
 * @returns {number} Count of unique products
 */
export const getTempCartCount = () => {
  try {
    const tempCartItems = getTempCartItems();
    return tempCartItems.length;
  } catch (error) {
    console.error('Error getting temp cart count:', error);
    return 0;
  }
};

/**
 * Backup temp cart items before clearing (for logout restoration)
 */
export const backupTempCart = () => {
  try {
    const tempCartItems = getTempCartItems();
    if (tempCartItems.length > 0) {
      localStorage.setItem(TEMP_CART_BACKUP_KEY, JSON.stringify(tempCartItems));
      console.log('Temp cart backed up:', tempCartItems.length, 'items');
    }
  } catch (error) {
    console.error('Error backing up temp cart:', error);
  }
};

/**
 * Restore temp cart items from backup (for logout restoration)
 */
export const restoreTempCartFromBackup = () => {
  try {
    const backupData = localStorage.getItem(TEMP_CART_BACKUP_KEY);
    if (backupData) {
      const backupItems = JSON.parse(backupData);
      localStorage.setItem(TEMP_CART_KEY, JSON.stringify(backupItems));
      window.dispatchEvent(new CustomEvent('tempCartUpdated'));
      console.log('Temp cart restored from backup:', backupItems.length, 'items');
      return backupItems;
    }
    return [];
  } catch (error) {
    console.error('Error restoring temp cart from backup:', error);
    return [];
  }
};

/**
 * Clear temp cart backup
 */
export const clearTempCartBackup = () => {
  try {
    localStorage.removeItem(TEMP_CART_BACKUP_KEY);
  } catch (error) {
    console.error('Error clearing temp cart backup:', error);
  }
};

/**
 * Clear all items from temp cart
 */
export const clearTempCart = () => {
  try {
    localStorage.removeItem(TEMP_CART_KEY);
    window.dispatchEvent(new CustomEvent('tempCartUpdated'));
  } catch (error) {
    console.error('Error clearing temp cart:', error);
  }
};

/**
 * Copy temp cart items to actual cart
 * @param {Function} addToCartFunction - Function to add items to actual cart
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result object with success status and message
 */
export const copyTempCartToUser = async (addToCartFunction, userId) => {
  try {
    const tempCartItems = getTempCartItems();

    if (tempCartItems.length === 0) {
      return { success: true, message: 'No items to copy', copied: 0, failed: 0 };
    }

    // Prevent duplicate copying
    const copyKey = `tempCartCopied_${userId}`;
    if (localStorage.getItem(copyKey)) {
      return { success: true, message: 'Already copied', copied: 0, failed: 0 };
    }

    let successCount = 0;
    let failureCount = 0;
    const errors = [];

    // Copy each item to actual cart
    for (const item of tempCartItems) {
      try {
        const cartData = {
          userId,
          productId: item.productId,
          quantity: item.quantity,
          colorId: item.colorId
        };

        const result = await addToCartFunction(cartData);

        if (result?.payload?.success) {
          successCount++;
        } else {
          failureCount++;
          errors.push(`${item.productDetails?.title}: ${result?.payload?.message || 'Failed to add'}`);
        }
      } catch (error) {
        failureCount++;
        errors.push(`${item.productDetails?.title}: ${error.message || 'Failed to add'}`);
      }
    }

    // Mark as copied if any items were successful
    if (successCount > 0) {
      localStorage.setItem(copyKey, 'true');
    }

    // Backup temp cart before clearing (for logout restoration)
    backupTempCart();

    // Clear temp cart after copying (regardless of success/failure)
    clearTempCart();

    if (failureCount === 0) {
      return {
        success: true,
        message: `${successCount} item${successCount > 1 ? 's' : ''} moved to your cart`,
        copied: successCount,
        failed: failureCount
      };
    } else if (successCount > 0) {
      return {
        success: true,
        message: `${successCount} item${successCount > 1 ? 's' : ''} moved to cart. ${failureCount} item${failureCount > 1 ? 's' : ''} could not be added.`,
        copied: successCount,
        failed: failureCount,
        errors
      };
    } else {
      return {
        success: false,
        message: 'Failed to move items to cart',
        copied: successCount,
        failed: failureCount,
        errors
      };
    }
  } catch (error) {
    console.error('Error copying temp cart to user:', error);
    return { success: false, message: 'Failed to copy cart items', copied: 0, failed: 0 };
  }
};
