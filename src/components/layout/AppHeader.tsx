import { NavLink, Link } from 'react-router-dom';
import { Home, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';

interface AppHeaderProps {
  hostName?: string;
  onLogout?: () => void;
}

const navItems = [
  { to: '/host/listings', label: 'Mis alojamientos', icon: Home },
];

export function AppHeader({ hostName = 'Anfitrión demo', onLogout }: AppHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface-base/90 backdrop-blur">
      <div className="flex h-16 w-full items-center justify-between px-5 sm:px-8 lg:px-12">
        <div className="flex shrink-0 items-center gap-8">
          <Link to="/host" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-white">
              <Home className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-ink-primary">Aloja-Te</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-light text-brand-primary'
                      : 'text-ink-secondary hover:bg-surface-secondary hover:text-ink-primary',
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden shrink-0 md:flex items-center gap-3">
          <span className="text-sm text-ink-secondary">{hostName}</span>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-secondary hover:bg-surface-secondary hover:text-ink-primary"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </div>

        <button
          className="md:hidden inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-ink-secondary hover:bg-surface-secondary"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menú"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-line bg-surface-base px-5 py-3 space-y-1 sm:px-8 lg:px-12">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium',
                  isActive ? 'bg-brand-light text-brand-primary' : 'text-ink-secondary hover:bg-surface-secondary',
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
          <div className="pt-2 mt-2 border-t border-line flex items-center justify-between">
            <span className="text-sm text-ink-secondary">{hostName}</span>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-secondary hover:bg-surface-secondary"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default AppHeader;
