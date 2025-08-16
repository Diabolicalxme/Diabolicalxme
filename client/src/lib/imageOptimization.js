// Client-side image optimization utility - simplified for maximum quality
// Based on the old backend logic that prioritizes quality over compression

/**
 * Supported input formats
 */
const SUPPORTED_INPUT_FORMATS = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
  'image/webp', 'image/avif', 'image/tiff', 'image/bmp',
  'image/svg+xml', 'image/heic', 'image/heif'
]; 

/**
 * Maximum file size - 1MB as requested
 */
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

/**
 * Convert HEIC to a supported format using heic2any library
 * Handles iPhone photos in HEIC format
 */
const convertHEIC = async (file) => {
  try {
    // Try to dynamically import heic2any library
    const heic2any = await import('heic2any');

    // Convert HEIC to JPEG blob
    const convertedBlob = await heic2any.default({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.95 // High quality for conversion
    });

    // heic2any might return an array, so handle both cases
    return Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

  } catch (importError) {
    console.warn('heic2any library not available, trying fallback method');

    // Fallback: Try to process as regular image (some browsers might support it)
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to convert HEIC using fallback'));
              }
            },
            'image/jpeg',
            0.95 // High quality for conversion
          );
        } catch (error) {
          reject(new Error(`HEIC fallback conversion failed: ${error.message}`));
        }
      };

      img.onerror = () => {
        reject(new Error('Browser cannot load HEIC file and heic2any library is not available. Please convert the image to JPEG/PNG first.'));
      };

      img.src = URL.createObjectURL(file);
    });
  }
};

/**
 * Resize and optimize image using Canvas API
 * Simplified approach matching the old backend logic - prioritizes quality
 * Now includes HEIC support for iPhone photos
 */
const processImageWithCanvas = async (file) => {
  return new Promise(async (resolve, reject) => {
    // Check if file is HEIC/HEIF (iPhone photos)
    const isHEIC = file.type === 'image/heic' || file.type === 'image/heif' ||
                   file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');

    // Validate file type - allow HEIC even if not in SUPPORTED_INPUT_FORMATS
    if (!isHEIC && (!file.type || !SUPPORTED_INPUT_FORMATS.includes(file.type.toLowerCase()))) {
      reject(new Error(`Unsupported file format: ${file.type || 'unknown'}`));
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error(`File too large: ${file.size} bytes. Maximum allowed: ${MAX_FILE_SIZE} bytes`));
      return;
    }

    let processFile = file;

    // Handle HEIC files (iPhone photos)
    if (isHEIC) {
      try {
        processFile = await convertHEIC(file);
      } catch (heicError) {
        console.error('HEIC conversion failed:', heicError.message);
        reject(new Error(`HEIC conversion failed: ${heicError.message}. Please try converting the image to JPEG or PNG format first.`));
        return;
      }
    }

    // Create image element
    const img = new Image();
    img.onload = () => {
      try {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Simple resize to 1024px width (matching old backend logic)
        const maxWidth = 1024;
        let { width, height } = img;

        // Only resize if width is larger than 1024px
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Enable high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw and resize image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to AVIF with 90% quality for better quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to process image'));
            }
          },
          'image/avif',
          0.9 // 90% quality
        );
      } catch (error) {
        reject(new Error(`Canvas processing failed: ${error.message}`));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load the processed image (original file or converted HEIC)
    img.src = URL.createObjectURL(processFile);
  });
};

/**
 * Process image with simplified logic - prioritizing quality
 * Matches the old backend approach: resize to 1024px width, WebP format, 90% quality
 */
export const optimizeImageForUpload = async (file) => {
  try {
    // Process with WebP format and high quality
    const optimizedBlob = await processImageWithCanvas(file);
    return optimizedBlob;
  } catch (error) {
    console.warn(`Failed to process image, falling back to JPEG:`, error.message);

    // Simple fallback to JPEG with same quality
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Simple resize to 1024px width (matching old backend)
          const maxWidth = 1024;
          let { width, height } = img;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Fallback processing failed'));
              }
            },
            'image/jpeg',
            0.9 // 90% quality
          );
        } catch (fallbackError) {
          reject(new Error(`Fallback processing failed: ${fallbackError.message}`));
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for fallback processing'));
      };

      img.src = URL.createObjectURL(file);
    });
  }
};

/**
 * Validate if file is a supported image format (including HEIC for iPhone photos)
 */
export const isValidImageFile = (file) => {
  if (!file) return false;

  // Check for HEIC/HEIF files (iPhone photos)
  const isHEIC = file.type === 'image/heic' || file.type === 'image/heif' ||
                 file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');

  if (isHEIC) return true;

  // Check standard formats
  return file.type && SUPPORTED_INPUT_FORMATS.includes(file.type.toLowerCase());
};

/**
 * Check if file size is within 1MB limit
 */
export const isValidFileSize = (file) => {
  return file && file.size <= MAX_FILE_SIZE;
};
