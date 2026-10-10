import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s | Painel PB Team" },
  robots: { index: false, follow: false },
};

export default function LayoutDoPainel({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
