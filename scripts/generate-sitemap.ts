import { writeFileSync } from "fs";
import { SitemapStream, streamToPromise } from "sitemap";
import path from "path";

// ✅ Change this to your deployed site URL
const SITE_URL = "https://clncambodia.com";

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: SITE_URL });

  // 👉 Add your routes here
  const routes = [
    "/", 
    "/about-us", 
    "/services", 
    "/products", 
    "/contact-us"
  ];

  routes.forEach((url) => {
    sitemap.write({ url, changefreq: "weekly", priority: 0.8 });
  });

  sitemap.end();

  const xml = await streamToPromise(sitemap);

  const filePath = path.resolve("./public/sitemap.xml");
  writeFileSync(filePath, xml.toString());

  console.log("✅ Sitemap generated at public/sitemap.xml");
}

generateSitemap().catch(console.error);
