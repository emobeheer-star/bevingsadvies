import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BevingsAdvies Groningen — Controleer uw adviesrapport",
  description: "Onafhankelijke controle van aardbevingsschade-rapporten in Groningen. Wij analyseren uw dossier op fouten en gemiste vergoedingen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
