import Image from "next/image";
import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link aria-label="PromptShala — Code your brighter tomorrow" className={compact ? "brand brand-compact" : "brand"} href={compact ? "/dashboard" : "/"}>
      <Image alt="PromptShala — Code your brighter tomorrow" className="brand-logo" height={724} priority src="/brand/promptshala-logo.png" width={2172} />
    </Link>
  );
}
