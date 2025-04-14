import { FileIcon, UploadCloudIcon, XIcon, Loader2, GripIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "../ui/use-toast";

function ProductImageUpload({
  imageFiles = [],
  setImageFiles,
  imageLoadingStates = [],
  uploadedImageUrls = [],
  setUploadedImageUrls,
  setImageLoadingStates,
  isCustomStyling = false,
  isSingleImage = false, // Controls single vs. multiple uploads
}) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [pendingUploads, setPendingUploads] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const inputRef = useRef(null);

  // Ensure arrays are initialized
  useEffect(() => {
    if (!Array.isArray(imageFiles)) {
      console.warn("imageFiles is not an array, initializing as empty array");
      setImageFiles([]);
    }

    if (!Array.isArray(imageLoadingStates)) {
      console.warn("imageLoadingStates is not an array, initializing as empty array");
      setImageLoadingStates([]);
    }

    if (!Array.isArray(uploadedImageUrls)) {
      console.warn("uploadedImageUrls is not an array, initializing as empty array");
      setUploadedImageUrls([]);
    }
  }, [imageFiles, imageLoadingStates, uploadedImageUrls, setImageFiles, setImageLoadingStates, setUploadedImageUrls]);

  function handleImageFileChange(event) {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 0) {
      if (isSingleImage) {
        // For single image mode, replace the current arrays
        setImageFiles([selectedFiles[0]]);
        setImageLoadingStates([true]);
        setUploadedImageUrls([]);
        setPendingUploads([{ file: selectedFiles[0], index: 0 }]);
      } else {
        // For multiple images, append to the existing files
        const currentLength = Array.isArray(imageFiles) ? imageFiles.length : 0;
        const newFiles = selectedFiles.map((file, idx) => ({
          file,
          index: currentLength + idx
        }));

        setPendingUploads(prev => {
          const prevUploads = Array.isArray(prev) ? prev : [];
          return [...prevUploads, ...newFiles];
        });

        setImageFiles((prevFiles) => {
          const files = Array.isArray(prevFiles) ? prevFiles : [];
          return [...files, ...selectedFiles];
        });

        setImageLoadingStates((prevStates) => {
          const states = Array.isArray(prevStates) ? prevStates : [];
          return [
            ...states,
            ...selectedFiles.map(() => true),
          ];
        });
      }
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files || []);
    if (droppedFiles.length > 0) {
      if (isSingleImage) {
        setImageFiles([droppedFiles[0]]);
        setImageLoadingStates([true]);
        setUploadedImageUrls([]);
        setPendingUploads([{ file: droppedFiles[0], index: 0 }]);
      } else {
        const currentLength = Array.isArray(imageFiles) ? imageFiles.length : 0;
        const newFiles = droppedFiles.map((file, idx) => ({
          file,
          index: currentLength + idx
        }));

        setPendingUploads(prev => {
          const prevUploads = Array.isArray(prev) ? prev : [];
          return [...prevUploads, ...newFiles];
        });

        setImageFiles((prevFiles) => {
          const files = Array.isArray(prevFiles) ? prevFiles : [];
          return [...files, ...droppedFiles];
        });

        setImageLoadingStates((prevStates) => {
          const states = Array.isArray(prevStates) ? prevStates : [];
          return [
            ...states,
            ...droppedFiles.map(() => true),
          ];
        });
      }
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleRemoveImage(index) {
    // Validate arrays before proceeding
    if (!Array.isArray(imageLoadingStates)) {
      console.error("imageLoadingStates is not an array! Resetting...");
      setImageLoadingStates([]);
      return;
    }

    if (!Array.isArray(imageFiles)) {
      console.error("imageFiles is not an array! Resetting...");
      setImageFiles([]);
      return;
    }

    if (!Array.isArray(uploadedImageUrls)) {
      console.error("uploadedImageUrls is not an array! Resetting...");
      setUploadedImageUrls([]);
      return;
    }

    // Set removing flag to prevent triggering uploads
    setIsRemoving(true);

    if (isSingleImage) {
      setImageFiles([]);
      setUploadedImageUrls([]);
      setImageLoadingStates([]);
    } else {
      setImageFiles((prev) => Array.isArray(prev) ? prev.filter((_, i) => i !== index) : []);
      setUploadedImageUrls((prev) => Array.isArray(prev) ? prev.filter((_, i) => i !== index) : []);
      setImageLoadingStates((prev) => Array.isArray(prev) ? prev.filter((_, i) => i !== index) : []);
    }

    // Reset removing flag after a short delay to ensure state updates have completed
    setTimeout(() => {
      setIsRemoving(false);
    }, 100);
  }

  async function uploadImageToCloudinary(file, index) {
    // Mark file as being uploaded
    setImageLoadingStates((prevStates) => {
      const states = Array.isArray(prevStates) ? prevStates : [];
      const updatedStates = [...states];
      updatedStates[index] = true;
      return updatedStates;
    });
    setIsUploading(true);
  
    const data = new FormData();
    data.append("my_file", file);
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/admin/products/upload-image`,
        data
      );
  
      if (response?.data?.success) {
        const secureUrl = response.data.result[0].secure_url; // Use secure_url for HTTPS
  
        if (isSingleImage) {
          setUploadedImageUrls([secureUrl]);
        } else {
          setUploadedImageUrls((prevUrls) => {
            const urls = Array.isArray(prevUrls) ? prevUrls : [];
            return [...urls, secureUrl];
          });
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setImageFiles((prev) => {
        if (!Array.isArray(prev)) return [];
        return prev.filter((_, i) => i !== index);
      });
      setImageLoadingStates((prev) => {
        if (!Array.isArray(prev)) return [];
        return prev.filter((_, i) => i !== index);
      });
    } finally {
      setImageLoadingStates((prevStates) => {
        const states = Array.isArray(prevStates) ? prevStates : [];
        const updatedStates = [...states];
        updatedStates[index] = false;
        return updatedStates;
      });
  
      setPendingUploads((prev) => {
        if (!Array.isArray(prev)) return [];
        return prev.filter((item) => item.index !== index);
      });
  
      if (!Array.isArray(pendingUploads) || pendingUploads.length <= 1) {
        setIsUploading(false);
      }
    }
  }
  

  // Process pending uploads
  useEffect(() => {
    if (isRemoving || !Array.isArray(pendingUploads) || pendingUploads.length === 0) return;

    // Process one upload at a time
    const firstUpload = pendingUploads[0];
    if (!firstUpload || !firstUpload.file) {
      console.error("Invalid pending upload item");
      // Remove invalid item
      setPendingUploads(prev => prev.slice(1));
      return;
    }

    const { file, index } = firstUpload;
    uploadImageToCloudinary(file, index);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingUploads, isRemoving]);

  // State to track which item is being dragged over
  const [dragOverItem, setDragOverItem] = useState(null);

  // Drag and drop reordering functions
  const handleDragStart = (index) => {
    setDraggedItem(index);
  };

  const handleDragEnter = (index) => {
    setDragOverItem(index);

    // Return early if no item is being dragged or if dragging over itself
    if (draggedItem === null || draggedItem === index) return;

    // Ensure all arrays exist and have valid lengths
    if (!Array.isArray(uploadedImageUrls) || !Array.isArray(imageFiles) || !Array.isArray(imageLoadingStates)) {
      console.error("One or more required arrays is not initialized");
      return;
    }

    // Check if draggedItem is within valid bounds
    if (draggedItem < 0 || draggedItem >= uploadedImageUrls.length) {
      console.error("Dragged item index out of bounds");
      return;
    }

    // Reorder the images - create defensive copies
    const reorderedUrls = [...uploadedImageUrls];
    const reorderedFiles = [...(imageFiles || [])];
    const reorderedLoadingStates = [...(imageLoadingStates || [])];

    // Get the dragged item
    const draggedUrl = reorderedUrls[draggedItem];
    const draggedFile = reorderedFiles[draggedItem];
    const draggedLoadingState = reorderedLoadingStates[draggedItem];

    // Ensure we have valid items to move
    if (!draggedUrl) {
      console.error("Dragged URL is undefined");
      return;
    }

    // Remove the dragged item from its original position
    reorderedUrls.splice(draggedItem, 1);
    if (reorderedFiles.length > draggedItem) reorderedFiles.splice(draggedItem, 1);
    if (reorderedLoadingStates.length > draggedItem) reorderedLoadingStates.splice(draggedItem, 1);

    // Insert the dragged item at the new position
    reorderedUrls.splice(index, 0, draggedUrl);
    if (draggedFile !== undefined) reorderedFiles.splice(index, 0, draggedFile);
    if (draggedLoadingState !== undefined) reorderedLoadingStates.splice(index, 0, draggedLoadingState);

    // Update the state
    setUploadedImageUrls(reorderedUrls);
    setImageFiles(reorderedFiles);
    setImageLoadingStates(reorderedLoadingStates);

    // Update the dragged item index
    setDraggedItem(index);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    if (draggedItem !== null) {
      toast({
        title: "Images reordered successfully",
        description: "The order of your product images has been updated.",
        duration: 3000,
      });
    }
    setDraggedItem(null);
    setDragOverItem(null);
  };

  return (
    <div className={`w-full mt-4 ${isCustomStyling ? "" : "max-w-md mx-auto"}`}>
      <Label className="text-lg font-semibold mb-2 block">
        Upload Image{isSingleImage ? "" : "s"}
      </Label>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed rounded-lg p-4"
      >
        {isUploading && (
          <div className="flex items-center justify-center text-muted-foreground mb-4 bg-gray-50 p-2 rounded">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>Uploading {pendingUploads.length} image{pendingUploads.length !== 1 ? 's' : ''}...</span>
          </div>
        )}

        {/* Display existing uploaded images with drag and drop functionality */}
        {Array.isArray(uploadedImageUrls) && uploadedImageUrls.length > 0 && (
          <div className="mb-4">
            {!isSingleImage && uploadedImageUrls.length > 1 && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md mb-3">
                <GripIcon className="w-5 h-5 text-gray-500" />
                <p className="text-sm text-gray-600">
                  Drag and drop images to reorder them
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-4">
              {uploadedImageUrls.map((url, index) => {
                // Skip rendering if url is undefined or null
                if (!url) return null;

                // Check if imageLoadingStates is valid
                const isLoading = Array.isArray(imageLoadingStates) && imageLoadingStates[index];
                const isDraggable = !isSingleImage && Array.isArray(imageLoadingStates) && !imageLoadingStates[index];

                return (
                  <div
                    key={`${url}-${index}`}
                    className={`relative ${!isSingleImage && 'cursor-move'}`}
                    draggable={isDraggable}
                    onDragStart={() => handleDragStart(index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragLeave={handleDragLeave}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    style={{
                      opacity: draggedItem === index ? 0.5 : 1,
                      transform: draggedItem === index ? 'scale(0.95)' : 'scale(1)',
                      border: dragOverItem === index && draggedItem !== index ? '2px dashed #3b82f6' : 'none',
                      boxShadow: dragOverItem === index && draggedItem !== index ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none',
                      transition: 'opacity 0.2s, transform 0.2s, border 0.2s, box-shadow 0.2s'
                    }}
                  >
                    <img
                      src={url}
                      alt={`Uploaded ${index + 1}`}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    {!isSingleImage && isDraggable && (
                      <div className="absolute top-0 left-0 p-1 rounded-bl-md bg-gray-100 opacity-70 hover:opacity-100">
                        <GripIcon className="w-4 h-4" />
                      </div>
                    )}
                    {isLoading ? (
                      <div className="absolute top-0 right-0 p-2 rounded-md bg-gray-100">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="p-2 rounded-md bg-gray-100 absolute top-0 right-0 text-muted-foreground hover:bg-foreground hover:text-background"
                        onClick={() => handleRemoveImage(index)}
                        disabled={isUploading}
                      >
                        <XIcon className="w-4 h-4" />
                        <span className="sr-only">Remove Image</span>
                      </button>
                    )}
                    {!isSingleImage && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-70 text-white text-xs p-1 text-center rounded-b-lg">
                        {index === 0 ? (
                          <span className="font-bold">Main Image • {index + 1}</span>
                        ) : (
                          <span>Position: {index + 1}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Always display the upload option so that users can add/replace images */}
        <Label
          htmlFor="image-upload"
          className={`flex flex-col items-center justify-center h-32 cursor-pointer border border-dashed rounded-lg p-4 hover:bg-gray-50 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-2" />
          <span>
            Drag & drop or click to upload {isSingleImage ? "an image" : "images"}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            {isSingleImage ? "1 image maximum" : "Multiple images allowed"}
          </span>
        </Label>

        {/* File input; remains hidden */}
        <Input
          id="image-upload"
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
          multiple={!isSingleImage}
          accept="image/*"
          disabled={isUploading}
        />
      </div>
    </div>
  );
}

export default ProductImageUpload;