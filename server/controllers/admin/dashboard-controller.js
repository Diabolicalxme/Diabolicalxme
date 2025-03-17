const Product = require("../../models/Product");
const Order = require("../../models/Order");
const User = require("../../models/User");
const Category = require("../../models/Category");

const getDashboardSummary = async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();

    res.status(200).json({
      totalSales: totalSales[0]?.total || 0,
      totalOrders,
      totalProducts,
      totalUsers,
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ error: "Failed to fetch dashboard summary." });
  }
};

const getSalesChart = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const salesData = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$orderDate" },
            month: { $month: "$orderDate" },
          },
          totalSales: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const salesChart = Array.from({ length: 12 }, (_, i) => {
      const lastYearSales = salesData.find(
        (data) => data._id.year === currentYear - 1 && data._id.month === i + 1
      )?.totalSales || 0;
      const currentYearSales = salesData.find(
        (data) => data._id.year === currentYear && data._id.month === i + 1
      )?.totalSales || 0;

      return {
        month: new Date(0, i).toLocaleString("default", { month: "short" }),
        lastYearSales,
        currentYearSales,
      };
    });

    res.status(200).json(salesChart);
  } catch (error) {
    console.error("Error fetching sales chart:", error);
    res.status(500).json({ error: "Failed to fetch sales chart." });
  }
};

const getOrderStatus = async (req, res) => {
    try {
      // Predefined statuses
      const predefinedStatuses = [
        { id: "pending", label: "Pending" },
        { id: "inProcess", label: "In Process" },
        { id: "inShipping", label: "In Shipping" },
        { id: "delivered", label: "Delivered" },
        { id: "rejected", label: "Rejected" },
      ];
  
      // Fetch counts from the database
      const statusCounts = await Order.aggregate([
        { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
      ]);
  
      // Map counts to predefined statuses
      const orderStatus = predefinedStatuses.map((status) => {
        const foundStatus = statusCounts.find((s) => s._id === status.id);
        return {
          id: status.id,
          label: status.label,
          count: foundStatus ? foundStatus.count : 0, // Default count is 0 if not found
        };
      });
  
      res.status(200).json(orderStatus);
    } catch (error) {
      console.error("Error fetching order status:", error);
      res.status(500).json({ error: "Failed to fetch order status." });
    }
  };
  

const getStockStatus = async (req, res) => {
  try {
    const inStock = await Product.countDocuments({ totalStock: { $gt: 0 } });
    const outOfStock = await Product.countDocuments({ totalStock: { $lte: 0 } });

    res.status(200).json({ inStock, outOfStock });
  } catch (error) {
    console.error("Error fetching stock status:", error);
    res.status(500).json({ error: "Failed to fetch stock status." });
  }
};

const getCategoryProducts = async (req, res) => {
    try {
      // Group products by category (ObjectId)
      const categoryCounts = await Product.aggregate([
        {
          $group: {
            _id: "$category", // Group by category ID (ObjectId)
            count: { $sum: 1 },
          },
        },
      ]);
  
      // Fetch the corresponding category names for each unique category ID
      const categoryProducts = await Promise.all(
        categoryCounts.map(async (category) => {
          const categoryDoc = await Category.findById(category._id, "name");
          return {
            name: categoryDoc?.name || "Unknown", // Use "Unknown" if no matching category found
            count: category.count,
          };
        })
      );
  
      // Remove duplicates by category name
      const uniqueCategoryProducts = [];
      const seenCategories = new Set();
  
      categoryProducts.forEach((category) => {
        if (!seenCategories.has(category.name)) {
          seenCategories.add(category.name);
          uniqueCategoryProducts.push(category);
        }
      });
  
      res.status(200).json(uniqueCategoryProducts);
    } catch (error) {
      console.error("Error fetching category products:", error);
      res.status(500).json({ error: "Failed to fetch category products." });
    }
  };
  

module.exports = {
  getDashboardSummary,
  getSalesChart,
  getOrderStatus,
  getStockStatus,
  getCategoryProducts,
};
