import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
  title: "AI Native Game Platform",
  description: "AI Generated Games",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">

      <body
        style={{
          margin: 0,
          background: "#f8fafc",
          fontFamily:
            "Inter, Arial, sans-serif"
        }}
      >

        <Navbar />

        {children}

      </body>

    </html>
  );
}