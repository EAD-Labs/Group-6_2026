"use client";

import { useState, useSyncExternalStore } from "react";

const apiKeySessionKey = "promptshala:gemini-api-key";
const apiKeyChangeEvent = "promptshala:api-key-change";

function subscribeToApiKey(callback: () => void) {
  window.addEventListener(apiKeyChangeEvent, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(apiKeyChangeEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

function getApiKeySnapshot() {
  return Boolean(window.sessionStorage.getItem(apiKeySessionKey));
}

export function ApiKeyForm() {
  const [apiKey, setApiKey] = useState("");
  const isSaved = useSyncExternalStore(
    subscribeToApiKey,
    getApiKeySnapshot,
    () => false,
  );

  function saveKey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedKey = apiKey.trim();

    if (!trimmedKey) {
      return;
    }

    window.sessionStorage.setItem(apiKeySessionKey, trimmedKey);
    setApiKey("");
    window.dispatchEvent(new Event(apiKeyChangeEvent));
  }

  function clearKey() {
    window.sessionStorage.removeItem(apiKeySessionKey);
    setApiKey("");
    window.dispatchEvent(new Event(apiKeyChangeEvent));
  }

  return (
    <div>
      <div className="privacy-notice" role="note">
        <strong>Your key is not saved to your PromptShala account.</strong>
        <p>
          It stays in this browser tab session only and is cleared when the tab
          session ends or when you choose Remove key. Never share it in a lesson,
          screenshot, support message, or classroom prompt.
        </p>
      </div>
      <form className="form-stack" onSubmit={saveKey}>
        <label>
          Gemini API key
          <input
            autoComplete="off"
            name="api-key"
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="Paste your key"
            type="password"
            value={apiKey}
          />
        </label>
        <div className="button-row">
          <button className="button button-primary" type="submit">
            Use for this session
          </button>
          {isSaved ? (
            <button className="button button-secondary" onClick={clearKey} type="button">
              Remove key
            </button>
          ) : null}
        </div>
      </form>
      <p aria-live="polite" className="form-note">
        {isSaved ? "A key is available for this tab session." : "No key is stored."}
      </p>
    </div>
  );
}
