import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { ChevronDown } from "lucide-react";
import { fetchCategories } from "@/store/shop/categories-slice";

function ProductFilter({ filters, setFilters, handleFilter }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to toggle dropdown visibility
  const dispatch = useDispatch();
  const { categoriesList } = useSelector((state) => state.shopCategories);
  const filteredCategoryList = categoriesList.filter(category =>
    !['author', 'bravo', 'hector'].includes(category.name.trim().toLowerCase())
  );
  // Parse query parameters
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Fetch categories on mount
    dispatch(fetchCategories());
    // Get the `category` query parameter
    const queryCategory = searchParams.get("category");
    if (queryCategory) {
      // Update the filters state with the category ID from the query
      setFilters((prevFilters) => ({
        ...prevFilters,
        category: [queryCategory],
      }));
    }
  }, [dispatch, searchParams, setFilters]);

  // Toggle dropdown on mobile
  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  // Updated handleSingleCategoryFilter for proper removal of the key
  const handleSingleCategoryFilter = (categoryId) => {
    const isSameCategorySelected =
      filters.category?.length === 1 && filters.category[0] === categoryId;

    let updatedFilters;
    if (isSameCategorySelected) {
      // Remove the category filter key if the same category is selected
      updatedFilters = { ...filters };
      delete updatedFilters.category;
    } else {
      updatedFilters = { ...filters, category: [categoryId] };
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

  return (
    <div className="p-3 border border-input rounded-md shadow-sm mb-4 md:mb-0 md:p-0 md:border-none relative">
      {/* Filter Toggle - Mobile View */}
      <div
        className="flex justify-between items-start cursor-pointer"
        onClick={toggleDropdown}
      >
        <div>
          <h2 className="text-xl font-light uppercase tracking-wide mb-2">Filters</h2>
          <div className="w-12 h-0.5 bg-primary mb-1"></div>
        </div>
        <button className="p-2">
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Filter Toggle - Desktop View */}
   {/*    <div
        className="hidden md:flex items-center justify-between cursor-pointer px-4 py-2 border border-input rounded-md hover:bg-muted/30 transition-colors"
        onClick={toggleDropdown}
      >
        <span className="text-sm">Filter</span>
        <ChevronDown
          size={16}
          className={`ml-2 transition-transform duration-300 ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </div> */}

      {/* Filter options */}
      <div
        className={`space-y-4 max-h-[70vh] overflow-y-auto pr-2 ${
          isDropdownOpen ? "block" : "hidden"
        } md:absolute md:top-full md:left-0 md:mt-2 md:border md:border-input md:rounded-md md:shadow-lg md:p-4 md:w-64 md:z-[10] text-foreground`}
      >
        {/* Dynamic Category Filter */}
        <div className="mt-4 md:mt-0 border-t border-input">
          <h3 className="text-lg md:text-sm uppercase tracking-wide font-medium my-2">Category</h3>
          <div className="w-8 h-0.5 bg-primary mb-4 md:mb-2"></div>
          <div className="space-y-2">
            {filteredCategoryList.map((category) => (
              <Label
                className="flex items-center gap-2 text-base md:text-sm cursor-pointer group"
                key={category._id}
              >
                <Checkbox
                  className="border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  checked={
                    filters.category?.length > 0 &&
                    filters.category[0] === category._id
                  }
                  onCheckedChange={() =>
                    handleSingleCategoryFilter(category._id)
                  }
                />
                <span className="group-hover:translate-x-0.5 transition-transform duration-200 group-hover:text-gray-100">
                  {category.name}
                </span>
              </Label>
            ))}
          </div>
        </div>

        <Separator className="bg-muted" />

        {/* Static Price Filter */}
        <div>
          <h3 className="text-lg md:text-sm uppercase tracking-wide font-medium mb-2">Price Range</h3>
          <div className="w-8 h-0.5 bg-primary mb-4"></div>
          <div className="space-y-2">
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
                className="flex items-center gap-2 text-base md:text-sm cursor-pointer group"
                key={option.id}
              >
                <Checkbox
                  className="border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  checked={
                    filters.price?.length > 0 &&
                    filters.price.includes(option.id)
                  }
                  onCheckedChange={() => handleFilter("price", option.id)}
                />
                <span className="group-hover:translate-x-0.5 transition-transform duration-200 group-hover:text-gray-100">
                  {option.label}
                </span>
              </Label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductFilter;