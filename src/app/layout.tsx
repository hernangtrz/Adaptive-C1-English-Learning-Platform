import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adaptive C1 English Learning Platform",
  description:
    "An adaptive C1 English training platform converting passive knowledge into active, retrievable fluency with FSRS and Mastery Engines.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
