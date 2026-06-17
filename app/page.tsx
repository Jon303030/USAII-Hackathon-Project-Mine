import Link from 'next/link';
import { FileEdit, FileStack, Search, Users } from 'lucide-react';
import { TopNav } from '@/components/TopNav';

const modules = [
  {
    href: '/fill',
    title: 'Form Fill',
    body: 'Answer three chatbot prompts with tap, text, or voice. Review the filled result right away.',
    icon: FileEdit,
  },
  {
    href: '/navigate',
    title: 'Navigator',
    body: 'Answer three guided questions, extract keywords, and open the right report.',
    icon: Search,
  },
  {
    href: '/view',
    title: 'Form Viewer',
    body: 'Upload, preview, extract, delete, merge, and download PDF files from the PVC workspace.',
    icon: FileStack,
  },
  {
    href: '/user-management',
    title: 'User Management',
    body: 'Add users, review access, and keep roles simple: user or admin.',
    icon: Users,
  },
];

export default function HomePage() {
  return (
    <main className="shell">
      <TopNav />
      <section className="container">
        <div className="dashboard-hero">
          <div>
            <h1>Dashboard</h1>
            <p>Form filling, report navigation, PDF viewing, and user access in one clean workspace.</p>
          </div>
          <span className="hero-badge">Node.js 22 / Port 8000</span>
        </div>

        <div className="dashboard-grid">
          {modules.map((item) => {
            const Icon = item.icon;
            return (
              <Link className="module-card" href={item.href} key={item.href}>
                <div>
                  <h2 className="module-title">
                    <span className="icon-pill">
                      <Icon size={22} />
                    </span>
                    {item.title}
                  </h2>
                  <p>{item.body}</p>
                </div>
                <span className="status">Open</span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
