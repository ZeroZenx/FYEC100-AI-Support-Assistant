import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FYEC100 AI Support Assistant",
  description:
    "A local Phase 1 MVP prototype for COSTAATT FYEC100 academic support."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
