"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemo } from "@/features/demo/demo-provider";
import { useGeminiKey } from "./gemini-key-provider";
import { geminiKeyMaxLength, isValidGeminiKey } from "@/lib/ai/gemini-key";
import { Icon } from "./ui/icon";
import "./practice-settings.css";

export function GeminiConnection() {
  const { participantId } = useDemo();
  const { enabled, setKey, clearKey } = useGeminiKey();
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("");
  const invalid = Boolean(draft && !isValidGeminiKey(draft.trim()));

  function connect(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setKey(draft); setDraft("");
      setMessage("Your key is ready. Your next AI request will use it.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Check your key and try again."); }
  }

  return <section className="gemini-connection-card" aria-labelledby="connection-title">
    <div className="gemini-connection-status"><span className={enabled ? "connection-dot connected" : "connection-dot"} /><span>{enabled ? "Your key is ready for AI requests" : "No personal key added"}</span></div>
    <h2 id="connection-title">Have your own Gemini key?</h2>
    <p>This is optional. A key is a private code from Google that lets these tools use your Gemini account. Without one, we use the course’s AI connection when available. You can still learn and check prompts with the course checklist when AI is unavailable.</p>
    <details className="gemini-key-help"><summary>Where do I find a key?</summary><p>Visit <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">Google AI Studio</a> with your approved Google account. Create or copy a Gemini API key, then paste it here. You can also follow <a href="https://ai.google.dev/gemini-api/docs/api-key" target="_blank" rel="noreferrer">Google’s key guide</a>.</p></details>
    {participantId ? <form onSubmit={connect}>
      <label htmlFor="gemini-key">Your Gemini API key</label>
      <input id="gemini-key" type="password" value={draft} onChange={(event) => { setDraft(event.target.value); setMessage(""); }} autoComplete="off" spellCheck={false} maxLength={geminiKeyMaxLength} placeholder="Paste your key here" aria-describedby="gemini-key-help" aria-invalid={invalid} />
      <p id="gemini-key-help" className="draft-note">{invalid ? "Copy the whole key, without spaces." : "Kept only in this open tab. Add it again after refreshing or signing out."}</p>
      <div className="platform-actions"><button className="button button-primary" disabled={!draft.trim() || invalid} type="submit">{enabled ? "Replace my key" : "Use my key"}<Icon name="arrow-right" /></button>{enabled ? <button className="button button-secondary" type="button" onClick={() => { clearKey(); setDraft(""); setMessage("Your key was removed. The course’s AI connection will be used when available."); }}>Remove my key</button> : null}</div>
    </form> : <Link className="button button-primary" href="/sign-in">Sign in to add a key<Icon name="arrow-right" /></Link>}
    {message ? <p className="feedback-box supportive" role="status">{message}</p> : null}
    <div className="privacy-mini"><Icon name="shield" /><p><strong>Your key stays private.</strong><br />We do not save it in your account or on this device. It is sent securely to our server only with an AI request, then used to contact Google. Google’s usage limits and charges apply to your key.</p></div>
  </section>;
}
