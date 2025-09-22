import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { Filter, X } from "lucide-react";
import { fetchCategories } from "@/store/shop/categories-slice";
import { createPortal } from "react-dom";

function FilterDrawer({ filters, setFilters, handleFilter }) {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const { categoriesList } = useSelector((state) => state.shopCategories);
  const filteredCategoryList = categoriesList.filter(category =>
    !['author', 'bravo', 'hector'].includes(category.name.trim().toLowerCase())
  );

  // Parse query parameters
  const [searchParams, setSearchParams] = useSearchParams();
  const drawerRef = useRef(null);

  // We'll use a ref to track if this is the first render
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Only update filters from URL on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;

      // Get the `category` query parameter
      const queryCategory = searchParams.get("category");
      if (queryCategory) {
        // Update the filters state with the category ID from the query
        setFilters((prevFilters) => ({
          ...prevFilters,
          category: [queryCategory],
        }));
      }
    }
  }, [searchParams, setFilters]);

  // Toggle drawer
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  // Close drawer
  const closeDrawer = () => {
    setIsOpen(false);
  };

  // Updated handleSingleCategoryFilter for proper removal of the key
  const handleSingleCategoryFilter = (categoryId) => {
    // Ensure filters is an object
    const safeFilters = filters || {};

    const isSameCategorySelected =
      safeFilters.category?.length === 1 && safeFilters.category[0] === categoryId;

    let updatedFilters;
    if (isSameCategorySelected) {
      // Remove the category filter key if the same category is selected
      updatedFilters = { ...safeFilters };
      delete updatedFilters.category;
    } else {
      updatedFilters = { ...safeFilters, category: [categoryId] };
    }
    setFilters(updatedFilters);

    // Update query parameters
    const newQueryParams = new URLSearchParams(searchParams);
    if (isSameCategorySelected) {
      newQueryParams.delete("category");
    } else {
      newQueryParams.set("category", categoryId);
    }
    setSearchParams(newQueryParams);
  };

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && isOpen) {
        closeDrawer();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen]);

  // Get active filter count - ensure filters is an object
  const activeFilterCount = filters ? Object.keys(filters).reduce((count, key) => {
    return count + (filters[key]?.length || 0);
  }, 0) : 0;

  return (
    <>
      {/* Fixed Filter Button */}
      <button
        onClick={toggleDrawer}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[9999] flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-full shadow-lg hover:bg-foreground/90 transition-all duration-300 border border-foreground/10"
      >
        <Filter size={16} />
        <span className="font-medium tracking-wide">Filters</span>
        {activeFilterCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-bold bg-primary text-primary-foreground rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Drawer Portal */}
      {createPortal(
        <>
          {/* Overlay */}
          <div
            className={`fixed inset-0 z-50 bg-black/80 transition-opacity duration-300 ${
              isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <div
            ref={drawerRef}
            className={`fixed bottom-0 z-50 max-h-[80vh] bg-background text-foreground shadow-lg transform transition-all duration-300 ease-in-out overflow-y-auto rounded-t-xl ${
              isOpen ? "translate-y-0" : "translate-y-full"
            } w-full md:w-[600px] md:left-1/2 md:-translate-x-1/2 lg:w-[800px]`}
          >
            {/* Header */}
            <div className="sticky top-0 bg-background z-10 flex justify-between items-center p-4 md:p-6 border-b">
              <h2 className="text-xl md:text-2xl font-light uppercase tracking-wide">Filters</h2>
              <button
                onClick={closeDrawer}
                className="p-2 rounded-full hover:bg-muted/50 transition-colors"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter Content */}
            <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
              {/* Dynamic Category Filter */}
              <div>
                <h3 className="text-lg uppercase tracking-wide font-medium mb-2">Category</h3>
                <div className="w-8 h-0.5 bg-primary mb-4"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {filteredCategoryList.map((category) => (
                    <Label
                      className="flex items-center gap-2 text-base cursor-pointer group p-2 hover:bg-muted/30 rounded-md transition-colors"
                      key={category._id}
                    >
                      <Checkbox
                        className="border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        checked={
                          filters && filters.category?.length > 0 &&
                          filters.category[0] === category._id
                        }
                        onCheckedChange={() =>
                          handleSingleCategoryFilter(category._id)
                        }
                      />
                      <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                        {category.name}
                      </span>
                    </Label>
                  ))}
                </div>
              </div>

              <Separator className="bg-muted" />

              {/* Static Price Filter */}
              <div>
                <h3 className="text-lg uppercase tracking-wide font-medium mb-2">Price Range</h3>
                <div className="w-8 h-0.5 bg-primary mb-4"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {[
                    { id: "0-1000", label: "₹0 - ₹1,000" },
                    { id: "1000-2000", label: "₹1,000 - ₹2,000" },
                    { id: "2000-3000", label: "₹2,000 - ₹3,000" },
                    { id: "3000-4000", label: "₹3,000 - ₹4,000" },
                    { id: "4000-5000", label: "₹4,000 - ₹5,000" },
                    { id: "5000-6000", label: "₹5,000 - ₹6,000" },
                    { id: "6000-", label: "₹6,000 and above" }
                  ].map((option) => (
                    <Label
                      className="flex items-center gap-2 text-base cursor-pointer group p-2 hover:bg-muted/30 rounded-md transition-colors"
                      key={option.id}
                    >
                      <Checkbox
                        className="border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        checked={
                          filters && filters.price?.length > 0 &&
                          filters.price?.includes(option.id)
                        }
                        onCheckedChange={() => handleFilter("price", option.id)}
                      />
                      <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                        {option.label}
                      </span>
                    </Label>
                  ))}
                </div>
              </div>

              {/* Apply Button */}
              <div className="sticky bottom-0 bg-background pt-2 pb-6 mt-4">
                <button
                  onClick={closeDrawer}
                  className="w-full md:w-auto md:min-w-[200px] md:mx-auto md:block px-6 py-3 bg-foreground text-background hover:bg-foreground/90 transition-colors duration-300 uppercase tracking-wider text-sm font-medium rounded-md"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

export default FilterDrawer;
