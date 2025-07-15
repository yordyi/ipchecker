import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { FpjsProvider } from "@fingerprintjs/fingerprintjs-pro-react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IP信息检测 - 检测您的网络和设备信息",
  description: "检测您的IP地址、地理位置、设备信息和浏览器指纹等网络信息",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const apiKey = process.env.NEXT_PUBLIC_FINGERPRINT_API_KEY;
  const region = process.env.NEXT_PUBLIC_FINGERPRINT_REGION || 'ap';
  
  // 根据区域配置正确的 endpoint
  const getEndpoint = (region: string) => {
    switch (region) {
      case 'ap':
        return 'https://ap.api.fpjs.io';
      case 'eu':
        return 'https://eu.api.fpjs.io';
      case 'us':
      default:
        return 'https://api.fpjs.io';
    }
  };
  
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 dark:from-black dark:via-blue-950/30 dark:to-purple-950/30 min-h-screen text-white`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {apiKey ? (
            <FpjsProvider
              loadOptions={{
                apiKey,
                region: region as 'us' | 'eu' | 'ap',
                endpoint: getEndpoint(region)
              }}
            >
              {children}
            </FpjsProvider>
          ) : (
            <div className="min-h-screen bg-red-900 text-white flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">配置错误</h1>
                <p>Fingerprint Pro API 密钥未配置</p>
                <p className="text-sm mt-2">请检查 .env.local 文件中的 NEXT_PUBLIC_FINGERPRINT_API_KEY</p>
                <p className="text-xs mt-1 text-gray-300">当前区域: {region}</p>
              </div>
            </div>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
