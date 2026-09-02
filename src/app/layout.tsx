import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PromptShala",
  description: "Practical AI literacy for educators",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
