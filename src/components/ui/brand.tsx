import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand" href={compact ? "/dashboard" : "/"}>
      <span className="brand-mark" aria-hidden="true">
        प
      </span>
      <span>
        <strong>PromptShala</strong>
        {!compact ? <small>AI literacy for educators</small> : null}
      </span>
    </Link>
  );
}
