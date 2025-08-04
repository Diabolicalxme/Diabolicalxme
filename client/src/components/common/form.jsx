import React, { useState } from "react";
import axios from "axios";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { useToast } from "../ui/use-toast";
import { getOptimizedImageUrl, getOptimizedVideoUrl } from "../../lib/utils";
import { optimizeImageForUpload, isValidImageFile, isValidFileSize } from "../../lib/imageOptimization";


function CommonForm({ formControls, formData, setFormData, onSubmit, buttonText, isBtnDisabled }) {
  const [passwordVisibility, setPasswordVisibility] = useState({});
  // Track upload status for color items (by index) and video upload status.
  const [colorsUploadStatus, setColorsUploadStatus] = useState({});
  const [videoUploadStatus, setVideoUploadStatus] = useState("idle"); // idle, uploading, uploaded, error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const { toast } = useToast();

  // Helper function for uploading a color image directly to Cloudinary with optimization.
  const uploadColorImage = async (file, idx, controlItem) => {
    // Validate file type and size using the same logic as backend
    if (!isValidImageFile(file)) {
      setColorsUploadStatus((prevStatus) => ({ ...prevStatus, [idx]: "error" }));
      console.error(`Unsupported file format: ${file.type || 'unknown'}`);
      return;
    }

    if (!isValidFileSize(file)) {
      setColorsUploadStatus((prevStatus) => ({ ...prevStatus, [idx]: "error" }));
      console.error(`File size exceeds 1MB limit. Please select a smaller image.`);
      return;
    }

    setColorsUploadStatus((prevStatus) => ({ ...prevStatus, [idx]: "uploading" }));

    try {
      // Apply the same optimization logic as backend
      const optimizedFile = await optimizeImageForUpload(file);

      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", optimizedFile);
      cloudinaryFormData.append("upload_preset", "upload_product_image");
      cloudinaryFormData.append("resource_type", "image");

      // Upload directly to Cloudinary using environment variable for cloud name
      const cloudName = import.meta.env.VITE_CLOUDINARY_NAME;
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        cloudinaryFormData
      );

      if (response?.data?.secure_url) {
        const secureUrl = response.data.secure_url;
        const optimizedUrl = getOptimizedImageUrl(secureUrl); // Apply q_auto,f_auto transformations
        const colorsArray = Array.isArray(formData[controlItem.name]) ? formData[controlItem.name] : [];
        const updatedColors = [...colorsArray];
        updatedColors[idx] = { ...updatedColors[idx], image: optimizedUrl };

        setFormData({
          ...formData,
          [controlItem.name]: updatedColors,
        });

        setColorsUploadStatus((prevStatus) => ({ ...prevStatus, [idx]: "uploaded" }));
      }
    } catch (err) {
      console.error("Error uploading color image: ", err);
      setColorsUploadStatus((prevStatus) => ({ ...prevStatus, [idx]: "error" }));

      // Log specific error for HEIC files
      if (err.message.includes('HEIC')) {
        console.warn('HEIC file processing failed. User should convert to JPEG/PNG first.');
      }
    }
  };


  // Helper function for uploading video to Cloudinary.

