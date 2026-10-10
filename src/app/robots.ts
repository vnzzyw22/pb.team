import type { MetadataRoute } from "next";
import { URL_DO_SITE } from "@/components/site/urlDoSite";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/painel", "/api"] },
    sitemap: `${URL_DO_SITE}/sitemap.xml`,
  };
}
