import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Utility function to add Cloudinary transformations to URLs
export function addCloudinaryTransformations(url, transformations = ['q_auto', 'f_auto']) {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  // Check if transformations are already applied
  const hasTransformations = transformations.some(transform => url.includes(transform));
  if (hasTransformations) {
    return url;
  }

  // Split the URL to insert transformations
  const parts = url.split('/upload/');
  if (parts.length !== 2) {
    return url;
  }

  // Join transformations with forward slashes for Cloudinary URL format
  const transformationString = transformations.join('/');
  return `${parts[0]}/upload/${transformationString}/${parts[1]}`;
}

// Optimized image URL with automatic quality and format (recommended)
export function getOptimizedImageUrl(url) {
  return addCloudinaryTransformations(url, ['q_auto', 'f_auto']);
}

// Alternative: Force WebP conversion with optimizations
export function getWebPOptimizedImageUrl(url) {
  return addCloudinaryTransformations(url, ['f_webp', 'q_auto', 'f_auto']);
}

// Smart format selection (same as getOptimizedImageUrl)
export function getSmartOptimizedImageUrl(url) {
  return addCloudinaryTransformations(url, ['q_auto', 'f_auto']);
}

// Optimized video URL with automatic quality and format
export function getOptimizedVideoUrl(url) {
  return addCloudinaryTransformations(url, ['q_auto', 'f_auto']);
}

// Image URL with WebP conversion only
export function getWebPImageUrl(url) {
  return addCloudinaryTransformations(url, ['f_webp']);
}

// Image URL with all optimizations (WebP + quality auto + format auto)
export function getFullyOptimizedImageUrl(url) {
  return addCloudinaryTransformations(url, ['f_webp', 'q_auto', 'f_auto']);
}
