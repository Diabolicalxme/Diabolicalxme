import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import DeleteConfirmationModal from "@/components/common/delete-confirmation-modal";


function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);

  // Handle the Edit action by setting the current product in form data and opening the edit dialog
  const handleEdit = (e) => {
    // Prevent propagation to avoid interference with overlay behavior
    e.stopPropagation();
    setOpenCreateProductsDialog(true);
    setCurrentEditedId(product?._id);
    setFormData(product);
  };



  // Confirm deletion and close modal
  const confirmDelete = () => {
    handleDelete(product?._id);
    setModalOpen(false);
  };

  // For admin, clicking the image need not navigate elsewhere, so onClick is prevented.
  return (
    <Card className="w-full max-w-[320px] mx-auto shadow-lg rounded-lg overflow-hidden ">
      {/* Image container with overlay for admin action buttons */}
      <div className="relative group cursor-pointer overflow-hidden">
        <img
          src={product?.image[0]}
          alt={product?.title}
          className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-110"
        />

        {/* Dynamic Badges */}
        {product?.totalStock === 0 ? (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-sm py-1 px-2 rounded">
            Out Of Stock
          </Badge>
        ) : product?.totalStock < 10 ? (
          <Badge className="absolute top-2 left-2 bg-orange-500 text-white text-sm py-1 px-2 rounded">
            {`Only ${product?.totalStock} left`}
          </Badge>
        ) : product?.salePrice > 0 ? (
          <>

            {product?.isNewArrival && (
              <div className="absolute top-2 left-2 bg-rose-50 text-rose-700 text-sm py-1 px-2 rounded-full font-semibold">
                New Arrival
              </div>
            )}
            {product?.isFeatured && (
              <Badge className="absolute top-2 right-2 bg-green-50 text-green-700 text-sm py-1 px-2 rounded-full font-semibold">
                Featured
              </Badge>
            )}

          </>
        ) : null}

        {/* Overlay for admin action buttons */}
        <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black bg-opacity-40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Button
            variant="ghost"
            onClick={() => {
              setOpenCreateProductsDialog(true);
              setCurrentEditedId(product?._id);
              setFormData(product);
            }}
            className="text-white rounded bg-primary hover:bg-primary/80"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="ghost"
            onClick={() => setModalOpen(true)}
            className="text-white bg-red-600 rounded hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Product details area */}
      <CardContent className="p-4 bg-card text-card-foreground">
        <div className="flex justify-between gap-2 items-center mb-2">
        <h2 className="text-lg font-semibold text-card-foreground truncate">
          {product?.title}
        </h2>
        {product?.productCode && (
          <div className="bg-rose-50 text-rose-700 text-sm py-1 px-2 rounded-full font-semibold">
           Code: {product?.productCode}             </div>
        )}
        </div>
        <div className="flex justify-between items-center">
          <span className={`${product?.salePrice > 0 ? "line-through text-muted-foreground" : "text-card-foreground"} text-lg font-medium`}>
            ₹{product?.price}
          </span>
          {product?.salePrice > 0 && (
            <span className="text-lg font-semibold text-foreground">
              ₹{product?.salePrice}
            </span>
          )}
        </div>
      </CardContent>

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this product?"
      />
    </Card>
  );
}

export default AdminProductTile;