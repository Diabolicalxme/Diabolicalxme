import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";
import Footer from "../common/footer";

function ShoppingLayout() {
  return (
    <div className="flex flex-col bg-background text-foreground overflow-hidden min-h-screen">
      {/* common header */}
      <ShoppingHeader />
      {/* Add padding-top to account for fixed header */}
      <main className="flex flex-col w-full pt-[104px] md:pt-[104px] flex-grow relative">
        <Outlet />
      </main>
      {/* Footer with higher z-index to ensure visibility */}
      <div className="relative z-20">
        <Footer />
      </div>
    </div>
  );
}

export default ShoppingLayout;
