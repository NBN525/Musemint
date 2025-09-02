import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://ai.rstglobal.ca";
  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/success`, lastModified: new Date() },
    { url: `${base}/cancel`, lastModified: new Date() },
    { url: `${base}/rst/dashboard`, lastModified: new Date() },
  ];
}
