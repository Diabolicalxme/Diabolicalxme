import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";
import Footer from "../common/footer";

function ShoppingLayout() {
  return (
    <div className="flex flex-col bg-background text-foreground overflow-hidden min-h-screen">
      {/* common header */}
      <ShoppingHeader />
      {/* Add padding-top to account for fixed header */}
      <main className="flex flex-col w-full pt-6 flex-grow relative">
        <Outlet />
      </main>
      {/* Footer with higher z-index to ensure visibility */}
      <div className="relative z-0">
        <Footer />
      </div>
    </div>
  );
}

export default ShoppingLayout;
