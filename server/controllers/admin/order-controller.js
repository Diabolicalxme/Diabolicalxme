const Order = require("../../models/Order");
const User = require("../../models/User");
const sendEmail = require("../../helpers/send-email");
const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const orders = await Order.find({});

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    // Retrieve user info from order's userId.
    const user = await User.findById(order.userId);

    // Append user's name and email if available.
    const orderData = {
      ...order._doc, // assuming Mongoose document structure
      user: user ? { name: user.userName, email: user.email } : null,
    };

    res.status(200).json({
      success: true,
      data: orderData,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, trackingNumber } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    // Update order with new status and tracking number (if provided)
    const updateData = { orderStatus };
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    await Order.findByIdAndUpdate(id, updateData);

    // Send shipping email if order status is changed to "inShipping" and tracking number is provided
    if (orderStatus === "inShipping" && trackingNumber) {
      await sendShippingEmail(order, trackingNumber);
    }

    res.status(200).json({
      success: true,
      message: "Order status is updated successfully!",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

// Function to send shipping notification email
const sendShippingEmail = async (order, trackingNumber) => {
  try {
    // Get user email
    const user = await User.findById(order.userId);
    const recipientEmail = user?.email;

    if (!recipientEmail) {
      console.error("No email found for user:", order.userId);
      return;
    }

    // Format order items for email
    const orderItemsHtml = order.cartItems.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 8px; text-align: left;">
          <div style="display: flex; align-items: center;">
            <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 12px;">
            <div>
              <p style="margin: 0; font-weight: 500; color: #2c3315;">${item.title}</p>
              ${item.colors ? `<p style="margin: 2px 0 0 0; font-size: 12px; color: #666;">Color: ${item.colors.title}</p>` : ''}
            </div>
          </div>
        </td>
        <td style="padding: 12px 8px; text-align: center; color: #2c3315;">×${item.quantity}</td>
        <td style="padding: 12px 8px; text-align: right; color: #2c3315; font-weight: 500;">₹${item.price}</td>
      </tr>
    `).join('');

    // Professional shipping email template
    const message = `
    <div style="font-family: Arial, sans-serif; color: #2c3315; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #eeeeee; padding: 20px; text-align: center; color: #2c3315;">
        <img src="https://res.cloudinary.com/dkqt39aad/image/upload/v1754300738/logo_pa0nq0.png" alt="DiabolicalXme Logo" style="max-width: 150px; margin-bottom: 10px;">
        <h2 style="margin-bottom: 5px;">📦 Your Order is On Its Way!</h2>
        <p style="font-size: 16px; margin-top: 0;">Great news! Your order has been shipped.</p>
      </div>

      <div style="padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #eeeeee;">
          <h3 style="margin: 0 0 10px 0; color: #2c3315;">📋 Tracking Information</h3>
          <p style="margin: 5px 0; font-size: 14px; color: #666;">Order ID: <strong style="color: #2c3315;">${order._id.toString()}</strong></p>
          <p style="margin: 5px 0; font-size: 14px; color: #666;">Tracking Number: <strong style="color: #2c3315; font-size: 16px; background-color: #fff; padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd;">${trackingNumber}</strong></p>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #888;">Please save this tracking number for your records.</p>
        </div>

        <h3 style="border-bottom: 2px solid #eeeeee; padding-bottom: 10px; margin-bottom: 15px;">📦 Shipped Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #eeeeee; color: #2c3315;">Item</th>
              <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #eeeeee; color: #2c3315;">Qty</th>
              <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #eeeeee; color: #2c3315;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${orderItemsHtml}
          </tbody>
        </table>

        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #2c3315;">🚚 Shipping Details</h3>
          <p style="margin: 5px 0; font-size: 14px; color: #666;"><strong>Delivery Address:</strong></p>
          <p style="margin: 5px 0; font-size: 14px; color: #2c3315; line-height: 1.4;">
            ${order.addressInfo.address}<br>
            ${order.addressInfo.city}, ${order.addressInfo.pincode}<br>
            Phone: ${order.addressInfo.phone}
          </p>
        </div>

        <div style="background-color: #e8f5e8; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #28a745;">
          <h3 style="margin: 0 0 10px 0; color: #155724;">📱 Track Your Package</h3>
          <p style="margin: 5px 0; font-size: 14px; color: #155724;">
            You can track your package using the tracking number provided above. Most courier services provide real-time tracking updates.
          </p>
          <p style="margin: 5px 0; font-size: 12px; color: #6c757d;">
            Estimated delivery: 3-7 business days from shipping date
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/shop/account" style="display: inline-block; background-color: #eeeeee; color: #2c3315; padding: 14px 28px; font-size: 16px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-right: 10px;">View Order Details</a>
        </div>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="font-size: 14px; color: #666; margin: 5px 0;">
            <strong>Need Help?</strong> If you have any questions about your order or tracking, please contact our support team.
          </p>
          <p style="font-size: 12px; color: #888; margin: 5px 0;">
            📧 Email: diabolicalxme@gmail.com
          </p>
        </div>
      </div>

      <div style="background-color: #f7f7f7; padding: 12px; text-align: center; font-size: 12px; color: #777;">
        <p style="margin: 0;">Thank you for choosing DiabolicalXme! We appreciate your business.</p>
      </div>
    </div>
    `;

    await sendEmail({
      email: recipientEmail,
      subject: `📦 Your Order #${order._id.toString().slice(-8)} Has Been Shipped - Tracking: ${trackingNumber}`,
      message,
    });

    console.log(`Shipping email sent successfully to ${recipientEmail}`);
  } catch (error) {
    console.error("Error sending shipping email:", error);
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};
