import Link from "next/link";

export default function Home() {
  return (
    <div className="flex h-fit gap-4">
      <Link href="/workflow-builder">workflow-builder</Link>
      <Link href="/module-management?returnTo=/">module-management</Link>
      <Link href="/dashboard">dashboard</Link>
    </div>
  );
}
