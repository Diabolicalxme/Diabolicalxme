import React, { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import DeleteConfirmationModal from "@/components/common/delete-confirmation-modal";

function AdminCategoryTile({
  category,
  setFormData,
  setOpenCreateCategoriesDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  const [isModalOpen, setModalOpen] = useState(false);

  // Handle the Edit action
  const handleEdit = (e) => {
    e.stopPropagation();
    setOpenCreateCategoriesDialog(true);
    setCurrentEditedId(category?._id);
    setFormData({
      name: category?.name,
      description: category?.description,
      image: category?.image,
    });
  };

  // Handle Delete action
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setModalOpen(true);
  };

  // Confirm deletion
  const confirmDelete = () => {
    handleDelete(category?._id);
    setModalOpen(false);
  };

  return (
    <Card className="w-full max-w-[320px] mx-auto shadow-lg rounded-lg overflow-hidden">
      {/* Image container with overlay */}
      <div className="relative group cursor-pointer overflow-hidden">
        <img
          src={category?.image}
          alt={category?.name}
          className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-110"
        />

        {/* Overlay for admin action buttons */}
        <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black bg-opacity-40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Button
            variant="ghost"
            onClick={handleEdit}
            className="text-white rounded bg-foreground hover:bg-accent"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="ghost"
            onClick={handleDeleteClick}
            className="text-white bg-red-600 rounded hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Category details */}
      <CardContent className="p-4 bg-white">
        <h2 className="text-lg font-semibold mb-1 text-gray-800 truncate">
          {category?.name}
        </h2>
        <p className="text-sm text-gray-600">{category?.description}</p>
      </CardContent>

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this category?"
      />
    </Card>
  );
}

export default AdminCategoryTile;
