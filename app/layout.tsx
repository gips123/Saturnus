import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saturn — 3D Interactive",
  description: "Interactive 3D Saturn planet with rings. Scroll to rotate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
