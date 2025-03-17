require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors"); 
const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminCategoryRouter = require("./routes/admin/category-routes");
const adminBannerRouter = require("./routes/admin/banner-routes");
const adminInstaFeedRouter = require("./routes/admin/instafeed-routes");
const adminFeedbackRouter = require("./routes/admin/feedback-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const adminDashboardRouter = require("./routes/admin/dashboard-routes");
const adminUserRouter = require("./routes/admin/user-routes");
const adminProductReviewRouter = require("./routes/admin/product-review-routes");
const adminContactRouter = require("./routes/admin/contact-routes");
const adminNewsLetter = require("./routes/admin/newsletter-routes");
 
const shopProductsRouter = require("./routes/shop/products-routes");
const shopCategoriesRouter = require("./routes/shop/categories-routes");
const shopBannersRouter = require("./routes/shop/banner-routes");
const shopInstafeedRouter = require("./routes/shop/instafeed-routes");
const shopFeedbackRouter = require("./routes/shop/feedback-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const shopContactRouter = require("./routes/shop/contact-routes");
const shopNewsLetter = require("./routes/shop/newsletter-routes");


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error)); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173", "https://rachana-boutique-chennai.web.app", "https://rachanaboutique.in"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/banners", adminBannerRouter);
app.use("/api/admin/categories", adminCategoryRouter);
app.use("/api/admin/instafeed", adminInstaFeedRouter);
app.use("/api/admin/feedback", adminFeedbackRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/admin/dashboard", adminDashboardRouter);
app.use("/api/admin/users", adminUserRouter);
app.use("/api/admin/product-reviews", adminProductReviewRouter);
app.use("/api/admin/contacts", adminContactRouter);
app.use("/api/admin/newsletter", adminNewsLetter);

app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/categories", shopCategoriesRouter);
app.use("/api/shop/banners", shopBannersRouter);
app.use("/api/shop/instafeed", shopInstafeedRouter);
app.use("/api/shop/feedback", shopFeedbackRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/shop/contacts", shopContactRouter);
app.use("/api/shop/newsletter", shopNewsLetter);


app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));
