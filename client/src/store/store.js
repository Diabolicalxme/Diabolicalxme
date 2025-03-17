import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import adminProductsSlice from "./admin/products-slice";
import adminCategoriesSlice from "./admin/categories-slice";
import adminBannersSlice from "./admin/banners-slice";
import adminInstaFeedSlice from "./admin/instafeed-slice";
import adminFeedbackSlice from "./admin/feedback-slice";
import adminOrderSlice from "./admin/order-slice";
import adminDashboardSlice from "./admin/dashboard-slice";
import adminUsersSlice from "./admin/users-slice";
import adminProductReviewSlice from "./admin/reviews-slice";
import adminContactSlice from "./admin/contact-slice";
import adminNewsLetter from "./admin/newsletter-slice";


import shopProductsSlice from "./shop/products-slice";
import shoppingCategoriesSlice from "./shop/categories-slice";
import shoppingBannersSlice from "./shop/banners-slice";
import shoppingInstaFeedSlice from "./shop/instafeed-slice";
import shopFeedbackSlice from "./shop/feedback-slice";
import shopCartSlice from "./shop/cart-slice";
import shopAddressSlice from "./shop/address-slice";
import shopOrderSlice from "./shop/order-slice";
import shopSearchSlice from "./shop/search-slice";
import shopReviewSlice from "./shop/review-slice";
import shopContactSlice from "./shop/contact-slice";
import shopNewsLetterSlice from "./shop/newsletter-slice";
import themeReducer from "./theme-slice";


const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,

    adminProducts: adminProductsSlice,
    adminCategories: adminCategoriesSlice,
    adminBanners: adminBannersSlice,
    adminInstaFeed: adminInstaFeedSlice,
    adminFeedback: adminFeedbackSlice,
    adminOrder: adminOrderSlice,
    adminDashboard: adminDashboardSlice,
    adminUsers: adminUsersSlice,
    adminProductReview: adminProductReviewSlice,
    adminContact: adminContactSlice,
    adminNewsLetter: adminNewsLetter,

    shopProducts: shopProductsSlice,
    shopCategories: shoppingCategoriesSlice,
    shopBanners: shoppingBannersSlice,
    shopInstaFeed: shoppingInstaFeedSlice,
    shopFeedback: shopFeedbackSlice,
    shopCart: shopCartSlice,
    shopAddress: shopAddressSlice,
    shopOrder: shopOrderSlice,
    shopSearch: shopSearchSlice,
    shopReview: shopReviewSlice,
    shopContact: shopContactSlice ,
    shopNewsLetter: shopNewsLetterSlice
  },
});

export default store;
