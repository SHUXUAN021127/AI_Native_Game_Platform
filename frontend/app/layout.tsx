import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Navbar from "../components/Navbar";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Native Game Platform",
  description: "AI Generated HTML5 Games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">

          <header
            style={{
              padding: "20px",
              borderBottom: "1px solid #ddd",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >

            <h2>
              AI Native Game Platform
            </h2>

            <Navbar
              style={{
                display: "flex",
                gap: "20px"
              }}
            >

              <Link href="/">
                Home
              </Link>

              <Link href="/create">
                Create
              </Link>

              <Link href="/login">
                Login
              </Link>

            </Navbar>

          </header>

          <main
            style={{
              flex: 1
            }}
          >
            {children}
          </main>

        </body>
    </html>
  );
}
