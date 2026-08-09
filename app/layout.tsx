import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Academy Live",
  description: "Live-session presentation platform and LMS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
