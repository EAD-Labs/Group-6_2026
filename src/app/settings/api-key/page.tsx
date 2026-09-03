import type { Metadata } from "next";

import { ApiKeyForm } from "@/features/settings/api-key-form";

export const metadata: Metadata = {
  title: "API key",
};

export default function ApiKeyPage() {
  return (
    <main className="page-shell narrow-shell">
      <span className="eyebrow">Optional AI practice</span>
      <h1>Connect your API key</h1>
      <p>
        Module 1 does not require an API key. A later prompt-practice activity may
        use your own Gemini key after the client approves the integration.
      </p>
      <ApiKeyForm />
    </main>
  );
}
