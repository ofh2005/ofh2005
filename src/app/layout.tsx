import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nia Al Oud — CRM & Pilotage Commercial",
  description: "CRM interne Nia Al Oud Distribution : catalogue, simulateur, proforma, pipeline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
