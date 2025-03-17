import { FileIcon, UploadCloudIcon, XIcon, Loader2 } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";

function ProductImageUpload({
  imageFiles,
  setImageFiles,
  imageLoadingStates,
  uploadedImageUrls,
  setUploadedImageUrls,
  setImageLoadingStates,
  isCustomStyling = false,
  isSingleImage = false, // Controls single vs. multiple uploads
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [pendingUploads, setPendingUploads] = useState([]);
  const inputRef = useRef(null);

  function handleImageFileChange(event) {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length > 0) {
      if (isSingleImage) {
        // For single image mode, replace the current arrays
        setImageFiles([selectedFiles[0]]);
        setImageLoadingStates([true]);
        setUploadedImageUrls([]);
        setPendingUploads([{ file: selectedFiles[0], index: 0 }]);
      } else {
        // For multiple images, append to the existing files
        const currentLength = imageFiles?.length || 0;
        const newFiles = selectedFiles.map((file, idx) => ({
          file,
          index: currentLength + idx
        }));

        setPendingUploads(prev => [...prev, ...newFiles]);

        setImageFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
        setImageLoadingStates((prevStates) => [
          ...prevStates,
          ...selectedFiles.map(() => true),
        ]);
      }
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length > 0) {
      if (isSingleImage) {
        setImageFiles([droppedFiles[0]]);
        setImageLoadingStates([true]);
        setUploadedImageUrls([]);
        setPendingUploads([{ file: droppedFiles[0], index: 0 }]);
      } else {
        const currentLength = imageFiles?.length || 0;
        const newFiles = droppedFiles.map((file, idx) => ({
          file,
          index: currentLength + idx
        }));

        setPendingUploads(prev => [...prev, ...newFiles]);

        setImageFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
        setImageLoadingStates((prevStates) => [
          ...prevStates,
          ...droppedFiles.map(() => true),
        ]);
      }
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleRemoveImage(index) {
    if (!Array.isArray(imageLoadingStates)) {
      console.error("imageLoadingStates is not an array! Resetting...");
      setImageLoadingStates([]);
      return;
    }

    // Set removing flag to prevent triggering uploads
    setIsRemoving(true);

    if (isSingleImage) {
      setImageFiles([]);
      setUploadedImageUrls([]);
      setImageLoadingStates([]);
    } else {
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
      setUploadedImageUrls((prev) => prev.filter((_, i) => i !== index));
      setImageLoadingStates((prev) => prev.filter((_, i) => i !== index));
    }

    // Reset removing flag after a short delay to ensure state updates have completed
    setTimeout(() => {
      setIsRemoving(false);
    }, 100);
  }

  async function uploadImageToCloudinary(file, index) {
    // Mark file as being uploaded
    setImageLoadingStates((prevStates) => {
      const updatedStates = [...prevStates];
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
        if (isSingleImage) {
          setUploadedImageUrls([response.data.result[0].url]);
        } else {
          // Append new URL instead of replacing an existing image
          setUploadedImageUrls((prevUrls) => [...prevUrls, response.data.result[0].url]);
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      // Remove the failed file from imageFiles
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
      setImageLoadingStates((prev) => prev.filter((_, i) => i !== index));
    } finally {
      // Mark file upload as complete
      setImageLoadingStates((prevStates) => {
        const updatedStates = [...prevStates];
        updatedStates[index] = false;
        return updatedStates;
      });

      // Remove from pending uploads
      setPendingUploads(prev => prev.filter(item => item.index !== index));

      // Only set isUploading to false if no more pending uploads
      if (pendingUploads.length <= 1) {
        setIsUploading(false);
      }
    }
  }

  // Process pending uploads
  useEffect(() => {
    if (isRemoving || pendingUploads.length === 0) return;

    // Process one upload at a time
    const { file, index } = pendingUploads[0];
    uploadImageToCloudinary(file, index);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingUploads, isRemoving]);

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

        {/* Display existing uploaded images */}
        {uploadedImageUrls && uploadedImageUrls.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-4">
            {uploadedImageUrls.map((url, index) => (
              <div key={`${url}-${index}`} className="relative">
                <img
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-32 h-32 object-cover rounded-lg"
                />
                {imageLoadingStates[index] ? (
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
              </div>
            ))}
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