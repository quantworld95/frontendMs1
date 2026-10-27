import { useState, type ReactNode } from 'react';
import { ArrowLeft, Bath, BedDouble, Check, Edit3, MapPin, MoreHorizontal, Pencil, Plus, Trash2, Users, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { useDemoAuth } from '@/hooks/useDemoAuth';
import { useListingWizard } from '@/hooks/useListingWizard';
import { toWizardData, type DetailListing } from '@/services/listings';
import { deleteRoomType, getRoomTypes, saveRoomType, type RoomType } from '@/services/roomTypes';

interface HotelListingDetailPageProps {
  listing: DetailListing;
  listingId: string;
}

interface RoomForm {
  name: string;
  units: string;
  capacity: string;
  beds: string;
  bathrooms: string;
  price: string;
}

const defaultRoomForm: RoomForm = { name: '', units: '1', capacity: '2', beds: '1 cama matrimonial', bathrooms: '1', price: '' };

function statusClass(status: DetailListing['status']): string {
  if (status === 'Publicado') return 'bg-emerald-50 text-emerald-700';
  if (status === 'Pendiente') return 'bg-amber-50 text-amber-700';
  if (status === 'Rechazado') return 'bg-rose-50 text-rose-700';
  return 'bg-slate-100 text-slate-600';
}

export default function HotelListingDetailPage({ listing, listingId }: HotelListingDetailPageProps) {
  const navigate = useNavigate();
  const { session, logout } = useDemoAuth();
  const { startEditing } = useListingWizard();
  const [activeTab, setActiveTab] = useState('Habitaciones');
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(() => getRoomTypes(listingId));
  const [roomForm, setRoomForm] = useState<RoomForm>(defaultRoomForm);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);

  const establishmentLabel = listing.category === 'Hostal' ? 'hostal' : 'hotel';
  const tabs = ['Información', 'Habitaciones', 'Servicios', 'Ubicación', 'Fotos', 'Reglas'];
  const heroPhoto = listing.photos[0];

  const openRoomModal = (room?: RoomType) => {
    setEditingRoomId(room?.id ?? null);
    setRoomForm(room ? { name: room.name, units: String(room.units), capacity: String(room.capacity), beds: room.beds, bathrooms: String(room.bathrooms), price: room.price } : defaultRoomForm);
    setIsRoomModalOpen(true);
  };

  const saveRoom = () => {
    if (!roomForm.name.trim() || !roomForm.price.trim()) return;
    const nextRoom: RoomType = {
      id: editingRoomId ?? `room-${Date.now()}`,
      name: roomForm.name.trim(),
      units: Math.max(1, Number(roomForm.units) || 1),
      capacity: Math.max(1, Number(roomForm.capacity) || 1),
      beds: roomForm.beds.trim() || 'Sin detalle de camas',
      bathrooms: Math.max(1, Number(roomForm.bathrooms) || 1),
      price: roomForm.price.trim(),
      status: 'Activa',
    };
    saveRoomType(listingId, nextRoom);
    setRoomTypes((current) => editingRoomId ? current.map((room) => room.id === editingRoomId ? nextRoom : room) : [...current, nextRoom]);
    setIsRoomModalOpen(false);
    setRoomForm(defaultRoomForm);
    setEditingRoomId(null);
  };

  return <AppLayout hostName={session?.name} onLogout={logout}>
    <div className="space-y-5 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/host/listings" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-secondary hover:text-ink-primary"><ArrowLeft className="h-4 w-4" />Mis alojamientos</Link>
        <div className="flex gap-2"><Button type="button" variant="secondary" size="sm" leftIcon={<Edit3 className="h-4 w-4" />} onClick={() => { startEditing(listingId, toWizardData(listing)); navigate('/host/listings/new/step-2'); }}>Editar establecimiento</Button><button type="button" aria-label="Más opciones" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-white text-ink-secondary hover:bg-surface-secondary"><MoreHorizontal className="h-5 w-5" /></button></div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="grid gap-3 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="relative aspect-[16/8] overflow-hidden rounded-xl bg-surface-secondary"><img src={heroPhoto} alt={listing.name} className="h-full w-full object-cover" /><button type="button" onClick={() => setActiveTab('Fotos')} className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-3 py-2 text-xs font-bold text-ink-primary shadow-sm">Ver todas las fotos</button></div>
          <div className="grid grid-cols-2 gap-2"><img src={listing.photos[1] || heroPhoto} alt="Área común" className="aspect-[4/3] w-full rounded-lg object-cover" /><img src={listing.photos[2] || heroPhoto} alt="Interior" className="aspect-[4/3] w-full rounded-lg object-cover" /><img src={listing.photos[3] || heroPhoto} alt="Habitación" className="aspect-[4/3] w-full rounded-lg object-cover" /><img src={listing.photos[1] || heroPhoto} alt="Espacio del establecimiento" className="aspect-[4/3] w-full rounded-lg object-cover" /></div>
        </div>
        <div className="px-5 pb-5 sm:px-7"><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">{listing.name}</h1><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(listing.status)}`}>{listing.status}</span></div><p className="mt-2 flex items-center gap-2 text-sm text-ink-secondary"><MapPin className="h-4 w-4 text-brand-primary" />{listing.location}</p></div>
        <div className="mx-4 mt-5 flex gap-5 overflow-x-auto rounded-2xl border border-line bg-white px-5 shadow-card sm:mx-5 sm:px-7">{tabs.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`shrink-0 border-b-2 py-4 text-sm font-semibold transition ${activeTab === tab ? 'border-brand-primary text-brand-primary' : 'border-transparent text-ink-secondary hover:text-ink-primary'}`}>{tab}</button>)}</div>
      </section>

      {activeTab === 'Habitaciones' && <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-bold text-ink-primary">Tipos de habitación ({roomTypes.length})</h2><p className="mt-1 text-sm text-ink-secondary">Gestiona los tipos de habitación de tu {establishmentLabel}.</p></div><Button type="button" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate(`/host/listings/${listingId}/rooms/new`)}>Agregar tipo de habitación</Button></div>{roomTypes.length === 0 ? <div className="mt-6 rounded-xl border border-dashed border-line bg-surface-secondary/50 px-6 py-12 text-center"><BedDouble className="mx-auto h-10 w-10 text-brand-primary" /><h3 className="mt-3 font-bold text-ink-primary">Aún no tienes tipos de habitación</h3><p className="mx-auto mt-2 max-w-md text-sm text-ink-secondary">Registra el primer tipo de habitación para que tu establecimiento pueda recibir reservas.</p><Button type="button" className="mt-5" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate(`/host/listings/${listingId}/rooms/new`)}>Registrar primera habitación</Button></div> : <div className="mt-6 divide-y divide-line rounded-xl border border-line">{roomTypes.map((room) => <article key={room.id} role="link" tabIndex={0} onClick={() => navigate(`/host/listings/${listingId}/rooms/${room.id}`)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') navigate(`/host/listings/${listingId}/rooms/${room.id}`); }} className="flex cursor-pointer flex-col gap-4 p-4 transition hover:bg-surface-secondary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary sm:flex-row sm:items-center"><img src={room.photo || heroPhoto} alt={room.name} className="h-20 w-full rounded-lg object-cover sm:w-28" /><div className="min-w-0 flex-1"><h3 className="font-bold text-ink-primary">{room.name}</h3><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-secondary"><span>{room.units} unidades</span><span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />Hasta {room.capacity}</span><span className="inline-flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{room.beds}</span><span className="inline-flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{room.bathrooms} baños</span></div></div><div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end"><span className="font-bold text-ink-primary">Bs {room.price} <span className="text-xs font-normal text-ink-secondary">/ noche</span></span><div className="flex items-center gap-2"><span className={`rounded-md px-2 py-1 text-[10px] font-semibold ${room.status === 'Activa' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{room.status}</span><button type="button" aria-label={`Editar ${room.name}`} onClick={(event) => { event.stopPropagation(); openRoomModal(room); }} className="rounded-lg border border-line p-2 text-ink-secondary hover:bg-surface-secondary"><Pencil className="h-4 w-4" /></button><button type="button" aria-label={`Eliminar ${room.name}`} onClick={(event) => { event.stopPropagation(); deleteRoomType(listingId, room.id); setRoomTypes((current) => current.filter((item) => item.id !== room.id)); }} className="rounded-lg border border-line p-2 text-ink-secondary hover:bg-rose-50 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button></div></div></article>)}</div>}{roomTypes.length > 3 && <button type="button" className="mt-4 text-sm font-semibold text-brand-primary hover:underline">Gestionar habitaciones</button>}</section>}

      {activeTab === 'Información' && <DetailSection title="Información general"><div className="grid gap-6 sm:grid-cols-2"><div><h3 className="font-bold text-ink-primary">Descripción</h3><p className="mt-3 text-sm leading-6 text-ink-secondary">{listing.description}</p></div><div><h3 className="font-bold text-ink-primary">Datos del establecimiento</h3><div className="mt-3 space-y-3 text-sm text-ink-secondary"><span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-primary" />{listing.address}</span><span className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-primary" />{listing.type}</span></div></div></div></DetailSection>}
      {activeTab === 'Servicios' && <DetailSection title="Servicios generales"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{listing.amenities.length ? listing.amenities.map((amenity) => <span key={amenity} className="rounded-lg bg-brand-light/60 px-4 py-3 text-sm font-semibold text-ink-primary">{amenity}</span>) : <p className="text-sm text-ink-secondary">No se han agregado servicios todavía.</p>}</div></DetailSection>}
      {activeTab === 'Ubicación' && <DetailSection title="Ubicación"><div className="grid gap-5 lg:grid-cols-2"><div className="space-y-3 text-sm text-ink-secondary"><p><strong className="text-ink-primary">Dirección:</strong> {listing.address}</p><p><strong className="text-ink-primary">Ciudad:</strong> {listing.city}</p><p><strong className="text-ink-primary">Barrio o zona:</strong> {listing.neighborhood || 'No especificado'}</p></div><div className="relative min-h-48 overflow-hidden rounded-xl border border-line bg-[#e8f0ee]"><div className="absolute inset-0 opacity-70" style={{ backgroundImage: 'linear-gradient(32deg, transparent 44%, #d3dfdb 45%, #d3dfdb 47%, transparent 48%), linear-gradient(118deg, transparent 44%, #cbd9d5 45%, #cbd9d5 47%, transparent 48%)', backgroundSize: '110px 80px' }} /><MapPin className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary p-2 text-white shadow-lg" /></div></div></DetailSection>}
      {activeTab === 'Fotos' && <DetailSection title="Fotografías"><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{listing.photos.map((photo, index) => <img key={`${photo}-${index}`} src={photo} alt={`${listing.name} ${index + 1}`} className="aspect-[4/3] w-full rounded-xl object-cover" />)}</div></DetailSection>}
      {activeTab === 'Reglas' && <DetailSection title="Condiciones de estadía"><div className="grid gap-4 text-sm text-ink-secondary sm:grid-cols-3"><p><strong className="block text-ink-primary">Check-in</strong>{listing.checkIn}</p><p><strong className="block text-ink-primary">Check-out</strong>{listing.checkOut}</p><p><strong className="block text-ink-primary">Cancelación</strong>{listing.cancellation}</p></div>{listing.stayConditions && <p className="mt-5 rounded-xl bg-surface-secondary p-4 text-sm leading-6 text-ink-secondary">{listing.stayConditions}</p>}</DetailSection>}
    </div>

    {isRoomModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><div role="dialog" aria-modal="true" aria-labelledby="room-modal-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><h2 id="room-modal-title" className="text-xl font-bold text-ink-primary">{editingRoomId ? 'Editar tipo de habitación' : 'Agregar tipo de habitación'}</h2><p className="mt-1 text-sm text-ink-secondary">Define la información principal que verán los huéspedes.</p></div><button type="button" onClick={() => setIsRoomModalOpen(false)} aria-label="Cerrar" className="rounded-lg p-2 text-ink-secondary hover:bg-surface-secondary"><X className="h-5 w-5" /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="sm:col-span-2"><span className="label">Nombre del tipo</span><input className="input" value={roomForm.name} onChange={(event) => setRoomForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ej. Habitación Estándar" /></label><label><span className="label">Cantidad de unidades</span><input className="input" type="number" min="1" value={roomForm.units} onChange={(event) => setRoomForm((current) => ({ ...current, units: event.target.value }))} /></label><label><span className="label">Capacidad</span><input className="input" type="number" min="1" value={roomForm.capacity} onChange={(event) => setRoomForm((current) => ({ ...current, capacity: event.target.value }))} /></label><label className="sm:col-span-2"><span className="label">Resumen de camas</span><input className="input" value={roomForm.beds} onChange={(event) => setRoomForm((current) => ({ ...current, beds: event.target.value }))} placeholder="Ej. 1 cama matrimonial" /></label><label><span className="label">Baños</span><input className="input" type="number" min="1" value={roomForm.bathrooms} onChange={(event) => setRoomForm((current) => ({ ...current, bathrooms: event.target.value }))} /></label><label><span className="label">Precio por noche (Bs.)</span><input className="input" type="number" min="1" value={roomForm.price} onChange={(event) => setRoomForm((current) => ({ ...current, price: event.target.value }))} placeholder="250" /></label></div><div className="mt-7 flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setIsRoomModalOpen(false)}>Cancelar</Button><Button type="button" onClick={saveRoom}>{editingRoomId ? 'Guardar cambios' : 'Agregar habitación'}</Button></div></div></div>}
  </AppLayout>;
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-7"><h2 className="text-xl font-bold text-ink-primary">{title}</h2><div className="mt-5">{children}</div></section>;
}
