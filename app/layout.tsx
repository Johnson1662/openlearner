import type { Metadata, Viewport } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "OpenLearner - AI-Powered Learning",
  description: "Transform textbooks into gamified learning experiences with AI",
};

export const viewport: Viewport = {
  themeColor: '#58CC02',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased font-sans bg-white">
        {children}
      </body>
    </html>
  );
}
