import type { MetadataRoute } from "next";
import { ITENS_MENU, LINKS_LEGAIS } from "@/components/site/navegacao";
import { URL_DO_SITE } from "@/components/site/urlDoSite";

export default function sitemap(): MetadataRoute.Sitemap {
  const paginas = [{ href: "" }, ...ITENS_MENU].map((item) => ({
    url: `${URL_DO_SITE}${item.href}`,
    changeFrequency: "weekly" as const,
    priority: item.href === "" ? 1 : 0.8,
  }));
  const legais = LINKS_LEGAIS.map((item) => ({
    url: `${URL_DO_SITE}${item.href}`,
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));
  return [...paginas, ...legais];
}
