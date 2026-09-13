import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--bg)] px-6 text-center text-[var(--text)]">
      <h1 className="font-gurmukhi text-2xl">ਅੰਗ ਨਹੀਂ ਮਿਲਿਆ</h1>
      <p className="text-[var(--text-muted)]">
        That Ang number is out of range. Sri Guru Granth Sahib Ji spans Ang 1 to 1430.
      </p>
      <Link
        href="/ang/1"
        className="mt-2 rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
      >
        Go to Ang 1
      </Link>
    </div>
  );
}
