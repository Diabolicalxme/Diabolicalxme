import { writeFileSync, existsSync, unlinkSync } from "fs";
import { SitemapStream, streamToPromise } from "sitemap";

/**
 * DiabolicalXme Sitemap Generator
 * Generates a sitemap.xml file for better SEO and search engine indexing
 * This script is automatically run during the build process
 */

const hostname = "https://diabolicalxme.com";
const outputPath = "./public/sitemap.xml";

// Define all pages with their change frequency and priority
const pages = [
  // Main pages
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/shop/home", changefreq: "daily", priority: 0.9 },

  // Product pages
  { url: "/shop/details/:id", changefreq: "weekly", priority: 0.8 },
  { url: "/shop/collections", changefreq: "weekly", priority: 0.8 },
  { url: "/shop/new-arrivals", changefreq: "weekly", priority: 0.8 },
  { url: "/shop/search", changefreq: "weekly", priority: 0.7 },

  // Customer account pages
  { url: "/shop/account", changefreq: "monthly", priority: 0.6 },
  { url: "/shop/checkout", changefreq: "monthly", priority: 0.7 },
  { url: "/shop/payment-success", changefreq: "monthly", priority: 0.5 },
  { url: "/shop/paypal-return", changefreq: "monthly", priority: 0.5 },
  { url: "/shop/contact", changefreq: "monthly", priority: 0.6 },

  // Authentication pages
  { url: "/auth/login", changefreq: "monthly", priority: 0.6 },
  { url: "/auth/register", changefreq: "monthly", priority: 0.6 },
  { url: "/auth/forgot-password", changefreq: "monthly", priority: 0.5 },
  { url: "/auth/reset-password", changefreq: "monthly", priority: 0.5 },
  { url: "/unauth-page", changefreq: "yearly", priority: 0.1 },
];

// Delete existing sitemap if it exists
if (existsSync(outputPath)) {
  unlinkSync(outputPath);
  console.log("🗑️  Removed existing sitemap.xml");
}

// Generate new sitemap
(async () => {
  try {
    const sitemap = new SitemapStream({ hostname });
    pages.forEach((page) => sitemap.write(page));
    sitemap.end();

    const sitemapXml = await streamToPromise(sitemap).then((data) => data.toString());
    writeFileSync(outputPath, sitemapXml);
    console.log("✅ Sitemap generated successfully for DiabolicalXme!");
  } catch (error) {
    console.error("❌ Error generating sitemap:", error);
  }
})();
