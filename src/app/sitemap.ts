import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

const SITEMAP_LAST_MODIFIED = new Date("2026-01-01T00:00:00Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.baseUrl,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "hourly",
      priority: 1.0,
    },
  ];
}
