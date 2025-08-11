import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <h1>MyVillupuram Admin</h1>
      <p>Manage content for the community.</p>
      <nav>
        <Link href="/news">News</Link>
        <Link href="/directory">Directory</Link>
        <Link href="/jobs">Jobs</Link>
        <Link href="/marketplace">Marketplace</Link>
        <Link href="/transport">Transport</Link>
      </nav>
      <p>Use the tabs to manage data. Only admins should have access.</p>
    </div>
  );
}