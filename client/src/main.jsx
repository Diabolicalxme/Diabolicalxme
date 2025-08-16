import React from "react";
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

// Comprehensive React polyfill for Radix UI components
if (typeof window !== 'undefined') {
  window.React = React;
  // Ensure all React hooks are available globally
  window.React.useLayoutEffect = React.useLayoutEffect;
  window.React.useEffect = React.useEffect;
  window.React.useState = React.useState;
  window.React.useRef = React.useRef;
  window.React.useCallback = React.useCallback;
  window.React.useMemo = React.useMemo;
  window.React.useContext = React.useContext;
  window.React.useReducer = React.useReducer;
  window.React.useImperativeHandle = React.useImperativeHandle;
}

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
