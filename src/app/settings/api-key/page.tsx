import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { GeminiConnection } from "@/components/gemini-connection";

export const metadata: Metadata = {
  title: "Gemini connection",
};

export default function ApiKeyPage() {
  return (
    <HydrationGate><AppShell active="profile"><div className="page-shell narrow-shell">
      <span className="eyebrow">Optional setting</span>
      <h1>Your Gemini connection</h1>
      <p>Choose how you connect to AI for prompt feedback, assistant tests and classroom drafts.</p>
      <GeminiConnection />
      <div className="privacy-notice" role="note"><strong>What happens when you check a prompt?</strong><p>Your task, prompt and feedback are saved privately to your account so you can return to them. Live AI requests send only the material needed for that task to Gemini. Always use fictional examples and review the result before classroom use.</p></div>
    </div></AppShell></HydrationGate>
  );
}
