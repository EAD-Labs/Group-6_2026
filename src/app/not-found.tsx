import Link from "next/link";

export default function NotFound() {
  return (
    <main className="centered-state">
      <div>
        <p className="eyebrow">Page not found</p>
        <h1>This lesson is not available.</h1>
        <Link className="button button-primary" href="/">
          Return home
        </Link>
      </div>
    </main>
  );
}