// Updated uploadVideo function with file size limit and progress tracking
const uploadVideo = async (file) => {
  // Check file size - limit to 10MB (10 * 1024 * 1024 bytes)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > MAX_FILE_SIZE) {
    setVideoUploadStatus("error");
    setUploadError(`File size exceeds 10MB limit. Please select a smaller file.`);
    return;
  }

  setVideoUploadStatus("uploading");
  setUploadProgress(0);

  try {
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("upload_preset", "watch_any_buy");
    cloudinaryFormData.append("resource_type", "video");

    // Transformations will be applied at delivery time via getOptimizedVideoUrl

    // Use XMLHttpRequest to track upload progress
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);

          // Set the Cloudinary URL in the form data with optimizations
          const optimizedVideoUrl = getOptimizedVideoUrl(data.secure_url);
          setFormData((prevFormData) => ({
            ...prevFormData,
            video: optimizedVideoUrl,
          }));

          setVideoUploadStatus("uploaded");
          resolve({ url: data.secure_url, public_id: data.public_id });
        } else {
          setVideoUploadStatus("error");
          setUploadError("Failed to upload video to Cloudinary. Please try again.");
          reject(new Error("Failed to upload video to Cloudinary"));
        }
      };

      xhr.onerror = () => {
        setVideoUploadStatus("error");
        setUploadError("Network error during upload. Please check your connection and try again.");
        reject(new Error("Network error during upload"));
      };

      xhr.open("POST", `https://api.cloudinary.com/v1_1/dxfeyj7hl/video/upload`, true);
      xhr.send(cloudinaryFormData);
    });
  } catch (err) {
    console.error("Error uploading video: ", err);
    setVideoUploadStatus("error");
    setUploadError("An unexpected error occurred. Please try again.");
    throw err;
  }
};




  function togglePasswordVisibility(name) {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  }

  // Comprehensive validation function with detailed error messages
  function validateFormFields() {
    const validationErrors = [];

    formControls.forEach((controlItem) => {
      const value = formData[controlItem.name];
      const fieldLabel = controlItem.label;

      // Check if field is required (default to true unless explicitly set to false)
      const isRequired = controlItem.required !== false;

      switch (controlItem.componentType) {
        case "input":
          if (isRequired && (!value || (typeof value === "string" && value.trim() === ""))) {
            validationErrors.push(`${fieldLabel} is required.`);
          } else if (value) {
            // Type-specific validations
            if (controlItem.type === "number") {
              const numValue = Number(value);
              if (isNaN(numValue)) {
                validationErrors.push(`${fieldLabel} must be a valid number.`);
              } else if (numValue < 0) {
                validationErrors.push(`${fieldLabel} cannot be negative.`);
              } else if (controlItem.min && numValue < controlItem.min) {
                validationErrors.push(`${fieldLabel} must be at least ${controlItem.min}.`);
              } else if (controlItem.max && numValue > controlItem.max) {
                validationErrors.push(`${fieldLabel} cannot exceed ${controlItem.max}.`);
              }

              // Specific validations for inventory-related fields
              if (controlItem.name === "totalStock") {
                if (numValue > 10000) {
                  validationErrors.push(`${fieldLabel} seems unusually high. Please verify the stock quantity.`);
                } else if (numValue === 0) {
                  validationErrors.push(`${fieldLabel} cannot be zero. Please enter a valid stock quantity.`);
                }
              }
              if (controlItem.name === "price") {
                if (numValue > 100000) {
                  validationErrors.push(`${fieldLabel} seems unusually high. Please verify the price.`);
                } else if (numValue <= 0) {
                  validationErrors.push(`${fieldLabel} must be greater than zero.`);
                }
              }
              if (controlItem.name === "salePrice" && formData.price) {
                const regularPrice = Number(formData.price);
                if (numValue >= regularPrice) {
                  validationErrors.push(`Sale price (${numValue}) must be less than regular price (${regularPrice}).`);
                }
              }
            } else if (controlItem.type === "email") {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(value)) {
                validationErrors.push(`${fieldLabel} must be a valid email address.`);
              }
            }
          }
          break;

        case "password":
          if (isRequired && (!value || value.trim() === "")) {
            validationErrors.push(`${fieldLabel} is required.`);
          } else if (value && value.length < 6) {
            validationErrors.push(`${fieldLabel} must be at least 6 characters long.`);
          }
          break;

        case "select":
          if (isRequired && (!value || value === "")) {
            validationErrors.push(`Please select a ${fieldLabel.toLowerCase()}.`);
          }
          break;

        case "textarea":
          if (isRequired && (!value || value.trim() === "")) {
            validationErrors.push(`${fieldLabel} is required.`);
          } else if (value && controlItem.maxLength && value.length > controlItem.maxLength) {
            validationErrors.push(`${fieldLabel} cannot exceed ${controlItem.maxLength} characters.`);
          }
          break;

        case "colors":
          if (isRequired) {
            if (!Array.isArray(value) || value.length === 0) {
              validationErrors.push(`At least one color variant is required.`);
            } else {
              // Check for duplicate color names
              const colorTitles = value.map(color => color.title?.trim().toLowerCase()).filter(Boolean);
              const duplicateTitles = colorTitles.filter((title, index) => colorTitles.indexOf(title) !== index);
              if (duplicateTitles.length > 0) {
                validationErrors.push(`Duplicate color names found. Each color must have a unique name.`);
              }

              // Check each color for completeness
              value.forEach((color, index) => {
                if (!color.title || color.title.trim() === "") {
                  validationErrors.push(`Color ${index + 1}: Title is required.`);
                }
                if (!color.image) {
                  validationErrors.push(`Color ${index + 1}: Image is required.`);
                }

                // Check if color inventory exceeds total stock
                if (color.inventory && formData.totalStock) {
                  const colorInventory = Number(color.inventory);
                  const totalStock = Number(formData.totalStock);
                  if (colorInventory > totalStock) {
                    validationErrors.push(`Color "${color.title || index + 1}": Inventory (${colorInventory}) cannot exceed total stock (${totalStock}).`);
                  }
                  if (colorInventory < 0) {
                    validationErrors.push(`Color "${color.title || index + 1}": Inventory cannot be negative.`);
                  }
                }
              });

              // Check if sum of all color inventories exceeds total stock
              const totalColorInventory = value.reduce((sum, color) => {
                return sum + (Number(color.inventory) || 0);
              }, 0);
              if (formData.totalStock && totalColorInventory > Number(formData.totalStock)) {
                validationErrors.push(`Total color inventory (${totalColorInventory}) exceeds total stock (${formData.totalStock}). Please adjust individual color inventories.`);
              }
            }
          }
          break;

        case "toggle":
          // Toggles are usually optional, but if required, check boolean value
          if (isRequired && typeof value !== "boolean") {
            validationErrors.push(`${fieldLabel} selection is required.`);
          }
          break;

        default:
          // Generic validation for unknown field types
          if (isRequired && (!value || (typeof value === "string" && value.trim() === ""))) {
            validationErrors.push(`${fieldLabel} is required.`);
          }
          break;
      }
    });

    return validationErrors;
  }

  function renderInputsByComponentType(controlItem) {
    let element = null;
    // For colors, default to empty array; otherwise default to empty string.
    const value = formData[controlItem.name] || (controlItem.componentType === "colors" ? [] : "");

    switch (controlItem.componentType) {
      case "input":
        element = (
          <Input
            name={controlItem.name}
            placeholder={controlItem.placeholder}
            id={controlItem.name}
            type={controlItem.type}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [controlItem.name]: event.target.value,
              })
            }
          />
        );
        break;


        case "password":
          element = (
            <div className="relative">
              <Input
                name={controlItem.name}
                placeholder={controlItem.placeholder}
                id={controlItem.name}
                type={passwordVisibility[controlItem.name] ? "text" : "password"} // Toggle between text and password
                value={value}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    [controlItem.name]: event.target.value,
                  })
                }
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                onClick={() => togglePasswordVisibility(controlItem.name)}
              >
                {passwordVisibility[controlItem.name] ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          );
          break;

      case "select":
        element = (
          <Select
            onValueChange={(val) =>
              setFormData({
                ...formData,
                [controlItem.name]: val,
              })
            }
            value={value}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={controlItem.label} />
            </SelectTrigger>
            <SelectContent>
              {controlItem.options && controlItem.options.length > 0
                ? controlItem.options.map((optionItem) => (
                    <SelectItem key={optionItem.id} value={optionItem.id}>
                      {optionItem.label}
                    </SelectItem>
                  ))
                : null}
            </SelectContent>
          </Select>
        );
        break;
      case "textarea":
        element = (
          <Textarea
            name={controlItem.name}
            placeholder={controlItem.placeholder}
            id={controlItem.id}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [controlItem.name]: event.target.value,
              })
            }
          />
        );
        break;
      case "toggle":
        element = (
          <Switch
            checked={!!value}
            onCheckedChange={(checked) =>
              setFormData({
                ...formData,
                [controlItem.name]: checked,
              })
            }
          />
        );
        break;
        case "colors": {
          const colorsArray = Array.isArray(value) ? value : [];
          element = (
            <div>
              {colorsArray.map((color, idx) => (
                <div key={idx} className="flex flex-col gap-2 mb-2 border p-2 rounded">
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Color Title"
                      value={color.title || ""}
                      onChange={({ target }) => {
                        const updatedColors = [...colorsArray];
                        updatedColors[idx] = { ...updatedColors[idx], title: target.value };
                        setFormData({
                          ...formData,
                          [controlItem.name]: updatedColors,
                        });
                      }}
                    />
                    <Input
                      placeholder="Inventory"
                      type="number"
                      min="0"
                      value={color.inventory || ""}
                      onChange={({ target }) => {
                        const updatedColors = [...colorsArray];
                        updatedColors[idx] = { ...updatedColors[idx], inventory: parseInt(target.value) || 0 };
                        setFormData({
                          ...formData,
                          [controlItem.name]: updatedColors,
                        });
                      }}
                      className="w-24"
                    />
                    {color.image && (
                      <img
                        src={color.image}
                        alt={`Color ${idx}`}
                        className="w-16 h-16 object-cover rounded border"
                      />
                    )}
                    {!color.image && colorsUploadStatus[idx] !== "uploading" && (
                      <Input
                        type="file"
                        accept="image/*,.heic,.heif"
                        onChange={async (event) => {
                          const file = event.target.files[0];
                          if (file) {
                            await uploadColorImage(file, idx, controlItem);
                          }
                        }}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {colorsUploadStatus[idx] === "uploading" && "Uploading..."}
                      {colorsUploadStatus[idx] === "uploaded" && "Uploaded"}
                      {colorsUploadStatus[idx] === "error" && (
                        <span className="text-red-600">Upload failed (check file format/size)</span>
                      )}
                    </span>
                    <Button
                      type="button"
                      onClick={() => {
                        const updatedColors = colorsArray.filter((_, index) => index !== idx);
                        setFormData({ ...formData, [controlItem.name]: updatedColors });
                        setColorsUploadStatus((prevStatus) => {
                          const newStatus = { ...prevStatus };
                          delete newStatus[idx];
                          return newStatus;
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                onClick={() => {
                  const updatedColors = [...colorsArray, { title: "", image: "" }];
                  setFormData({ ...formData, [controlItem.name]: updatedColors });
                }}
              >
                Add New Color
              </Button>
            </div>
          );
          break;
        }
        case "video": {
          if (formData.isWatchAndBuy) {
            element = (
              <div>
                {formData.video && (
                  <div style={{ marginBottom: "10px" }}>
                    <video
                      src={formData.video}
                      controls
                      width="200"
                      style={{ borderRadius: "8px", border: "1px solid #ccc" }}
                    />
                    <button
                      onClick={() => {
                        setFormData({ ...formData, video: "" });
                        setVideoUploadStatus("idle");
                      }}
                    >
                      Remove Video
                    </button>
                  </div>
                )}

                {!formData.video && (
                  <input
                    type="file"
                    accept="video/*"
                    onChange={async (event) => {
                      const file = event.target.files[0];
                      if (file) {
                        setVideoUploadStatus("uploading");
                        setUploadError(""); // Clear any previous errors
                        await uploadVideo(file); // Upload function
                        // No need to set the blob URL here
                      }
                    }}
                  />
                )}

                {videoUploadStatus === "uploading" && (
                  <div className="mt-2">
                    <p>Processing... {uploadProgress}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {videoUploadStatus === "error" && (
                  <div className="mt-2">
                    <p className="text-red-600">{uploadError}</p>
                  </div>
                )}
                {videoUploadStatus === "uploaded" && <p className="mt-2 text-green-600">Uploaded Successfully</p>}
              </div>
            );
          } else {
            element = null;
          }
          break;
        }

      default:
        element = null;
    }
    return element;
  }

  // Helper function to check if video upload is required and completed
  const isVideoUploadRequired = () => {
    const hasVideoField = formControls.some(control => control.componentType === "video");
    return hasVideoField && formData.isWatchAndBuy && !formData.video;
  };

  // Determine if button should be disabled
  const shouldDisableButton = isBtnDisabled || isVideoUploadRequired() || videoUploadStatus === "uploading";

  // Custom form submission handler with comprehensive validation
  function handleFormSubmit(event) {
    event.preventDefault();

    // Validate all form fields
    const validationErrors = validateFormFields();

    if (validationErrors.length > 0) {
      // Show toast notification with validation errors
      const errorMessage = validationErrors.length === 1
        ? validationErrors[0]
        : `Please fix the following issues:\n• ${validationErrors.slice(0, 5).join('\n• ')}${validationErrors.length > 5 ? `\n• ... and ${validationErrors.length - 5} more issues` : ''}`;

      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    // If validation passes, call the original onSubmit function
    onSubmit(event);
  }

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="flex flex-col gap-3">
        {formControls.map((controlItem) => (
          <div className="grid w-full gap-1.5" key={controlItem.name}>
            <Label className="mb-1">{controlItem.label}</Label>
            {renderInputsByComponentType(controlItem)}
          </div>
        ))}
      </div>
      <Button disabled={shouldDisableButton} type="submit" className="mt-2 w-full hover:bg-accent">
        {buttonText || "Submit"}
      </Button>
    </form>
  );
}

export default CommonForm;