import { useState, type ReactNode } from 'react';
import { ArrowLeft, Bath, BedDouble, Check, Image as ImageIcon, Users, Wifi } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useDemoAuth } from '@/hooks/useDemoAuth';
import { getRoomTypes } from '@/services/roomTypes';

const tabs = ['Información', 'Características y precio', 'Servicios'];

export default function RoomTypeDetailPage() {
  const { listingId = '', roomId = '' } = useParams<{ listingId: string; roomId: string }>();
  const navigate = useNavigate();
  const { session, logout } = useDemoAuth();
  const room = getRoomTypes(listingId).find((item) => item.id === roomId);
  const [activeTab, setActiveTab] = useState('Información');

  if (!room) return <AppLayout hostName={session?.name} onLogout={logout}><div className="py-16 text-center"><h1 className="text-xl font-bold text-ink-primary">No encontramos esta habitación</h1><Link to={`/host/listings/${listingId}`} className="mt-4 inline-flex text-sm font-semibold text-brand-primary">Volver al hotel</Link></div></AppLayout>;

  const heroPhoto = room.photo;

  return <AppLayout hostName={session?.name} onLogout={logout}>
    <div className="space-y-5 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={() => navigate(`/host/listings/${listingId}`)} className="inline-flex items-center gap-2 text-sm font-semibold text-ink-secondary hover:text-ink-primary"><ArrowLeft className="h-4 w-4" />Detalle del hotel</button></div>
      <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card"><div className="grid gap-3 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_360px]">{heroPhoto ? <img src={heroPhoto} alt={room.name} className="aspect-[16/8] w-full rounded-xl object-cover" /> : <div className="flex aspect-[16/8] items-center justify-center rounded-xl bg-surface-secondary text-ink-secondary"><ImageIcon className="h-8 w-8" /></div>}<div className="grid grid-cols-2 gap-2">{[0, 1, 2, 3].map((index) => heroPhoto ? <img key={index} src={heroPhoto} alt={`${room.name} ${index + 1}`} className="aspect-[4/3] w-full rounded-lg object-cover" /> : <div key={index} className="flex aspect-[4/3] items-center justify-center rounded-lg bg-surface-secondary text-ink-secondary"><ImageIcon className="h-5 w-5" /></div>)}</div></div><div className="px-5 pb-6 sm:px-7"><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">{room.name}</h1><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{room.status}</span></div><p className="mt-2 flex items-center gap-2 text-sm text-ink-secondary"><BedDouble className="h-4 w-4 text-brand-primary" />Tipo de habitación del establecimiento</p><div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-ink-secondary"><span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-brand-primary" />{room.capacity} huéspedes</span><span className="inline-flex items-center gap-2"><BedDouble className="h-4 w-4 text-brand-primary" />{room.beds}</span><span className="inline-flex items-center gap-2"><Bath className="h-4 w-4 text-brand-primary" />{room.bathrooms} baños</span><span>{room.units} habitaciones</span></div></div><div className="mx-4 flex gap-5 overflow-x-auto rounded-2xl border border-line bg-white px-5 shadow-card sm:mx-5 sm:px-7">{tabs.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`shrink-0 border-b-2 py-4 text-sm font-semibold transition ${activeTab === tab ? 'border-brand-primary text-brand-primary' : 'border-transparent text-ink-secondary hover:text-ink-primary'}`}>{tab}</button>)}</div></section>
      <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-7">
        {activeTab === 'Información' && <div><h2 className="text-xl font-bold text-ink-primary">Información de la habitación</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-ink-secondary">{room.description || `${room.name} es una opción preparada para alojar hasta ${room.capacity} huéspedes, con ${room.beds} y ${room.bathrooms} ${room.bathrooms === 1 ? 'baño' : 'baños'}.`}</p><div className="mt-6 grid gap-4 sm:grid-cols-3"><InfoCard icon={<Users className="h-5 w-5" />} label="Capacidad" value={`${room.capacity} huéspedes`} /><InfoCard icon={<BedDouble className="h-5 w-5" />} label="Camas" value={room.beds} /><InfoCard icon={<Bath className="h-5 w-5" />} label="Baños" value={String(room.bathrooms)} /></div></div>}
        {activeTab === 'Características y precio' && <div><h2 className="text-xl font-bold text-ink-primary">Características y precio</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><InfoCard icon={<Users className="h-5 w-5" />} label="Capacidad de huéspedes" value={`${room.capacity} personas`} /><InfoCard icon={<BedDouble className="h-5 w-5" />} label="Cantidad de unidades" value={`${room.units} habitaciones`} /><InfoCard icon={<Bath className="h-5 w-5" />} label="Número de baños" value={String(room.bathrooms)} /><div className="rounded-xl bg-brand-light/60 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">Precio por noche</p><p className="mt-2 text-2xl font-bold text-ink-primary">Bs {room.price}</p></div></div></div>}
        {activeTab === 'Servicios' && <div><h2 className="text-xl font-bold text-ink-primary">Servicios de la habitación</h2>{room.services?.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2">{room.services.map((service) => <span key={service} className="inline-flex items-center gap-3 rounded-xl border border-line p-4 text-sm font-semibold text-ink-primary"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-light/60 text-brand-primary"><Wifi className="h-4 w-4" /></span><Check className="ml-auto h-4 w-4 text-emerald-600" />{service}</span>)}</div> : <p className="mt-4 text-sm text-ink-secondary">No se han agregado servicios para esta habitación.</p>}</div>}
        {activeTab === 'Fotos' && <div><h2 className="text-xl font-bold text-ink-primary">Fotos de la habitación</h2>{heroPhoto ? <img src={heroPhoto} alt={room.name} className="mt-5 max-h-[480px] w-full rounded-xl object-cover" /> : <div className="mt-5 rounded-xl border border-dashed border-line bg-surface-secondary p-12 text-center text-sm text-ink-secondary">Aún no hay fotografías registradas.</div>}</div>}
      </section>
    </div>
  </AppLayout>;
}

function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="rounded-xl border border-line p-4"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-light/60 text-brand-primary">{icon}</span><p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-secondary">{label}</p><p className="mt-1 font-bold text-ink-primary">{value}</p></div>;
}
