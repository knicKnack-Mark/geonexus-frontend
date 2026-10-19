
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GEO//NEXUS — Geospatial Intelligence",
  description:
    "Precision geodetic engineering, land surveying, and geospatial intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
