// const Cart = require("../../models/Cart");
// const Product = require("../../models/Product");

// const addToCart = async (req, res) => {
//   try {
//     const { userId, productId, quantity } = req.body;

//     if (!userId || !productId || quantity <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid data provided!",
//       });
//     }

//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     let cart = await Cart.findOne({ userId });

//     if (!cart) {
//       cart = new Cart({ userId, items: [] });
//     }

//     const findCurrentProductIndex = cart.items.findIndex(
//       (item) => item.productId.toString() === productId
//     );

//     if (findCurrentProductIndex === -1) {
//       cart.items.push({ productId, quantity });
//     } else {
//       cart.items[findCurrentProductIndex].quantity += quantity;
//     }

//     await cart.save();
//     res.status(200).json({
//       success: true,
//       data: cart,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: "Error",
//     });
//   }
// };

// const fetchCartItems = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: "User id is manadatory!",
//       });
//     }

//     const cart = await Cart.findOne({ userId }).populate({
//       path: "items.productId",
//       select: "image title price salePrice",
//     });

//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         message: "Cart not found!",
//       });
//     }

//     const validItems = cart.items.filter(
//       (productItem) => productItem.productId
//     );

//     if (validItems.length < cart.items.length) {
//       cart.items = validItems;
//       await cart.save();
//     }

//     const populateCartItems = validItems.map((item) => ({
//       productId: item.productId._id,
//       image: item.productId.image,
//       title: item.productId.title,
//       price: item.productId.price,
//       salePrice: item.productId.salePrice,
//       quantity: item.quantity,
//     }));

//     res.status(200).json({
//       success: true,
//       data: {
//         ...cart._doc,
//         items: populateCartItems,
//       },
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: "Error",
//     });
//   }
// };

// const updateCartItemQty = async (req, res) => {
//   try {
//     const { userId, productId, quantity } = req.body;

//     if (!userId || !productId || quantity <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid data provided!",
//       });
//     }

//     const cart = await Cart.findOne({ userId });
//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         message: "Cart not found!",
//       });
//     }

//     const findCurrentProductIndex = cart.items.findIndex(
//       (item) => item.productId.toString() === productId
//     );

//     if (findCurrentProductIndex === -1) {
//       return res.status(404).json({
//         success: false,
//         message: "Cart item not present !",
//       });
//     }

//     cart.items[findCurrentProductIndex].quantity = quantity;
//     await cart.save();

//     await cart.populate({
//       path: "items.productId",
//       select: "image title price salePrice",
//     });

//     const populateCartItems = cart.items.map((item) => ({
//       productId: item.productId ? item.productId._id : null,
//       image: item.productId ? item.productId.image : null,
//       title: item.productId ? item.productId.title : "Product not found",
//       price: item.productId ? item.productId.price : null,
//       salePrice: item.productId ? item.productId.salePrice : null,
//       quantity: item.quantity,
//     }));

//     res.status(200).json({
//       success: true,
//       data: {
//         ...cart._doc,
//         items: populateCartItems,
//       },
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: "Error",
//     });
//   }
// };

// const deleteCartItem = async (req, res) => {
//   try {
//     const { userId, productId } = req.params;
//     if (!userId || !productId) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid data provided!",
//       });
//     }

//     const cart = await Cart.findOne({ userId }).populate({
//       path: "items.productId",
//       select: "image title price salePrice",
//     });

//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         message: "Cart not found!",
//       });
//     }

//     cart.items = cart.items.filter(
//       (item) => item.productId._id.toString() !== productId
//     );

//     await cart.save();

//     await cart.populate({
//       path: "items.productId",
//       select: "image title price salePrice",
//     });

//     const populateCartItems = cart.items.map((item) => ({
//       productId: item.productId ? item.productId._id : null,
//       image: item.productId ? item.productId.image : null,
//       title: item.productId ? item.productId.title : "Product not found",
//       price: item.productId ? item.productId.price : null,
//       salePrice: item.productId ? item.productId.salePrice : null,
//       quantity: item.quantity,
//     }));

//     res.status(200).json({
//       success: true,
//       data: {
//         ...cart._doc,
//         items: populateCartItems,
//       },
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: "Error",
//     });
//   }
// };

