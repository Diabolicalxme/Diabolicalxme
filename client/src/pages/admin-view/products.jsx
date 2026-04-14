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
import axios from "axios";

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
  const [newlyUploadedUrls, setNewlyUploadedUrls] = useState([]); // Track NEWLY uploaded images in this session
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState([]);
  const [imageDeletingStates, setImageDeletingStates] = useState([]);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
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
    
    setImageDeletingStates((prevStates) =>
      Array.isArray(prevStates)
        ? imageFiles.map((_, index) => prevStates[index] || false)
        : imageFiles.map(() => false)
    );
  }, [imageFiles]);

  // Helper to extract public_id from Cloudinary URL (duplicated from component for background cleanup)
  function getPublicIdFromUrl(url) {
    if (!url || typeof url !== 'string') return null;
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const pathParts = parts[1].split("/");
    const versionIndex = pathParts.findIndex(p => p.startsWith('v') && /^\d+$/.test(p.substring(1)));
    let publicIdWithExt;
    if (versionIndex !== -1) {
      publicIdWithExt = pathParts.slice(versionIndex + 1).join("/");
    } else {
      publicIdWithExt = pathParts[pathParts.length - 1];
    }
    return publicIdWithExt.split(".")[0];
  }

  // Callback to track images uploaded during this session
  const handleAddNewImageToSession = (url) => {
    setNewlyUploadedUrls(prev => {
      if (!prev.includes(url)) {
        return [...prev, url];
      }
      return prev;
    });
  };

  // Callback to remove image from session tracking (e.g. manually deleted during same session)
  const handleRemoveImageFromSession = (url) => {
    setNewlyUploadedUrls(prev => prev.filter(item => item !== url));
  };

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

  function validateForm() {
    const optionalFields = [
      "productCode",
      "isNewArrival",
      "isFeatured",
      "image",
      "salePrice",
      "secondTitle",
      "colors"
    ];

    const errors = {};
    Object.keys(formData).forEach((key) => {
      if (!["averageReview", ...optionalFields].includes(key)) {
        if (formData[key] === "" || formData[key] === null || formData[key] === undefined) {
          // Map internal field names to user-friendly labels
          const fieldLabels = {
            title: "Title",
            description: "Description",
            category: "Category",
            price: "Price",
            totalStock: "Total Stock"
          };
          errors[key] = `${fieldLabels[key] || key} is required`;
        }
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function onSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

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
          setNewlyUploadedUrls([]); // Reset tracking on success
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
          setNewlyUploadedUrls([]); // Reset tracking on success
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
    setFormErrors({});
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
      "secondTitle",
      "colors"
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
            setNewlyUploadedUrls([]);
            setImageFiles([]);
            setFormErrors({});
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
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            // Background cleanup of unsaved images
            if (newlyUploadedUrls.length > 0) {
              const imagesToDelete = newlyUploadedUrls.filter(url => 
                // Only delete it if it's still in the uploadedImageUrls list (meaning it wasn't saved yet)
                // Actually, if they close the dialog, we delete EVERYTHING they recently uploaded 
                // that hasn't been committed to a product.
                uploadedImageUrls.includes(url)
              );

              imagesToDelete.forEach(async (url) => {
                const publicId = getPublicIdFromUrl(url);
                if (publicId) {
                   try {
                     await axios.post(`${import.meta.env.VITE_BACKEND_URL}/admin/products/delete-image`, { publicId });
                   } catch(err) {
                     console.error("Background cleanup failed for", url);
                   }
                }
              });
            }

            setOpenCreateProductsDialog(false);
            setCurrentEditedId(null);
            setFormData(initialFormData);
            setUploadedImageUrls([]);
            setNewlyUploadedUrls([]);
            setImageFiles([]);
            setFormErrors({});
          }
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
            imageDeletingStates={imageDeletingStates}
            setImageDeletingStates={setImageDeletingStates}
            onImageUploaded={handleAddNewImageToSession}
            onImageRemoved={handleRemoveImageFromSession}
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
              isBtnDisabled={false}
              isBtnLoading={isLoading}
              formErrors={formErrors}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;