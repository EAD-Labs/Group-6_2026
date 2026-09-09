import type { Metadata } from "next";

import { DemoProvider } from "@/features/demo/demo-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PromptShala",
    template: "%s | PromptShala",
  },
  description: "Practical AI literacy for educators",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="en" suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