// module.exports = {
//   addToCart,
//   updateCartItemQty,
//   deleteCartItem,
//   fetchCartItems,
// };


const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

// Helper function to populate cart items with proper data types
const populateCartItemsWithProperTypes = async (cart) => {
  // Populate cart items
  await cart.populate({
    path: "items.productId",
    select: "image title price salePrice colors",
  });

  // Ensure all cart items have valid data with proper types
  const populateCartItems = cart.items.map((item) => {
    // Convert price and quantity to numbers to ensure proper calculations
    const price = parseFloat(item.productId.price || 0);
    const salePrice = parseFloat(item.productId.salePrice || 0);
    const quantity = parseInt(item.quantity || 0, 10);

    return {
      productId: item.productId._id,
      image: item.productId.image,
      title: item.productId.title,
      price: price,
      salePrice: salePrice,
      quantity: quantity,
      colors: item.colors || null,
    };
  });

  return populateCartItems;
};

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, colorId } = req.body;

    // Validate required fields and positive quantity
    if (!userId || !productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    // colorId is optional - it's only required for products with color options

    // Fetch the product information using the provided productId
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Retrieve or create a cart for the user
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Handle products with and without color options
    let selectedColor = null;
    let newColor = null;

    // If product has colors
    if (product.colors && product.colors.length > 0) {
      // If colorId is provided, use it
      if (colorId) {
        selectedColor = product.colors.find(
          (c) => c._id.toString() === colorId
        );

        if (!selectedColor) {
          return res.status(400).json({
            success: false,
            message: "Invalid color selection!",
          });
        }
      } else {
        // If no colorId provided, use the first color
        selectedColor = product.colors[0];
      }

      // Build a color object with _id, title, and image from the selectedColor
      newColor = {
        _id: selectedColor._id,
        title: selectedColor.title,
        image: selectedColor.image,
      };
    }

    // Enhanced inventory validation
    let availableInventory = 0;
    let inventorySource = '';

    if (selectedColor) {
      // Product has color - check color-specific inventory
      availableInventory = selectedColor.inventory || 0;
      inventorySource = `color "${selectedColor.title}"`;
    } else {
      // Product without color - use total stock
      availableInventory = product.totalStock || 0;
      inventorySource = 'product';
    }

    // Check if we have enough inventory
    if (availableInventory === 0) {
      return res.status(400).json({
        success: false,
        message: selectedColor ? "Selected color is out of stock" : "Product is out of stock",
      });
    }

    // Check if the cart already has this product with the same color
    let findCurrentProductIndex = -1;

    if (newColor) {
      // For products with colors, match both productId and colorId
      findCurrentProductIndex = cart.items.findIndex(
        (item) =>
          item.productId.toString() === productId &&
          item.colors && item.colors._id && item.colors._id.toString() === newColor._id.toString()
      );
    } else {
      // For products without colors, match only productId
      findCurrentProductIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId && (!item.colors || !item.colors._id)
      );
    }

    // Calculate total quantity after adding
    const currentQuantity = findCurrentProductIndex !== -1 ? cart.items[findCurrentProductIndex].quantity : 0;
    const totalQuantityAfterAdd = currentQuantity + quantity;

    // Validate against available inventory
    if (totalQuantityAfterAdd > availableInventory) {
      const remainingStock = Math.max(0, availableInventory - currentQuantity);

      if (remainingStock === 0) {
        return res.status(400).json({
          success: false,
          message: `You already have the maximum available quantity for this ${inventorySource}`,
        });
      }

      return res.status(400).json({
        success: false,
        message: `Only ${remainingStock} more item${remainingStock > 1 ? 's' : ''} can be added for this ${inventorySource}`,
      });
    }

    // If product isn't in cart, add it; otherwise, increment the quantity
    if (findCurrentProductIndex === -1) {
      cart.items.push({
        productId,
        quantity,
        colors: newColor // This will be null for products without colors
      });
    } else {
      // Auto-increment quantity for existing matches
      cart.items[findCurrentProductIndex].quantity += quantity;
    }

    // Save and return the updated cart
    await cart.save();

    // Use helper function to populate cart items with proper data types
    const populateCartItems = await populateCartItemsWithProperTypes(cart);

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error adding item to cart",
    });
  }
};

