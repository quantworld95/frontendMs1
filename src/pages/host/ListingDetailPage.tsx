import { ArrowLeft, Bath, BedDouble, Car, Check, Edit3, Fan, Laptop, MapPin, Microwave, Refrigerator, Tv, Users, WashingMachine, Wifi, type LucideIcon } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { useDemoAuth } from '@/hooks/useDemoAuth';
import { useListingWizard } from '@/hooks/useListingWizard';
import { getListingById, toWizardData } from '@/services/listings';
import HotelListingDetailPage from '@/pages/host/HotelListingDetailPage';

const amenityIcons: Record<string, LucideIcon> = {
  'Wi-Fi': Wifi,
  'Aire acondicionado': Fan,
  'Cocina equipada': Microwave,
  Estacionamiento: Car,
  Lavadora: WashingMachine,
  Secadora: Refrigerator,
  TV: Tv,
  'Espacio de trabajo': Laptop,
  'Baño privado': Bath,
};

export default function ListingDetailPage() {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { session, logout } = useDemoAuth();
  const { savedListing, startEditing } = useListingWizard();
  const listing = getListingById(listingId || '', savedListing);
  const [activeTab, setActiveTab] = useState('Información');
  const tabs = ['Información', 'Ubicación', 'Precio y condiciones'];

  if (!listing) {
    return <AppLayout hostName={session?.name} onLogout={logout}><div className="py-16 text-center"><h1 className="text-xl font-bold">No encontramos este alojamiento</h1><Link to="/host/listings" className="mt-4 inline-flex text-sm font-semibold text-brand-primary">Volver a mis alojamientos</Link></div></AppLayout>;
  }

  if (listing.category === 'Hotel' || listing.category === 'Hostal') {
    return <HotelListingDetailPage listing={listing} listingId={listingId || ''} />;
  }

  const statusStyles = listing.status === 'Publicado'
    ? 'bg-emerald-50 text-emerald-700'
    : listing.status === 'Pendiente'
      ? 'bg-amber-50 text-amber-700'
      : listing.status === 'Rechazado'
        ? 'bg-rose-50 text-rose-700'
        : 'bg-slate-100 text-slate-600';
  const heroPhoto = listing.photos[0];

  return <AppLayout hostName={session?.name} onLogout={logout}>
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3"><Link to="/host/listings" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-secondary hover:text-ink-primary"><ArrowLeft className="h-4 w-4" />Mis alojamientos</Link><div className="flex gap-2"><Button type="button" variant="primary" size="md" leftIcon={<Edit3 className="h-4 w-4" />} onClick={() => { startEditing(listingId || 'created-listing', toWizardData(listing)); navigate('/host/listings/new/step-2'); }}>Editar alojamiento</Button></div></div>
      <div className="grid gap-6">
        <div className="min-w-0"><div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card"><div className="aspect-[16/9] bg-surface-secondary">{heroPhoto ? <img src={heroPhoto} alt={listing.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-ink-secondary">Aún no hay fotografías</div>}</div>{listing.photos.length > 1 && <div className="grid grid-cols-4 gap-2 border-t border-line p-2">{listing.photos.slice(0, 4).map((photo, index) => <img key={`${photo}-${index}`} src={photo} alt={`${listing.name} ${index + 1}`} className="aspect-[4/3] w-full rounded-lg object-cover" />)}</div>}<div className="p-5 sm:p-7"><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">{listing.name}</h1><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles}`}>{listing.status}</span></div><p className="mt-2 flex items-center gap-2 text-sm text-ink-secondary"><MapPin className="h-4 w-4 text-brand-primary" />{listing.location}</p><div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-ink-secondary"><span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-brand-primary" />{listing.guests} huéspedes</span><span className="inline-flex items-center gap-2"><BedDouble className="h-4 w-4 text-brand-primary" />{listing.beds} camas</span><span className="inline-flex items-center gap-2"><Bath className="h-4 w-4 text-brand-primary" />{listing.bathrooms} baños</span></div><p className="mt-5 text-sm leading-6 text-ink-secondary">{listing.description}</p>{listing.stayConditions && <div className="mt-5 rounded-xl bg-surface-secondary p-4"><h2 className="font-bold text-ink-primary">Condiciones generales de estadía</h2><p className="mt-2 text-sm leading-6 text-ink-secondary">{listing.stayConditions}</p></div>}</div></div></div>
      </div>
      <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="flex gap-5 overflow-x-auto border-b border-line px-5 sm:px-7">
          {tabs.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`shrink-0 border-b-2 py-4 text-sm font-semibold transition ${activeTab === tab ? 'border-brand-primary text-brand-primary' : 'border-transparent text-ink-secondary hover:text-ink-primary'}`}>{tab}</button>)}
        </div>
        <div className="p-5 sm:p-7 [&>div]:gap-y-10 [&>div>div:nth-child(3)]:border-t [&>div>div:nth-child(3)]:border-line [&>div>div:nth-child(3)]:pt-8">
          {activeTab === 'Información' && <div className="grid gap-8 sm:grid-cols-2"><div><div className="flex items-center justify-between"><h2 className="font-bold text-ink-primary">Descripción</h2></div><p className="mt-3 text-sm leading-6 text-ink-secondary">{listing.description}</p></div><div><h2 className="font-bold text-ink-primary">Características</h2><div className="mt-4 grid gap-3 text-sm text-ink-secondary"><span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-brand-primary" />{listing.guests} huéspedes</span><span className="inline-flex items-center gap-2"><BedDouble className="h-4 w-4 text-brand-primary" />{listing.bedrooms} dormitorios y {listing.beds} camas</span><span className="inline-flex items-center gap-2"><Bath className="h-4 w-4 text-brand-primary" />{listing.bathrooms} baños</span></div></div><div className="sm:col-span-2"><h2 className="font-bold text-ink-primary">Servicios y comodidades</h2>{listing.amenities.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{listing.amenities.map((amenity) => { const AmenityIcon = amenityIcons[amenity] || Check; return <span key={amenity} className="inline-flex items-center gap-3 text-sm text-ink-secondary"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-light/60 text-brand-primary"><AmenityIcon className="h-4 w-4" /></span>{amenity}</span>; })}</div> : <p className="mt-3 text-sm text-ink-secondary">No se han agregado servicios todavía.</p>}</div></div>}
          {activeTab === 'Ubicación' && <div><h2 className="font-bold text-ink-primary">Ubicación del alojamiento</h2><div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"><div className="space-y-3"><div className="rounded-xl border border-line p-4"><p className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">Dirección</p><p className="mt-2 flex items-start gap-2 text-sm font-semibold text-ink-primary"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />{listing.address || 'No se indicó una dirección.'}</p></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-line p-4"><p className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">País</p><p className="mt-2 text-sm font-semibold text-ink-primary">{listing.country}</p></div><div className="rounded-xl border border-line p-4"><p className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">Ciudad</p><p className="mt-2 text-sm font-semibold text-ink-primary">{listing.city}</p></div></div><div className="rounded-xl border border-line p-4"><p className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">Barrio o zona</p><p className="mt-2 text-sm font-semibold text-ink-primary">{listing.neighborhood || 'No especificado'}</p></div></div><div className="relative min-h-[260px] overflow-hidden rounded-xl border border-line bg-[#e8f0ee]" aria-label={`Mapa de ${listing.location}`}><div className="absolute inset-0 opacity-70" style={{ backgroundImage: 'linear-gradient(32deg, transparent 44%, #d3dfdb 45%, #d3dfdb 47%, transparent 48%), linear-gradient(118deg, transparent 44%, #cbd9d5 45%, #cbd9d5 47%, transparent 48%)', backgroundSize: '110px 80px' }} /><div className="absolute left-[18%] top-[30%] h-1 w-[68%] rotate-12 rounded-full bg-white/80" /><div className="absolute left-[8%] top-[62%] h-1 w-[82%] -rotate-6 rounded-full bg-white/80" /><div className="absolute left-[48%] top-[42%] flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg ring-8 ring-brand-primary/20"><MapPin className="h-6 w-6" /></div><div className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-ink-primary shadow-sm">{listing.location}</div></div></div></div>}
          {activeTab === 'Precio y condiciones' && <div className="grid gap-8 sm:grid-cols-2"><div><h2 className="font-bold text-ink-primary">Precio</h2><div className="mt-4 grid gap-3 text-sm text-ink-secondary"><span className="inline-flex items-center gap-2"><span className="font-semibold text-ink-primary">Bs. {listing.price || '—'}</span> por noche</span><span className="inline-flex items-center gap-2">Estadía mínima de <span className="font-semibold text-ink-primary">{listing.minimumStay} {listing.minimumStay === 1 ? 'noche' : 'noches'}</span></span></div></div><div><h2 className="font-bold text-ink-primary">Descuentos</h2><div className="mt-4 grid gap-3 text-sm text-ink-secondary"><span className="inline-flex items-center gap-2">Semanal: <span className="font-semibold text-ink-primary">{listing.weeklyDiscount ? `${listing.weeklyDiscount}%` : 'Sin descuento'}</span></span><span className="inline-flex items-center gap-2">Mensual: <span className="font-semibold text-ink-primary">{listing.monthlyDiscount ? `${listing.monthlyDiscount}%` : 'Sin descuento'}</span></span></div></div><div className="sm:col-span-2 [&>div>span:nth-child(3)]:before:content-['Políticas'] [&>div>span:nth-child(3)]:before:block [&>div>span:nth-child(3)]:before:text-xs [&>div>span:nth-child(3)]:before:font-semibold [&>div>span:nth-child(3)]:before:uppercase [&>div>span:nth-child(3)]:before:tracking-wide [&>div>span:nth-child(3)]:before:text-ink-secondary"><h2 className="font-bold text-ink-primary">Condiciones de estadía</h2><div className="mt-4 grid gap-3 text-sm text-ink-secondary sm:grid-cols-2"><span className="inline-flex items-center gap-2">Horario de entrada: <span className="font-semibold text-ink-primary">{listing.checkIn}</span></span><span className="inline-flex items-center gap-2">Horario de salida: <span className="font-semibold text-ink-primary">{listing.checkOut}</span></span><span className="inline-flex flex-col items-start gap-1 before:content-['Condiciones'] before:text-xs before:font-semibold before:uppercase before:tracking-wide before:text-ink-secondary">Política de cancelación: <span className="font-semibold text-ink-primary">{listing.cancellation}</span></span></div></div></div>}
        </div>
      </section>
    </div>
  </AppLayout>;
}
