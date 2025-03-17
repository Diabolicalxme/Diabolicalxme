import React, { useState } from "react";
import { Button } from "../ui/button";
import { Trash2, Edit } from "lucide-react";
import DeleteConfirmationModal from "@/components/common/delete-confirmation-modal";

function AdminBannerTile({ image, description, handleEdit, handleDelete }) {
  const [isModalOpen, setModalOpen] = useState(false);

  const confirmDelete = () => {
    handleDelete();
    setModalOpen(false);
  };

  console.log("AdminBannerTile -> image", image);

  return (
    <div className="relative w-full h-[350px] rounded-t-lg">
      {/* Background Image */}
      <img
        src={image}
        alt="Banner"
        className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-35 rounded-t-lg"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
        <p className="text-lg md:text-2xl max-w-3xl mb-6 break-words">{description}</p>

        {/* Action Buttons */}
        <div className="flex gap-4">

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
            onClick={() => setModalOpen(true)}
            className="text-white bg-red-600 rounded hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this banner?"
      />
    </div>
  );
}

export default AdminBannerTile;
