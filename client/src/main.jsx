import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store.js";
import ScrollToTop from "./components/common/scroll-to-top.jsx";
import { Toaster } from "./components/ui/toaster.jsx";
import { HelmetProvider } from "react-helmet-async";
import ThemeProvider from "./components/theme/theme-provider.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <ThemeProvider>
        <HelmetProvider>
          <ScrollToTop />
          <App />
          <Toaster />
        </HelmetProvider>
      </ThemeProvider>
    </Provider>
  </BrowserRouter>
);
