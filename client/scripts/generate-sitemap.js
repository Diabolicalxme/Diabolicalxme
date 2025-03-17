import { writeFileSync } from "fs";
import { SitemapStream, streamToPromise } from "sitemap";

const hostname = "https://rachanaboutique.in";

const pages = [
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/shop/home", changefreq: "daily", priority: 0.9 },
  { url: "/shop/details/:id", changefreq: "weekly", priority: 0.8 },
  { url: "/shop/collections", changefreq: "weekly", priority: 0.8 },
  { url: "/shop/new-arrivals", changefreq: "weekly", priority: 0.8 },
  { url: "/shop/checkout", changefreq: "monthly", priority: 0.7 },
  { url: "/shop/account", changefreq: "monthly", priority: 0.6 },
  { url: "/shop/paypal-return", changefreq: "monthly", priority: 0.5 },
  { url: "/shop/payment-success", changefreq: "monthly", priority: 0.5 },
  { url: "/shop/search", changefreq: "weekly", priority: 0.7 },
  { url: "/shop/contact", changefreq: "monthly", priority: 0.5 },
  { url: "/auth/login", changefreq: "monthly", priority: 0.6 },
  { url: "/auth/register", changefreq: "monthly", priority: 0.6 },
  { url: "/auth/forgot-password", changefreq: "monthly", priority: 0.5 },
  { url: "/auth/reset-password", changefreq: "monthly", priority: 0.5 },
  { url: "/unauth-page", changefreq: "yearly", priority: 0.1 },
];

(async () => {
  const sitemap = new SitemapStream({ hostname });
  pages.forEach((page) => sitemap.write(page));
  sitemap.end();

  const sitemapXml = await streamToPromise(sitemap).then((data) => data.toString());
  writeFileSync("./public/sitemap.xml", sitemapXml);
  console.log("✅ Sitemap generated successfully!");
})();
