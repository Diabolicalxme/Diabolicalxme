const express = require("express");
const {
  getDashboardSummary,
  getSalesChart,
  getOrderStatus,
  getStockStatus,
  getCategoryProducts,
} = require("../../controllers/admin/dashboard-controller");

const router = express.Router();

router.get("/summary", getDashboardSummary);
router.get("/sales-chart", getSalesChart);
router.get("/order-status", getOrderStatus);
router.get("/stock-status", getStockStatus);
router.get("/category-products", getCategoryProducts);

module.exports = router;
