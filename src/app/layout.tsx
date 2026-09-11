import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Watchlist",
  description: "Track movies you want to watch and ones you've seen.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen text-zinc-100">
        {/* Ambient Background Layers */}
        <div className="ambient-bg" />

        {/* Glassmorphic Navbar */}
        <nav className="sticky top-0 z-40 border-b border-white/10 bg-white/5 backdrop-blur-2xl">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
            <Link
              href="/"
              className="text-[17px] font-semibold tracking-wide text-white drop-shadow-md"
            >
              Watchlist
            </Link>

            {/* Neumorphic Add Button */}
            <Link
              href="/add"
              className="glass-neu inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[14px] font-medium text-white transition-all hover:scale-105 active:shadow-neu-pressed active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Add Movie
            </Link>
          </div>
        </nav>

        <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
      </body>
    </html>
  );
}
