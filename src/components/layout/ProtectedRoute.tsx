import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useDemoAuth } from '@/hooks/useDemoAuth';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session } = useDemoAuth();
  if (!session) return <Navigate to="/acceso" replace />;
  return <>{children}</>;
}

export default ProtectedRoute;
