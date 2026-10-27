import { Link } from 'react-router-dom';
import { Home, Building2, Hotel, BedDouble, ArrowRight, ShieldCheck } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useDemoAuth } from '@/hooks/useDemoAuth';

const modules = [
  { icon: Building2, title: 'Casas y departamentos', desc: 'Registro, detalle y edición de propiedades completas.' },
  { icon: Hotel, title: 'Hoteles y hostales', desc: 'Gestión de establecimientos con habitaciones múltiples.' },
  { icon: BedDouble, title: 'Tipos de habitación', desc: 'Define categorías de habitación dentro de tus establecimientos.' },
];

export default function HostHomePage() {
  const { session, logout } = useDemoAuth();

  return (
    <AppLayout hostName={session?.name} onLogout={logout}>
      <div className="space-y-8">
        <section className="card overflow-hidden">
          <div className="px-6 py-10 sm:px-10 sm:py-12 bg-gradient-to-br from-brand-light to-surface-base">
            <Badge tone="brand">
              <ShieldCheck className="h-3.5 w-3.5" />
              Panel del anfitrión · Demostración
            </Badge>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
              Bienvenido{session ? `, ${session.name}` : ''}.
            </h1>
            <p className="mt-3 max-w-xl text-ink-secondary">
              Gestiona tus alojamientos en Bolivia: casas, departamentos, hoteles, hostales y sus tipos de habitación.
              Esta es una demostración funcional del frontend con datos locales.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/host/listings"
                className="btn-primary"
              >
                Ver mis alojamientos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Módulos disponibles</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => (
              <Card key={m.title} className="p-5 transition-shadow hover:shadow-cardHover">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-brand-primary">
                  <m.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold">{m.title}</h3>
                <p className="mt-1 text-sm text-ink-secondary">{m.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="card p-5 flex items-start gap-3">
          <Home className="h-5 w-5 text-ink-secondary mt-0.5" />
          <p className="text-sm text-ink-secondary">
            Esta etapa inicial configura la base técnica del proyecto (enrutamiento, estilos y componentes base).
            Las páginas de gestión se desarrollarán en las siguientes secciones.
          </p>
        </section>
      </div>
    </AppLayout>
  );
}
