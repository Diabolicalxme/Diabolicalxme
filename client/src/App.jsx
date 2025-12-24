import { Route, Routes, Navigate } from "react-router-dom";
import AuthLayout from "./components/auth/layout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import RegisterIncognitoUser from "./pages/auth/register-incognito";
import AdminLayout from "./components/admin-view/layout";
import AdminDashboard from "./pages/admin-view/dashboard";
import AdminProducts from "./pages/admin-view/products";
import AdminOrders from "./pages/admin-view/orders";
import AdminFeatures from "./pages/admin-view/features";
import ShoppingLayout from "./components/shopping-view/layout";
import NotFound from "./pages/not-found";
import ShoppingHome from "./pages/shopping-view/home";
import ShoppingListing from "./pages/shopping-view/listing";
import ShoppingCheckout from "./pages/shopping-view/checkout";
import ShoppingAccount from "./pages/shopping-view/account";
import CheckAuth from "./components/common/check-auth";
import UnauthPage from "./pages/unauth-page";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { checkAuth, refreshToken } from "./store/auth-slice";
import PaypalReturnPage from "./pages/shopping-view/paypal-return";
import PaymentSuccessPage from "./pages/shopping-view/payment-success";
import ProductDetailsPage from "./pages/shopping-view/product-details-page";
import SearchProducts from "./pages/shopping-view/search";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import NewArrivals from "./pages/shopping-view/new-arrivals";
import Contact from "./pages/shopping-view/contact";
import AdminCategories from "./pages/admin-view/categories";
import AdminBanners from "./pages/admin-view/banner";
import AdminInstafeed from "./pages/admin-view/instafeed";
import AdminFeedback from "./pages/admin-view/feedback";
import AuthForgotPassword from "./pages/auth/forgot-password";
import AuthResetPassword from "./pages/auth/reset-password";
import { Loader } from "./components/ui/loader";
import AdminUsers from "./pages/admin-view/users";
import AdminProductReview from "./pages/admin-view/review";
import AdminContact from "./pages/admin-view/contact";
import AdminNewsLetter from "./pages/admin-view/newsletter";
import { getTempCartItems, copyTempCartToUser } from "./utils/tempCartManager";
import { addToCart } from "./store/shop/cart-slice";
import { startCartCopy, completeCartCopy, hasCartCopyCompleted, resetCartCopyState } from "./utils/cartCopyManager";



function App() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      try {
        // Attempt to validate the token
        await dispatch(checkAuth()).unwrap();
      } catch (error) {
        if (error === "No access token found" || error?.status === 401) {
          // Attempt to refresh the token if expired or not found
          try {
            await dispatch(refreshToken()).unwrap();
            await dispatch(checkAuth()).unwrap(); // Retry after refreshing
          } catch (refreshError) {
            console.error("Failed to refresh token:", refreshError);
          }
        } else {
          console.error("Authentication failed:", error);
        }
      } finally {
        setIsBootstrapping(false);
      }
    };

    validateToken();
  }, [dispatch]);

  if (isBootstrapping) return <Loader />;

  return (
    <div className="flex flex-col overflow-hidden">
      <Routes>
        {/* Base Route */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? user?.role === "admin"
                ? <Navigate to="/admin/dashboard" />
                : <Navigate to="/shop/home" />
              : <Navigate to="/shop/home" />
          }
        />

        {/* Auth Routes */}
        <Route
          path="/auth"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AuthLayout />
            </CheckAuth>
          }
        >
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
          <Route path="register-incognito" element={<RegisterIncognitoUser />} />
          <Route path="forgot-password" element={<AuthForgotPassword />} />
          <Route path="reset-password" element={<AuthResetPassword />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AdminLayout />
            </CheckAuth>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="instafeed" element={<AdminInstafeed />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="features" element={<AdminFeatures />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reviews" element={<AdminProductReview />} />
          <Route path="contacts" element={<AdminContact />} />
          <Route path="newsletters" element={<AdminNewsLetter />} />



        </Route>

        {/* Shop Routes */}
        <Route
          path="/shop"
          element={
            <ShoppingLayout />
          }
        >
          <Route path="home" element={<ShoppingHome />} />
          <Route path="details/:id" element={<ProductDetailsPage />} />
          <Route path="collections" element={<ShoppingListing />} />
          <Route path="new-arrivals" element={<NewArrivals />} />
          <Route path="checkout" element={<ShoppingCheckout />} />
          <Route path="account" element={<ShoppingAccount />} />
          <Route path="paypal-return" element={<PaypalReturnPage />} />
          <Route path="payment-success" element={<PaymentSuccessPage />} />
          <Route path="search" element={<SearchProducts />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Unauthenticated and Not Found Pages */}
        <Route path="/unauth-page" element={<UnauthPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}



export default App;
