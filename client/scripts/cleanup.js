import { existsSync, unlinkSync } from "fs";

/**
 * DiabolicalXme Cleanup Script
 * Removes generated files that should be recreated during the build process
 */

const filesToClean = [
  "./public/sitemap.xml",
  // Add any other files that should be cleaned up here
];

// Delete files if they exist
filesToClean.forEach(filePath => {
  if (existsSync(filePath)) {
    unlinkSync(filePath);
    console.log(`🗑️  Removed ${filePath}`);
  }
});

console.log("✅ Cleanup completed successfully!");
