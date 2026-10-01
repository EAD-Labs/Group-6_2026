"use client";

import { useFormStatus } from "react-dom";
import { Icon, type IconName } from "./icon";

export function PendingSubmit({ children, pendingLabel, className = "button button-primary button-full", icon = "arrow-right" }: { children: React.ReactNode; pendingLabel: string; className?: string; icon?: IconName }) {
  const { pending } = useFormStatus();
  return <button className={className} disabled={pending} type="submit" aria-busy={pending}>{pending ? pendingLabel : children}<Icon name={icon} /></button>;
}
