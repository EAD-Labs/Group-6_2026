"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { signOut } from "@/app/sign-in/actions";
import { useDemo } from "@/features/demo/demo-provider";
import { CourseNavigation } from "./course-navigation";
import { SyncStatus } from "./sync-status";
import { Brand } from "./ui/brand";
import { Icon, type IconName } from "./ui/icon";

type NavigationItem = { href: "/dashboard" | "/learn/module-1" | "/progress" | "/profile"; icon: IconName; id: "home" | "learn" | "progress" | "profile"; label: string };
const navigationItems: NavigationItem[] = [
  { href: "/dashboard", icon: "home", id: "home", label: "Home" },
  { href: "/learn/module-1", icon: "book", id: "learn", label: "Learn" },
  { href: "/progress", icon: "progress", id: "progress", label: "Progress" },
  { href: "/profile", icon: "user", id: "profile", label: "Profile" },
];

function NavigationDialog({ label, children, onClose }: { label: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const trigger = document.activeElement as HTMLElement | null;
    dialog?.showModal?.();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; dialog?.close?.(); trigger?.focus(); };
  }, []);
  return <dialog aria-label={label} className="navigation-dialog" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} ref={ref}>{children}</dialog>;
}

export function AppShell({ active, children, contentClassName = "" }: { active: NavigationItem["id"] | "staff"; children: ReactNode; contentClassName?: string }) {
  const { state, isPresentationDemo, role, syncStatus } = useDemo();
  const [primaryOpen, setPrimaryOpen] = useState(false);
  const [courseOpen, setCourseOpen] = useState(false);
  const isLearning = active === "learn";
  const staff = role === "facilitator" || role === "content_manager" || role === "admin";
  const modeLabel = isPresentationDemo ? "Presentation demo" : role === "admin" ? "Administrator" : role === "facilitator" ? "Facilitator" : role === "content_manager" ? "Content manager" : "Teacher workspace";
  const navigation = <><Brand compact /><nav aria-label="Main pages">{navigationItems.map((item) => <Link aria-current={active === item.id ? "page" : undefined} className={active === item.id ? "nav-link active" : "nav-link"} href={item.href} key={item.id} onClick={() => setPrimaryOpen(false)}><Icon name={item.icon} /><span>{item.label}</span></Link>)}</nav>{staff ? <div className="staff-navigation"><Link aria-current={active === "staff" ? "page" : undefined} className={active === "staff" ? "nav-link active" : "nav-link"} href="/admin"><Icon name="document" />Staff workspace</Link></div> : null}<div className="side-navigation-footer"><span className="demo-chip"><span aria-hidden="true" />{modeLabel}</span><Link className="nav-link" href="/help"><Icon name="info" />Help and user guide</Link><form action={signOut} onSubmit={() => window.dispatchEvent(new Event("promptshala:signout"))}><button className="nav-link nav-button" type="submit"><Icon name="logout" /><span>Sign out</span></button></form></div></>;

  return <div className={isLearning ? "app-frame course-frame" : "app-frame"}>
    {isLearning ? <CourseNavigation mobileOpen={false} onClose={() => undefined} /> : <aside className="side-navigation" aria-label="Primary navigation">{navigation}</aside>}
    {primaryOpen ? <NavigationDialog label="Main menu" onClose={() => setPrimaryOpen(false)}><div className="side-navigation course-primary-drawer"><button className="course-primary-close" type="button" onClick={() => setPrimaryOpen(false)} autoFocus><Icon name="x" />Close menu</button>{navigation}</div></NavigationDialog> : null}
    {courseOpen ? <NavigationDialog label="Course contents" onClose={() => setCourseOpen(false)}><CourseNavigation id="mobile-course-navigation" mobileOpen onClose={() => setCourseOpen(false)} /></NavigationDialog> : null}
    <div className="app-stage">
      <header className="top-navigation">
        {isLearning ? <div className="course-top-actions"><button className="course-top-button" type="button" aria-label="Open main menu" aria-haspopup="dialog" aria-expanded={primaryOpen} onClick={() => setPrimaryOpen(true)}><Icon name="menu" /><span>Menu</span></button><button className="course-top-button course-contents-button" type="button" aria-haspopup="dialog" aria-expanded={courseOpen} onClick={() => setCourseOpen(true)}><Icon name="book" /><span>Contents</span></button><nav className="course-shortcuts" aria-label="Workspace navigation"><Link href="/dashboard">Home</Link><Link href="/progress">My progress</Link>{staff ? <Link href="/admin">Staff workspace</Link> : null}</nav></div> : <span className="workspace-caption">{modeLabel}</span>}
        <div className="top-account"><SyncStatus /><Link className="avatar-button" href="/profile" aria-label={`Open profile for ${state.displayName || "teacher"}`}><span aria-hidden="true">{(state.displayName || "T").slice(0, 1).toUpperCase()}</span></Link></div>
      </header>
      {syncStatus === "error" || syncStatus === "offline" || syncStatus === "unauthenticated" || syncStatus === "conflict" ? <div className="sync-banner"><SyncStatus detailed /></div> : null}
      <main className={`app-content ${contentClassName}`.trim()} id="main-content" tabIndex={-1}>{children}</main>
    </div>
    <nav className="bottom-navigation" aria-label="Mobile navigation">{navigationItems.map((item) => <Link aria-current={active === item.id ? "page" : undefined} className={active === item.id ? "bottom-nav-link active" : "bottom-nav-link"} href={item.href} key={item.id}><Icon name={item.icon} /><span>{item.label}</span></Link>)}</nav>
  </div>;
}
