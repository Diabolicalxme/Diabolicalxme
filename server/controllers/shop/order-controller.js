const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const User = require("../../models/User");
const IncognitoUser = require("../../models/IncognitoUser");
const sendEmail = require("../../helpers/send-email");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      email,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
      cartId,
    } = req.body;

    // Debug: Log the received addressInfo
    console.log('Received addressInfo:', addressInfo);

    // Validate and sanitize addressInfo
    const sanitizedAddressInfo = {
      addressId: String(addressInfo?.addressId || ''),
      name: String(addressInfo?.name || ''),
      address: String(addressInfo?.address || ''),
      state: String(addressInfo?.state || ''),
      city: String(addressInfo?.city || ''),
      pincode: String(addressInfo?.pincode || ''),
      phone: String(addressInfo?.phone || ''),
      notes: String(addressInfo?.notes || ''),
    };

    // Debug: Log the sanitized addressInfo
    console.log('Sanitized addressInfo:', sanitizedAddressInfo);

    // Create Razorpay order
    const options = {
      amount: totalAmount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`, // Custom receipt ID
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save the order details in the database
    const newlyCreatedOrder = new Order({
      userId,
      cartId,
      email, // Save email for incognito users
      cartItems,
      addressInfo: sanitizedAddressInfo,
      orderStatus: orderStatus || "pending", // Default to pending if not provided
      paymentMethod,
      paymentStatus: paymentStatus || "pending", // Default to pending if not provided
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId, // Initially null for Razorpay; updated on capture
      payerId, // Initially null for Razorpay; updated on capture
      razorpayOrderId: razorpayOrder.id, // Save Razorpay order ID
    });

    await newlyCreatedOrder.save();

    res.status(201).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      orderId: newlyCreatedOrder._id,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({
      success: false,
      message: "Error while creating Razorpay order",
    });
  }
};

// Capture Razorpay Payment
const capturePayment = async (req, res) => {
  try {
    const { paymentId, orderId } = req.body;

    // Verify payment: find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Update payment status and order status
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;

    // Debug: Log order data before sending emails
    console.log('Order data for email:', {
      addressInfo: order.addressInfo,
      email: order.email,
      userId: order.userId,
      orderId: order._id
    });

    // Helper function to format address with line breaks
    const formatAddressForEmail = (address) => {
      if (!address) return 'N/A';

      // If address contains commas, split and format each part on new line
      if (address.includes(',')) {
        return address.split(',').map(part => part.trim()).join('<br>');
      }

      // If no commas, return as is
      return address;
    };

    // Reduce the total stock and color inventory for each product in the order
    for (let item of order.cartItems) {
      const product = await Product.findById(item.productId);

      // Reduce total stock
      product.totalStock -= item.quantity;

      // Reduce color inventory if the item has a color
      if (item.colors && item.colors._id) {
        const colorIndex = product.colors.findIndex(color =>
          color._id.toString() === item.colors._id.toString()
        );

        if (colorIndex !== -1) {
          product.colors[colorIndex].inventory -= item.quantity;
          // Ensure inventory doesn't go below 0
          if (product.colors[colorIndex].inventory < 0) {
            product.colors[colorIndex].inventory = 0;
          }
        }
      }

      await product.save();
    }

    await order.save();

    // Clear cart items after successful payment
    if (order.cartId) {
      try {
        // For regular users, clear the cart from database
        const cart = await Cart.findById(order.cartId);
        if (cart) {
          // Remove only the items that were purchased
          const purchasedProductIds = order.cartItems.map(item => item.productId);
          cart.items = cart.items.filter(cartItem =>
            !purchasedProductIds.some(purchasedId =>
              cartItem.productId.toString() === purchasedId.toString() &&
              cartItem.colors?._id === order.cartItems.find(orderItem =>
                orderItem.productId === purchasedId
              )?.colors?._id
            )
          );
          await cart.save();
          console.log('Cart cleared for user:', order.userId);
        }
      } catch (cartError) {
        console.error('Error clearing cart:', cartError);
        // Don't fail the order if cart clearing fails
      }
    }

    // Prepare immersive email message with detailed order information and an appealing UI.
    const message = `
    <div style="font-family: Arial, sans-serif; color: #2c3315; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
     <div style="background-color: #eeeeee; padding: 20px; text-align: center; color: #2c3315;">
        <img src="https://res.cloudinary.com/dkqt39aad/image/upload/v1754300738/logo_pa0nq0.png" alt="Logo" style="max-width: 150px;">
      <h2 style="margin-bottom: 5px;">Order Confirmed!</h2>
        <p style="font-size: 16px; margin-top: 0;">Thank you for your purchase.</p>
      </div>
      <div style="padding: 20px;">
        <h3 style="border-bottom: 2px solid #eeeeee; padding-bottom: 10px;">Order Details</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
        <p><strong>Payment ID:</strong> ${order.paymentId}</p>

        ${order.cartItems && order.cartItems.length ? `
          <h4 style="margin-top: 20px; margin-bottom: 15px; color: #2c3315;">Items Ordered</h4>

          <!-- Card Layout (Mobile-First Design) -->
          <div style="display: block;">
            ${order.cartItems.map(item => `
              <table style="width: 100%; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 15px; background-color: #ffffff;" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 15px; text-align: center;">
                    <img src="${item?.colors?.image || item?.image || ''}" alt="${item?.title || ''}"
                      style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd; display: block; margin: 0 auto;">
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 15px 15px 15px; text-align: center;">
                    <h5 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #2c3315;">${item?.title || 'Product'}</h5>
                    ${item?.productCode ? `<p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">Code: ${item.productCode}</p>` : ''}

                    <table style="width: 100%; margin-top: 10px;" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 50%; text-align: center; padding: 8px; background-color: #f8f9fa; border-right: 1px solid #ddd;">
                          <strong style="font-size: 12px; color: #666;">Quantity</strong><br>
                          <span style="font-size: 14px; font-weight: 600; color: #2c3315;">${item?.quantity || 1}</span>
                        </td>
                        <td style="width: 50%; text-align: center; padding: 8px; background-color: #f8f9fa;">
                          <strong style="font-size: 12px; color: #666;">Price</strong><br>
                          <span style="font-size: 14px; font-weight: 600; color: #2c3315;">₹${item?.price || 0}</span>
                        </td>
                      </tr>
                    </table>

                    ${item?.colors?.title ? `
                      <div style="margin-top: 12px; padding: 10px; background-color: #000000; border-radius: 6px; border: 1px solid #f8b2c1;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                          <strong style="font-size: 13px; color: #2c3315;">Color:</strong>
                          <span style="font-size: 13px; color: #2c3315; font-weight: 600;">${item.colors.title}</span>
                        </div>
                      </div>
                    ` : ''}
                  </td>
                </tr>
              </table>
            `).join('')}
          </div>


        ` : ''}

        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #2c3315;">
          <h4 style="margin: 0 0 15px 0; color: #2c3315; font-size: 16px;">📍 Shipping Address</h4>
          <div style="background-color: white; padding: 12px; border-radius: 4px; line-height: 1.6;">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #2c3315;">${order.addressInfo?.name || order.user?.userName || 'Customer'}</p>
            <p style="margin: 0 0 4px 0; color: #333;">${formatAddressForEmail(order.addressInfo?.address)}</p>
            ${order.addressInfo?.state ? `<p style="margin: 0 0 4px 0; color: #333;">${order.addressInfo.state}</p>` : ''}
            <p style="margin: 0 0 4px 0; color: #333;">${order.addressInfo?.city || 'N/A'} - ${order.addressInfo?.pincode || 'N/A'}</p>
            <p style="margin: 0 0 8px 0; color: #333;"><strong>Phone:</strong> ${order.addressInfo?.phone || 'N/A'}</p>
            ${order.addressInfo?.notes ? `<p style="margin: 8px 0 0 0; padding: 8px; background-color: #f8f9fa; border-radius: 3px; font-style: italic; color: #666; font-size: 14px;"><strong>Landmark:</strong> ${order.addressInfo.notes}</p>` : ''}
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/shop/account" style="display: inline-block; background-color: #000000; color: #2c3315; padding: 14px 28px; font-size: 16px; text-decoration: none; border-radius: 4px; font-weight: bold;"> View Your Order</a>
        </div>
      </div>
      <div style="background-color: #f7f7f7; padding: 12px; text-align: center; font-size: 12px; color: #777;">
        <p>If you have any questions, please contact our support team.</p>
      </div>
    </div>
  `;





    // Determine the recipient email using order.email or fallback to the user's profile.
    let recipientEmail = order.email;

    if (!recipientEmail) {
      // Try to find email from regular User first
      const user = await User.findById(order.userId);
      if (user) {
        recipientEmail = user.email;
      } else {
        // If not found in User, try IncognitoUser
        const incognitoUser = await IncognitoUser.findById(order.userId);
        if (incognitoUser) {
          recipientEmail = incognitoUser.email;
        }
      }
    }

    if (!recipientEmail) {
      console.error('No email found for order:', order._id);
      return res.status(400).json({
        success: false,
        message: "Unable to send confirmation email - no email address found"
      });
    }

    // Send confirmation email to customer
    await sendEmail({
      email: recipientEmail,
      subject: "Order Confirmation - Your Order is Confirmed",
      message,
    });

    // Send notification email to admin (Updated: Mobile-only layout)
    const adminEmail = "diabolicalxme@gmail.com";
    const adminMessage = `
    <div style="font-family: Arial, sans-serif; color: #2c3315; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #000000; padding: 20px; text-align: center; color: #2c3315;">
        <img src="https://res.cloudinary.com/dkqt39aad/image/upload/v1754300738/logo_pa0nq0.png" alt="Logo" style="max-width: 150px;">
        <h2 style="margin-bottom: 5px;">New Order Received!</h2>
        <p style="font-size: 16px; margin-top: 0;">A new order has been placed and payment confirmed.</p>
      </div>
      <div style="padding: 20px;">
        <h3 style="border-bottom: 2px solid #000000; padding-bottom: 10px;">Order Details</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Customer Email:</strong> ${recipientEmail}</p>
        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
        <p><strong>Payment Status:</strong> Paid</p>
        <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString("en-GB")}</p>

        ${order.cartItems && order.cartItems.length > 0 ? `
          <div style="margin-top: 20px;">
            <h4 style="margin-bottom: 15px; color: #2c3315;">Items Ordered:</h4>

            <!-- Card Layout (Mobile-First Design) -->
            <div style="display: block;">
              ${order.cartItems.map(item => `
                <table style="width: 100%; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 15px; background-color: #ffffff;" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 15px; text-align: center;">
                      <img src="${item?.colors?.image || item?.image || ''}" alt="${item?.title || ''}"
                        style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd; display: block; margin: 0 auto;">
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 15px 15px 15px; text-align: center;">
                      <h5 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #2c3315;">${item?.title || 'Product'}</h5>
                      ${item?.productCode ? `<p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">Code: ${item.productCode}</p>` : ''}

                      <table style="width: 100%; margin-top: 10px;" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 50%; text-align: center; padding: 8px; background-color: #f8f9fa; border-right: 1px solid #ddd;">
                            <strong style="font-size: 12px; color: #666;">Quantity</strong><br>
                            <span style="font-size: 14px; font-weight: 600; color: #2c3315;">${item?.quantity || 1}</span>
                          </td>
                          <td style="width: 50%; text-align: center; padding: 8px; background-color: #f8f9fa;">
                            <strong style="font-size: 12px; color: #666;">Price</strong><br>
                            <span style="font-size: 14px; font-weight: 600; color: #2c3315;">₹${item?.price || 0}</span>
                          </td>
                        </tr>
                      </table>

                      ${item?.colors?.title ? `
                        <div style="margin-top: 12px; padding: 10px; background-color: #000000; border-radius: 6px; border: 1px solid #f8b2c1;">
                          <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <strong style="font-size: 13px; color: #2c3315;">Color:</strong>
                            <span style="font-size: 13px; color: #2c3315; font-weight: 600;">${item.colors.title}</span>
                          </div>
                        </div>
                      ` : ''}
                    </td>
                  </tr>
                </table>
              `).join('')}
            </div>


          </div>
        ` : ''}

        <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
          <h4 style="margin: 0 0 15px 0; color: #856404; font-size: 16px;">👤 Customer & Shipping Information</h4>
          <div style="background-color: white; padding: 12px; border-radius: 4px;">
            <div style="margin-bottom: 15px;">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #2c3315; font-size: 15px;">${order.addressInfo?.name || order.user?.userName || 'Customer'}</p>
              <p style="margin: 0; color: #666; font-size: 14px;">${order.user?.email || recipientEmail || 'N/A'}</p>
            </div>
            <div style="border-top: 1px solid #eee; padding-top: 12px;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #2c3315;">📍 Delivery Address:</p>
              <div style="margin-left: 15px; line-height: 1.5;">
                ${order.addressInfo?.name ? `<p style="margin: 0 0 4px 0; color: #333; font-weight: 600;"><strong>👤 Name:</strong> ${order.addressInfo.name}</p>` : ''}
                <p style="margin: 0 0 4px 0; color: #333;">${formatAddressForEmail(order.addressInfo?.address)}</p>
                ${order.addressInfo?.state ? `<p style="margin: 0 0 4px 0; color: #333;">${order.addressInfo.state}</p>` : ''}
                <p style="margin: 0 0 4px 0; color: #333;">${order.addressInfo?.city || 'N/A'} - ${order.addressInfo?.pincode || 'N/A'}</p>
                <p style="margin: 0 0 8px 0; color: #333;"><strong>📞 Phone:</strong> ${order.addressInfo?.phone || 'N/A'}</p>
                ${order.addressInfo?.notes ? `<p style="margin: 8px 0 0 0; padding: 8px; background-color: #f8f9fa; border-radius: 3px; font-style: italic; color: #666; font-size: 13px;"><strong>� Landmark:</strong> ${order.addressInfo.notes}</p>` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style="background-color: #f7f7f7; padding: 12px; text-align: center; font-size: 12px; color: #777;">
        <p>Please process this order for fulfillment.</p>
      </div>
    </div>
    `;

    await sendEmail({
      email: adminEmail,
      subject: `New Order #${order._id.toString().slice(-8)} - ₹${order.totalAmount}`,
      message: adminMessage,
    });

    res.status(200).json({
      success: true,
      message: "Payment captured and immersive confirmation email sent successfully",
    });
  } catch (error) {
    console.error("Error capturing Razorpay payment:", error);
    res.status(500).json({
      success: false,
      message: "Payment capture failed",
    });
  }
};



const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    // If no orders found, return empty array instead of 404
    // This is normal for new users or incognito users who haven't placed orders yet
    res.status(200).json({
      success: true,
      data: orders, // Will be empty array if no orders found
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
