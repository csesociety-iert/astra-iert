import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CSE Society | ASTRA Portal",
  description: "Sign in or register for the CSE Society portal at IERT Prayagraj.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
