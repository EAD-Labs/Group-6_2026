"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { signOut } from "@/app/sign-in/actions";
import { useDemo } from "@/features/demo/demo-provider";

import { Brand } from "./ui/brand";
import { Icon, type IconName } from "./ui/icon";

type NavigationItem = {
  href: "/dashboard" | "/learn/module-1" | "/progress" | "/profile";
  icon: IconName;
  id: "home" | "learn" | "progress" | "profile";
  label: string;
};

const navigationItems: NavigationItem[] = [
  { href: "/dashboard", icon: "home", id: "home", label: "Home" },
  { href: "/learn/module-1", icon: "book", id: "learn", label: "Learn" },
  { href: "/progress", icon: "progress", id: "progress", label: "Progress" },
  { href: "/profile", icon: "user", id: "profile", label: "Profile" },
];

export function AppShell({
  active,
  children,
}: {
  active: NavigationItem["id"];
  children: ReactNode;
}) {
  const { state } = useDemo();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const updateConnection = () => setOnline(window.navigator.onLine);
    updateConnection();
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
    };
  }, []);

  return (
    <div className="app-frame">
      <aside className="side-navigation" aria-label="Primary navigation">
        <Brand compact />
        <nav>
          {navigationItems.map((item) => (
            <Link
              aria-current={active === item.id ? "page" : undefined}
              className={active === item.id ? "nav-link active" : "nav-link"}
              href={item.href}
              key={item.id}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="side-navigation-footer">
          <span className="demo-chip">
            <span aria-hidden="true" /> Presentation demo
          </span>
          <form action={signOut}>
            <button className="nav-link nav-button" type="submit">
              <Icon name="logout" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </aside>

      <div className="app-stage">
        {!online ? (
          <div className="offline-banner" role="status">
            <Icon name="wifi-off" />
            <span>
              You’re offline. Your work stays on this device and syncs when you reconnect.
            </span>
          </div>
        ) : null}
        <header className="top-navigation">
          <div>
            <span className="mobile-brand">PromptShala</span>
            <span className="demo-chip desktop-demo-chip">
              <span aria-hidden="true" /> Presentation demo
            </span>
          </div>
          <Link className="avatar-button" href="/profile" aria-label="Open profile">
            <span aria-hidden="true">{state.displayName.slice(0, 1).toUpperCase()}</span>
          </Link>
        </header>

        <main className="app-content" id="main-content">
          {children}
        </main>
      </div>

      <nav className="bottom-navigation" aria-label="Mobile navigation">
        {navigationItems.map((item) => (
          <Link
            aria-current={active === item.id ? "page" : undefined}
            className={active === item.id ? "bottom-nav-link active" : "bottom-nav-link"}
            href={item.href}
            key={item.id}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
