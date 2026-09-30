"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { signOut } from "@/app/sign-in/actions";
import { useDemo } from "@/features/demo/demo-provider";

import { CourseNavigation } from "./course-navigation";
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
  const [primaryOpen, setPrimaryOpen] = useState(false);
  const [courseOpen, setCourseOpen] = useState(false);
  const primaryCloseRef = useRef<HTMLButtonElement>(null);
  const primaryTriggerRef = useRef<HTMLButtonElement>(null);
  const isLearning = active === "learn";

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

  useEffect(() => {
    if (!primaryOpen) return;
    primaryCloseRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPrimaryOpen(false);
        primaryTriggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [primaryOpen]);

  return (
    <div className={isLearning ? "app-frame course-frame" : "app-frame"}>
      {isLearning ? <CourseNavigation mobileOpen={courseOpen} onClose={() => setCourseOpen(false)} /> : null}
      {isLearning && courseOpen ? <button className="course-navigation-backdrop" type="button" aria-label="Close course contents" onClick={() => setCourseOpen(false)} /> : null}
      {isLearning && primaryOpen ? <button className="primary-navigation-backdrop" type="button" aria-label="Close main menu" onClick={() => setPrimaryOpen(false)} /> : null}
      {(!isLearning || primaryOpen) ? <aside className={isLearning ? "side-navigation course-primary-drawer" : "side-navigation"} aria-label="Primary navigation">
        {isLearning ? <button className="course-primary-close" type="button" onClick={() => { setPrimaryOpen(false); primaryTriggerRef.current?.focus(); }} ref={primaryCloseRef}><Icon name="x" /> Close menu</button> : null}
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
      </aside> : null}

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
          {isLearning ? <div className="course-top-actions"><button className="course-top-button" type="button" aria-label="Open main menu" aria-expanded={primaryOpen} onClick={() => setPrimaryOpen(true)} ref={primaryTriggerRef}><Icon name="menu" /><span>Menu</span></button><button className="course-top-button course-contents-button" type="button" aria-controls="course-navigation" aria-expanded={courseOpen} onClick={() => setCourseOpen(true)}><Icon name="book" /><span>Contents</span></button><span className="course-top-caption">Learning pathway</span></div> : <div>
            <span className="mobile-brand">PromptShala</span>
            <span className="demo-chip desktop-demo-chip">
              <span aria-hidden="true" /> Presentation demo
            </span>
          </div>}
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
