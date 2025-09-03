// app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://ai.rstglobal.ca";
  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/dashboard`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/support`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}
