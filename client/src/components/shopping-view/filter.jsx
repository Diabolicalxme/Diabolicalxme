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
    <div>
      {/* Mobile Filter Toggle */}
      <div
        className="md:hidden p-4 flex justify-between items-center border-b border-border"
        onClick={toggleDropdown}
      >
        <span className="text-sm uppercase tracking-wide font-medium">Filter Options</span>
        <button className="p-2">
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Filter options */}
      <div
        className={`space-y-6 ${
          isDropdownOpen ? "block" : "hidden md:block"
        }`}
      >
        {/* Dynamic Category Filter */}
        <div>
          <h3 className="text-base uppercase tracking-wide font-medium mb-3">Category</h3>
          <div className="w-8 h-0.5 bg-foreground mb-4"></div>
          <div className="space-y-2">
            {categoriesList.map((category) => (
              <Label
                className="flex items-center gap-2 text-sm hover:text-black cursor-pointer group"
                key={category._id}
              >
                <Checkbox
                  className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                  checked={
                    filters.category?.length > 0 &&
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

        <Separator className="bg-border" />

        {/* Static Price Filter */}
        <div>
          <h3 className="text-base uppercase tracking-wide font-medium mb-3">Price Range</h3>
          <div className="w-8 h-0.5 bg-foreground mb-4"></div>
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
                className="flex items-center gap-2 text-sm hover:text-black cursor-pointer group"
                key={option.id}
              >
                <Checkbox
                  className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                  checked={
                    filters.price?.length > 0 &&
                    filters.price.includes(option.id)
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
      </div>
    </div>
  );
}

export default ProductFilter;