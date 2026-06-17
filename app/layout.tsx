import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Report Workflow Hackthon',
  description: 'Fill, navigate, and view report workflow app.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