const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is mandatory!",
      });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice colors",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const validItems = cart.items.filter((productItem) => productItem.productId);

    if (validItems.length < cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    // Use helper function to populate cart items with proper data types
    const populateCartItems = await populateCartItemsWithProperTypes(cart);

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error fetching cart items",
    });
  }
};

const updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, quantity, colorId, oldColorId } = req.body;

    // Basic validation - only userId and productId are required
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required!",
      });
    }

    // If quantity is provided, it must be positive
    if (quantity !== undefined && quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero!",
      });
    }


    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    // Find the current item index based on productId and oldColorId (if provided)
    let findCurrentProductIndex = -1;

    if (oldColorId) {
      // If oldColorId is provided, find the item with that specific color
      findCurrentProductIndex = cart.items.findIndex(
        (item) =>
          item.productId.toString() === productId &&
          item.colors &&
          item.colors._id &&
          item.colors._id.toString() === oldColorId
      );
    } else {
      // For products without colors, find by productId only and ensure no color is set
      findCurrentProductIndex = cart.items.findIndex(
        (item) =>
          item.productId.toString() === productId &&
          (!item.colors || !item.colors._id)
      );

      // If not found, try to find by productId only (fallback)
      if (findCurrentProductIndex === -1) {
        findCurrentProductIndex = cart.items.findIndex(
          (item) => item.productId.toString() === productId
        );
      }
    }

    if (findCurrentProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found!",
      });
    }

    // If colorId is provided and different from oldColorId, we're changing colors
    if (colorId && (!oldColorId || colorId !== oldColorId)) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Check if the product has colors
      if (!product.colors || product.colors.length === 0) {
        // Just update quantity for products without colors
        cart.items[findCurrentProductIndex].quantity = quantity;
      } else {
        const selectedColor = product.colors.find((c) => c._id.toString() === colorId);
        if (!selectedColor) {
          return res.status(400).json({
            success: false,
            message: "Invalid color selection!",
          });
        }

        // Check if there's already an item with the new color
        const existingItemWithNewColorIndex = cart.items.findIndex(
          (item) =>
            item.productId.toString() === productId &&
            item.colors &&
            item.colors._id &&
            item.colors._id.toString() === colorId
        );

        if (existingItemWithNewColorIndex !== -1 && existingItemWithNewColorIndex !== findCurrentProductIndex) {
          // If an item with the new color already exists, merge quantities
          const originalQuantity = cart.items[findCurrentProductIndex].quantity;
          const existingQuantity = cart.items[existingItemWithNewColorIndex].quantity;

          // Always combine the quantities
          const newTotalQuantity = originalQuantity + existingQuantity;

          // Update the existing item with the combined quantity
          cart.items[existingItemWithNewColorIndex].quantity = newTotalQuantity;

          // Remove the old item
          cart.items.splice(findCurrentProductIndex, 1);

        } else {
          // Just update the color of the existing item
          const newColor = {
            _id: selectedColor._id,
            title: selectedColor.title,
            image: selectedColor.image,
          };

          cart.items[findCurrentProductIndex].colors = newColor;

          // Only update quantity if it was provided
          if (quantity !== undefined) {
            cart.items[findCurrentProductIndex].quantity = quantity;
          }
        }
      }
    } else {
      // Just update quantity if provided
      if (quantity !== undefined) {
        cart.items[findCurrentProductIndex].quantity = quantity;
      }
    }

    await cart.save();

    // Use helper function to populate cart items with proper data types
    const populateCartItems = await populateCartItemsWithProperTypes(cart);

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({
      success: false,
      message: "Error updating cart item",
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId, colorId } = req.params;
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    // If colorId is provided, only remove items with matching productId AND colorId
    if (colorId) {
      cart.items = cart.items.filter(
        (item) => !(
          item.productId.toString() === productId &&
          item.colors &&
          item.colors._id &&
          item.colors._id.toString() === colorId
        )
      );
    } else {
      // If no colorId, remove all items with matching productId
      // This handles both products with and without colors
      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== productId
      );
    }

    await cart.save();

    // Use helper function to populate cart items with proper data types
    const populateCartItems = await populateCartItemsWithProperTypes(cart);

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error deleting cart item",
    });
  }
};

module.exports = {
  addToCart,
  updateCartItemQty,
  deleteCartItem,
  fetchCartItems,
};
