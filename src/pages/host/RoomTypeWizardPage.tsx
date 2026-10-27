import { useState } from 'react';
import { ArrowLeft, ArrowRight, Bath, BedDouble, Check, ImagePlus, Minus, Plus, Trash2, Users, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { saveRoomType, type RoomType } from '@/services/roomTypes';

const steps = ['Tipo de habitación', 'Información de la habitación', 'Características y precio', 'Fotos de la habitación'];
const roomOptions = [
  { name: 'Habitación Estándar', description: 'Habitación privada con cama(s) para uso exclusivo de los huéspedes.', icon: BedDouble },
  { name: 'Habitación Doble', description: 'Habitación privada con dos camas.', icon: BedDouble },
  { name: 'Suite', description: 'Habitación privada con más espacio y comodidades.', icon: BedDouble },
  { name: 'Habitación Compartida', description: 'Espacio con varias camas para diferentes huéspedes.', icon: Users },
];

interface RoomDraft {
  name: string;
  description: string;
  units: number;
  capacity: number;
  beds: number;
  bathrooms: number;
  price: string;
  services: string[];
}

const initialDraft: RoomDraft = { name: 'Habitación Estándar', description: '', units: 10, capacity: 2, beds: 1, bathrooms: 1, price: '250', services: ['Wi-Fi', 'Aire acondicionado', 'TV'] };
const serviceOptions = ['Wi-Fi', 'Aire acondicionado', 'TV', 'Minibar', 'Caja fuerte', 'Escritorio'];

export default function RoomTypeWizardPage() {
  const { listingId = '' } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<RoomDraft>(initialDraft);
  const [photo, setPhoto] = useState('');
  const [error, setError] = useState('');

  const updateDraft = <K extends keyof RoomDraft>(key: K, value: RoomDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const changeCounter = (key: 'units' | 'capacity' | 'beds' | 'bathrooms', amount: number) => {
    updateDraft(key, Math.max(1, draft[key] + amount));
  };

  const toggleService = (service: string) => {
    updateDraft('services', draft.services.includes(service) ? draft.services.filter((item) => item !== service) : [...draft.services, service]);
  };

  const nextStep = () => {
    if (step === 2 && (!draft.name.trim() || draft.description.trim().length < 20)) {
      setError('Completa el nombre y una descripción de al menos 20 caracteres.');
      return;
    }
    if (step === 3 && (!draft.price || Number(draft.price) <= 0)) {
      setError('Indica un precio por noche mayor que cero.');
      return;
    }
    setStep((current) => Math.min(4, current + 1));
  };

  const saveRoom = () => {
    const room: RoomType = { id: `room-${Date.now()}`, name: draft.name, description: draft.description, services: draft.services, units: draft.units, capacity: draft.capacity, beds: `${draft.beds} ${draft.beds === 1 ? 'cama' : 'camas'}`, bathrooms: draft.bathrooms, price: draft.price, status: 'Activa', photo };
    saveRoomType(listingId, room);
    navigate(`/host/listings/${listingId}`);
  };

  return <div className="min-h-screen bg-[#f7faff]">
    <header className="border-b border-line bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6"><div><p className="text-sm font-bold text-ink-primary sm:text-base">Agregar tipo de habitación</p><p className="text-xs text-ink-secondary">Configura una habitación de tu establecimiento</p></div><button type="button" onClick={() => navigate(`/host/listings/${listingId}`)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink-secondary hover:bg-surface-secondary"><X className="h-4 w-4" /><span className="hidden sm:inline">Cerrar</span></button></div></header>
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between gap-3"><div><p className="text-sm font-bold text-ink-primary">Registro de habitaciones</p><p className="mt-1 text-xs text-ink-secondary">Paso {step} de 4 · {steps[step - 1]}</p></div><span className="text-sm font-semibold text-brand-primary">{Math.round((step / 4) * 100)}%</span></div><div className="mb-8 h-2 overflow-hidden rounded-full bg-[#dfe7f0]"><div className="h-full rounded-full bg-brand-primary transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} /></div>
      <section className="mx-auto max-w-3xl rounded-2xl border border-line bg-white p-5 shadow-card sm:p-8">
        {step === 1 && <div><h1 className="text-2xl font-bold text-ink-primary">¿Qué tipo de habitación vas a crear?</h1><p className="mt-2 text-sm text-ink-secondary">Selecciona el tipo que mejor describe esta habitación.</p><div className="mt-6 grid gap-3">{roomOptions.map(({ name, description, icon: Icon }) => <button key={name} type="button" onClick={() => updateDraft('name', name)} className={`flex items-center gap-4 rounded-xl border p-4 text-left transition ${draft.name === name ? 'border-brand-primary bg-brand-light/60 ring-1 ring-brand-primary' : 'border-line hover:border-brand-primary/50'}`}><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-secondary text-brand-primary"><Icon className="h-5 w-5" /></span><span className="flex-1"><span className="block font-bold text-ink-primary">{name}</span><span className="mt-1 block text-xs text-ink-secondary">{description}</span></span><span className={`h-5 w-5 rounded-full border-2 ${draft.name === name ? 'border-brand-primary bg-brand-primary ring-4 ring-brand-primary/10' : 'border-[#b5c3d6]'}`} /></button>)}</div></div>}
        {step === 2 && <div><h1 className="text-2xl font-bold text-ink-primary">Define los detalles de la habitación</h1><p className="mt-2 text-sm text-ink-secondary">Completa la información básica de este tipo de habitación.</p><div className="mt-6 space-y-5"><Input label="Nombre de la habitación" name="room-name" required value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} /><div><label htmlFor="room-description" className="label">Descripción <span className="text-brand-primary">*</span></label><textarea id="room-description" value={draft.description} onChange={(event) => updateDraft('description', event.target.value)} className="input min-h-32 resize-y" placeholder="Ej. Habitación cómoda y luminosa con vista al jardín." maxLength={500} /><p className="mt-1 text-right text-xs text-ink-secondary">{draft.description.length}/500</p></div><Counter label="Cantidad de habitaciones de este tipo" value={draft.units} onChange={(amount) => changeCounter('units', amount)} suffix="habitaciones" /></div></div>}
        {step === 3 && <div><h1 className="text-2xl font-bold text-ink-primary">Características y precio</h1><p className="mt-2 text-sm text-ink-secondary">Indica las características y el precio de este tipo de habitación.</p><div className="mt-6 grid gap-5 sm:grid-cols-3"><Counter label="Capacidad de huéspedes" value={draft.capacity} onChange={(amount) => changeCounter('capacity', amount)} suffix="personas" /><Counter label="Número de camas" value={draft.beds} onChange={(amount) => changeCounter('beds', amount)} suffix="camas" /><Counter label="Número de baños" value={draft.bathrooms} onChange={(amount) => changeCounter('bathrooms', amount)} suffix="baños" /></div><div className="mt-6"><Input label="Precio por noche (Bs.)" name="room-price" required type="number" min="1" value={draft.price} onChange={(event) => updateDraft('price', event.target.value)} /><p className="mt-1 text-xs text-ink-secondary">Este precio se aplicará a todas las habitaciones de este tipo.</p></div><div className="mt-6"><p className="label">Servicios de la habitación <span className="font-normal text-ink-secondary">(opcional)</span></p><div className="mt-3 grid gap-3 sm:grid-cols-2">{serviceOptions.map((service) => <button key={service} type="button" onClick={() => toggleService(service)} className="flex items-center gap-3 text-left text-sm text-ink-primary"><span className={`flex h-5 w-5 items-center justify-center rounded border text-white ${draft.services.includes(service) ? 'border-brand-primary bg-brand-primary' : 'border-line'}`}>{draft.services.includes(service) && <Check className="h-3.5 w-3.5" />}</span>{service}</button>)}</div></div></div>}
        {step === 4 && <div><h1 className="text-2xl font-bold text-ink-primary">Agrega fotos de esta habitación</h1><p className="mt-2 text-sm text-ink-secondary">Las fotos ayudan a mostrar los detalles de la habitación.</p><label htmlFor="room-photo" className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#c9d5e5] bg-surface-secondary/50 px-5 py-10 text-center hover:border-brand-primary"><ImagePlus className="h-9 w-9 text-brand-primary" /><span className="mt-3 text-sm font-semibold text-ink-primary">Selecciona una fotografía</span><span className="mt-1 text-xs text-ink-secondary">JPG, PNG o WEBP</span><input id="room-photo" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) setPhoto(URL.createObjectURL(file)); }} /></label>{photo && <div className="relative mt-5 overflow-hidden rounded-xl border border-line"><img src={photo} alt="Vista previa de la habitación" className="max-h-72 w-full object-cover" /><button type="button" onClick={() => setPhoto('')} className="absolute right-3 top-3 rounded-lg bg-white p-2 text-ink-secondary shadow-sm"><Trash2 className="h-4 w-4" /></button></div>}<p className="mt-5 rounded-lg bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800">Puedes agregar más fotos después desde el detalle del establecimiento.</p></div>}
        {error && <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6"><Button type="button" variant="secondary" onClick={() => step === 1 ? navigate(`/host/listings/${listingId}`) : setStep((current) => current - 1)} leftIcon={<ArrowLeft className="h-4 w-4" />}>{step === 1 ? 'Cancelar' : 'Atrás'}</Button>{step === 4 ? <Button type="button" onClick={saveRoom} rightIcon={<Check className="h-4 w-4" />}>Guardar habitación</Button> : <Button type="button" onClick={nextStep} rightIcon={<ArrowRight className="h-4 w-4" />}>Siguiente</Button>}</div>
      </section>
    </main>
  </div>;
}

function Counter({ label, value, onChange, suffix }: { label: string; value: number; onChange: (amount: number) => void; suffix: string }) {
  return <div><span className="label">{label}</span><div className="mt-2 flex items-center gap-2"><button type="button" onClick={() => onChange(-1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-secondary hover:bg-surface-secondary"><Minus className="h-4 w-4" /></button><span className="flex h-9 min-w-10 items-center justify-center rounded-lg border border-line px-2 font-semibold text-ink-primary">{value}</span><button type="button" onClick={() => onChange(1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-secondary hover:bg-surface-secondary"><Plus className="h-4 w-4" /></button><span className="text-xs text-ink-secondary">{suffix}</span></div></div>;
}
