import Link from 'next/link';
import { FileEdit, Home, Search, SquareStack, Users } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function TopNav() {
  return (
    <header className="topbar">
      <Link className="brand" href="/">
        <span className="brand-mark">RW</span>
        <span>Report Workflow</span>
      </Link>
      <nav className="nav" aria-label="Primary navigation">
        <Link href="/" title="Main page">
          <Home size={17} />
          Main
        </Link>
        <Link href="/fill" title="Fill workflow">
          <FileEdit size={17} />
          Form Fill
        </Link>
        <Link href="/navigate" title="Navigate workflow">
          <Search size={17} />
          Navigator
        </Link>
        <Link href="/view" title="View workflow">
          <SquareStack size={17} />
          Form Viewer
        </Link>
        <Link href="/user-management" title="User management">
          <Users size={17} />
          Users
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
