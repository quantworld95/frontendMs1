import type { ReactNode } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';

interface AppLayoutProps {
  children: ReactNode;
  hostName?: string;
  onLogout?: () => void;
}

export function AppLayout({ children, hostName, onLogout }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-surface-secondary">
      <AppHeader hostName={hostName} onLogout={onLogout} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

export default AppLayout;
