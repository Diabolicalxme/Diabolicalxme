import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchCategories } from "@/store/shop/categories-slice";
import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements } from "@/config";
import { addNewProduct, deleteProduct, editProduct, fetchAllProducts } from "@/store/admin/products-slice";

// Updated initial form data with new fields
const initialFormData = {
  image: "",
  title: "",
  secondTitle: "",
  productCode: "",
  description: "",
  category: "",
  isNewArrival: false,
  isFeatured: false,
  price: "",
  salePrice: "",
  totalStock: "",
  averageReview: 0,
  colors: [],
  // isWatchAndBuy: false,
  // video: ""
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState([]);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const { productList, isLoading } = useSelector((state) => state.adminProducts);
  const { categoriesList } = useSelector((state) => state.shopCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("all");

  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchAllProducts());
  }, [dispatch]);

  useEffect(() => {
    setImageLoadingStates((prevStates) =>
      Array.isArray(prevStates)
        ? imageFiles.map((_, index) => prevStates[index] || false)
        : imageFiles.map(() => false)
    );
  }, [imageFiles]);

  // Extend the form elements to include colors if not already provided.
  const dynamicAddProductFormElements = addProductFormElements.map((element) =>
    element.name === "category"
      ? {
          ...element,
          options: categoriesList.map((category) => ({
            id: category._id,
            label: category.name,
          })),
        }
      : element
  );

  // If colors field is not part of the configuration, add it.
  if (!dynamicAddProductFormElements.find((el) => el.name === "colors")) {
    dynamicAddProductFormElements.push({
      name: "colors",
      label: "Colors",
      componentType: "colors"
    });
  }

  // If isWatchAndBuy toggle field is not present, add it.
  // if (!dynamicAddProductFormElements.find((el) => el.name === "isWatchAndBuy")) {
  //   dynamicAddProductFormElements.push({
  //     name: "isWatchAndBuy",
  //     label: "Watch & Buy",
  //     componentType: "toggle"
  //   });
  // }

  // If video field is not present, add it.
  // if (!dynamicAddProductFormElements.find((el) => el.name === "video")) {
  //   dynamicAddProductFormElements.push({
  //     name: "video",
  //     label: "Video",
  //     componentType: "video"
  //   });
  // }

  function onSubmit(event) {
    event.preventDefault();
    const updatedFormData = {
      ...formData,
      image: uploadedImageUrls.length > 0 ? uploadedImageUrls : formData.image,
    };

    if (currentEditedId !== null) {
      dispatch(editProduct({ id: currentEditedId, formData: updatedFormData })).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts());
          setFormData(initialFormData);
          setUploadedImageUrls([]);
          setImageFiles([]);
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          toast({
            title: "Product updated successfully",
          });
        }
      });
    } else {
      dispatch(addNewProduct(updatedFormData)).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts());
          setOpenCreateProductsDialog(false);
          setImageFiles([]);
          setUploadedImageUrls([]);
          setFormData(initialFormData);
          toast({
            title: "Product added successfully",
          });
        }
      });
    }
  }

  function handleDelete(productId) {
    dispatch(deleteProduct(productId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
      }
    });
  }

  function handleEdit(product) {
    setCurrentEditedId(product._id);
    setFormData({
      image: product.image,
      title: product.title,
      secondTitle: product.secondTitle || "",
      productCode: product.productCode || "",
      description: product.description,
      category: product.category,
      isNewArrival: product.isNewArrival,
      isFeatured: product.isFeatured,
      price: product.price,
      salePrice: product.salePrice || "",
      totalStock: product.totalStock,
      averageReview: product.averageReview || 0,
      colors: product.colors || [],
      // isWatchAndBuy: product.isWatchAndBuy,
      // video: product.video || ""
    });
    setUploadedImageUrls(product.image || []);
    setOpenCreateProductsDialog(true);
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  function isFormValid() {
    const optionalFields = [
      "productCode",
      "isNewArrival",
      "isFeatured",
      // "isWatchAndBuy",
      // "video",
      "image",
      "salePrice",
      "secondTitle"
    ];

    if (imageLoadingStates?.includes(true)) return false;

    return Object.keys(formData)
      .filter((key) => !["averageReview", ...optionalFields].includes(key))
      .map((key) => formData[key] !== "")
      .every((item) => item);
  }

  // Handle filter change
  const handleFilterChange = (value) => {
    setFilterOption(value);
  };

  // Filter the productList based on the search query and filter option
  const filteredProductList = productList.filter((productItem) => {
    // First apply search filter
    const matchesSearch = !searchQuery ||
      productItem.title.toLowerCase().includes(searchQuery.toLowerCase());

    // Then apply category filter
    let matchesFilter = true;
    if (filterOption !== "all") {
      switch (filterOption) {
        case "newArrivals":
          matchesFilter = productItem.isNewArrival === true;
          break;
        case "featured":
          matchesFilter = productItem.isFeatured === true;
          break;
        case "outOfStock":
          matchesFilter = productItem.totalStock <= 0;
          break;
        default:
          matchesFilter = true;
      }
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <Fragment>
       <h1 className="mb-4 text-2xl font-semibold leading-none tracking-tight">All Products</h1>


      <div className="mb-4 flex items-center justify-between w-full">
        <div className="flex items-center gap-3 w-2/3">
          <div className="w-1/2">
            <input
              type="text"
              placeholder="Search by product name..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full border rounded-md p-2"
            />
          </div>
          <div className="w-1/2">
            <Select value={filterOption} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full border rounded-md">
                <SelectValue placeholder="Filter products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="newArrivals">New Arrivals</SelectItem>
                <SelectItem value="featured">Featured Products</SelectItem>
                <SelectItem value="outOfStock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          className="bg-primary hover:bg-accent"
          onClick={() => {
            setFormData(initialFormData);
            setUploadedImageUrls([]);
            setImageFiles([]);
            setOpenCreateProductsDialog(true);
          }}
        >
          Add New Product
        </Button>
      </div>


        {isLoading ? (
      <div className="flex items-center justify-center w-full mt-16 mb-1">

        <span className="text-lg whitespace-nowrap px-2">Loading products...</span>

      </div>
    ) : (
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {filteredProductList && filteredProductList.length > 0
          ? filteredProductList.map((productItem) => (
              <AdminProductTile
                key={productItem._id}
                setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                setCurrentEditedId={setCurrentEditedId}
                product={productItem}
                setFormData={() => handleEdit(productItem)}
                handleDelete={handleDelete}
              />
            ))
          : <p className="text-center col-span-full">No products found.</p>}
      </div>
      )}

      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setFormData(initialFormData);
          setUploadedImageUrls([]);
          setImageFiles([]);
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            imageFiles={imageFiles}
            setImageFiles={setImageFiles}
            uploadedImageUrls={uploadedImageUrls}
            setUploadedImageUrls={setUploadedImageUrls}
            imageLoadingState={imageLoadingState}
            imageLoadingStates={imageLoadingStates}
            setImageLoadingStates={setImageLoadingStates}
            setImageLoadingState={setImageLoadingState}
            isSingleImage={false}
          />
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              formControls={dynamicAddProductFormElements}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;