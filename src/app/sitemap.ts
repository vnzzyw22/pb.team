import type { MetadataRoute } from "next";
import { ITENS_MENU } from "@/components/site/navegacao";
import { URL_DO_SITE } from "@/components/site/urlDoSite";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ href: "" }, ...ITENS_MENU].map((item) => ({
    url: `${URL_DO_SITE}${item.href}`,
    changeFrequency: "weekly",
    priority: item.href === "" ? 1 : 0.8,
  }));
}
