import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FYEC100 AI Support Assistant",
    template: "%s | FYEC100 AI Support"
  },
  description:
    "COSTAATT course-grounded academic support for FYEC100 students, delivered through a controlled Moodle pilot.",
  robots: {
    follow: false,
    index: false
  }
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
