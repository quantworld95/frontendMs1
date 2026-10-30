import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Check,
  ImagePlus,
  Loader2,
  Minus,
  Plus,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDemoAuth } from '@/hooks/useDemoAuth';
import { cn } from '@/utils/cn';
import { iconForService } from '@/utils/serviceIcons';
import { getCatalogosAlojamiento } from '@/services/catalogosApi';
import {
  agregarUnidad,
  obtenerAlojamiento,
  subirImagen,
} from '@/services/alojamientosApi';
import type {
  AgregarUnidadRequest,
  CatalogosAlojamiento,
  FotoRequest,
} from '@/types/alojamientos';

const steps = [
  'Tipo de habitación',
  'Información de la habitación',
  'Características y precio',
  'Fotos de la habitación',
];

const roomOptions = [
  {
    name: 'Habitación Estándar',
    description: 'Habitación privada con cama(s) para uso exclusivo de los huéspedes.',
    icon: BedDouble,
  },
  {
    name: 'Habitación Doble',
    description: 'Habitación privada con dos camas.',
    icon: BedDouble,
  },
  {
    name: 'Suite',
    description: 'Habitación privada con más espacio y comodidades.',
    icon: BedDouble,
  },
  {
    name: 'Habitación Compartida',
    description: 'Espacio con varias camas para diferentes huéspedes.',
    icon: Users,
  },
];

interface RoomDraft {
  name: string;
  description: string;
  units: number;
  capacity: number;
  beds: number;
  bathrooms: number;
  price: string;
  servicioIds: number[];
}

const initialDraft: RoomDraft = {
  name: 'Habitación Estándar',
  description: '',
  units: 1,
  capacity: 2,
  beds: 1,
  bathrooms: 1,
  price: '250',
  servicioIds: [],
};

export default function RoomTypeWizardPage() {
  const { listingId = '' } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { session } = useDemoAuth();
  const loggedIn = !!session;

  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<RoomDraft>(initialDraft);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [catalogos, setCatalogos] = useState<CatalogosAlojamiento | null>(null);
  const [catalogosLoading, setCatalogosLoading] = useState(false);

  const clearPhoto = () => {
    if (photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
    setPhotoPreview('');
    setPhotoFile(null);
  };

  useEffect(() => {
    if (!loggedIn) return;
    setCatalogosLoading(true);
    void getCatalogosAlojamiento()
      .then(setCatalogos)
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : 'No se pudo cargar el catálogo de servicios.',
        );
      })
      .finally(() => setCatalogosLoading(false));
  }, [loggedIn]);

  const updateDraft = <K extends keyof RoomDraft>(key: K, value: RoomDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const changeCounter = (key: 'units' | 'capacity' | 'beds' | 'bathrooms', amount: number) => {
    updateDraft(key, Math.max(1, draft[key] + amount));
  };

  const toggleServicio = (servicioId: number) => {
    updateDraft(
      'servicioIds',
      draft.servicioIds.includes(servicioId)
        ? draft.servicioIds.filter((id) => id !== servicioId)
        : [...draft.servicioIds, servicioId],
    );
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
    if (step === 3 && draft.servicioIds.length === 0) {
      setError('Selecciona al menos un servicio de la habitación (wifi, TV, etc.).');
      return;
    }
    setStep((current) => Math.min(4, current + 1));
  };

  const saveRoom = async () => {
    if (!loggedIn) {
      setError('Inicia sesión para guardar la habitación.');
      return;
    }
    if (!listingId) {
      setError('Falta el id del alojamiento.');
      return;
    }

    const tipoEspacioId = catalogos?.tiposEspacio[0]?.id;
    if (!tipoEspacioId) {
      setError('El catálogo no tiene tipos de espacio.');
      return;
    }

    if (!photoFile) {
      setError('Agrega una foto de la habitación; será la portada de la tarjeta.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const detalle = await obtenerAlojamiento(listingId);
      const estadoActual = (detalle.estado || '').toUpperCase();

      if (!['ACTIVO', 'BORRADOR', 'RECHAZADO', 'DESACTIVADO'].includes(estadoActual)) {
        setError(
          `Este establecimiento está en estado ${estadoActual || 'desconocido'} y no admite nuevas habitaciones.`,
        );
        return;
      }

      const imagen = await subirImagen(listingId, photoFile);
      if (!imagen?.identificadorAlmacen || !imagen?.url) {
        throw new Error('No se recibió la URL de la imagen subida.');
      }
      const fotografiasHabitacion: FotoRequest[] = [
        {
          identificadorAlmacen: imagen.identificadorAlmacen,
          url: imagen.url,
          orden: 1,
        },
      ];

      const body: AgregarUnidadRequest = {
        tipoEspacioId,
        nombre: draft.name.trim().slice(0, 80),
        descripcion: draft.description.trim(),
        capacidadHuespedes: draft.capacity,
        cantidadDormitorios: 1,
        cantidadCamas: draft.beds,
        cantidadBanos: draft.bathrooms,
        inventarioTotal: draft.units,
        precioNoche: Number(draft.price),
        fotografias: fotografiasHabitacion,
        servicios: [...draft.servicioIds],
      };
      const guardado = await agregarUnidad(listingId, body);

      const creada = [...(guardado.unidades ?? [])]
        .reverse()
        .find((unidad) => unidad.nombre === draft.name.trim().slice(0, 80));
      if (!creada?.fotografias?.length) {
        throw new Error(
          'La habitación se guardó pero sin fotografía. Revisá el backend e intentá de nuevo.',
        );
      }

      clearPhoto();
      navigate(`/host/listings/${listingId}`);
    } catch (err) {
      const raw =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'No se pudo publicar la habitación.';
      setError(raw);
    } finally {
      setSaving(false);
    }
  };

  const servicios = catalogos?.servicios ?? [];

  return (
    <div className="min-h-screen bg-[#f7faff]">
      <header className="border-b border-line bg-white">
        <div className="flex w-full items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <div className="shrink-0">
            <p className="text-sm font-bold text-ink-primary sm:text-base">
              Agregar tipo de habitación
            </p>
            <p className="text-xs text-ink-secondary">
              Configura una habitación de tu establecimiento
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/host/listings/${listingId}`)}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink-secondary hover:bg-surface-secondary"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-ink-primary">Registro de habitaciones</p>
            <p className="mt-1 text-xs text-ink-secondary">
              Paso {step} de 4 · {steps[step - 1]}
            </p>
          </div>
          <span className="text-sm font-semibold text-brand-primary">
            {Math.round((step / 4) * 100)}%
          </span>
        </div>
        <div className="mb-8 h-2 overflow-hidden rounded-full bg-[#dfe7f0]">
          <div
            className="h-full rounded-full bg-brand-primary transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <section className="mx-auto max-w-3xl rounded-2xl border border-line bg-white p-5 shadow-card sm:p-8">
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-ink-primary">
                ¿Qué tipo de habitación vas a crear?
              </h1>
              <p className="mt-2 text-sm text-ink-secondary">
                Selecciona el tipo que mejor describe esta habitación.
              </p>
              <div className="mt-6 grid gap-3">
                {roomOptions.map(({ name, description, icon: Icon }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => updateDraft('name', name)}
                    className={cn(
                      'flex items-center gap-4 rounded-xl border p-4 text-left transition',
                      draft.name === name
                        ? 'border-brand-primary bg-brand-light/60 ring-1 ring-brand-primary'
                        : 'border-line hover:border-brand-primary/50',
                    )}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-secondary text-brand-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block font-bold text-ink-primary">{name}</span>
                      <span className="mt-1 block text-xs text-ink-secondary">{description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold text-ink-primary">
                Define los detalles de la habitación
              </h1>
              <div className="mt-6 space-y-5">
                <Input
                  label="Nombre de la habitación"
                  name="room-name"
                  required
                  value={draft.name}
                  onChange={(event) => updateDraft('name', event.target.value)}
                />
                <div>
                  <label htmlFor="room-description" className="label">
                    Descripción <span className="text-brand-primary">*</span>
                  </label>
                  <textarea
                    id="room-description"
                    value={draft.description}
                    onChange={(event) => updateDraft('description', event.target.value)}
                    className="input min-h-32 resize-y"
                    placeholder="Ej. Habitación cómoda y luminosa con vista al jardín."
                    maxLength={500}
                  />
                  <p className="mt-1 text-right text-xs text-ink-secondary">
                    {draft.description.length}/500
                  </p>
                </div>
                <Counter
                  label="Cantidad de habitaciones de este tipo"
                  value={draft.units}
                  onChange={(amount) => changeCounter('units', amount)}
                  suffix="habitaciones"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold text-ink-primary">Características y precio</h1>
              <div className="mt-6 grid gap-5 sm:grid-cols-3">
                <Counter
                  label="Capacidad de huéspedes"
                  value={draft.capacity}
                  onChange={(amount) => changeCounter('capacity', amount)}
                  suffix="personas"
                />
                <Counter
                  label="Número de camas"
                  value={draft.beds}
                  onChange={(amount) => changeCounter('beds', amount)}
                  suffix="camas"
                />
                <Counter
                  label="Número de baños"
                  value={draft.bathrooms}
                  onChange={(amount) => changeCounter('bathrooms', amount)}
                  suffix="baños"
                />
              </div>
              <div className="mt-6">
                <Input
                  label="Precio por noche (Bs.)"
                  name="room-price"
                  required
                  type="number"
                  min="1"
                  value={draft.price}
                  onChange={(event) => updateDraft('price', event.target.value)}
                />
              </div>
              <div className="mt-6">
                <p className="label">
                  Servicios de la habitación <span className="text-brand-primary">*</span>
                </p>
                <p className="mt-1 text-xs text-ink-secondary">
                  Elige al menos uno; se guardan con la habitación y se muestran en el detalle.
                </p>
                {catalogosLoading ? (
                  <div className="mt-3 flex items-center gap-2 text-sm text-ink-secondary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando servicios…
                  </div>
                ) : (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {servicios.map((servicio) => {
                      const selected = draft.servicioIds.includes(servicio.id);
                      const Icon = iconForService(servicio.nombre);
                      return (
                        <button
                          key={servicio.id}
                          type="button"
                          onClick={() => toggleServicio(servicio.id)}
                          className={cn(
                            'flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition',
                            selected
                              ? 'border-brand-primary bg-brand-light/60'
                              : 'border-line hover:border-brand-primary/50',
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-8 w-8 items-center justify-center rounded-lg',
                              selected
                                ? 'bg-brand-primary text-white'
                                : 'bg-surface-secondary text-brand-primary',
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1 font-semibold text-ink-primary">
                            {servicio.nombre}
                          </span>
                          <span
                            className={cn(
                              'flex h-5 w-5 items-center justify-center rounded border text-white',
                              selected
                                ? 'border-brand-primary bg-brand-primary'
                                : 'border-line',
                            )}
                          >
                            {selected ? <Check className="h-3.5 w-3.5" /> : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h1 className="text-2xl font-bold text-ink-primary">
                Agrega fotos de esta habitación
              </h1>
              <p className="mt-2 text-sm text-ink-secondary">
                Esta imagen será la portada de la tarjeta. Al publicar, el establecimiento pasa a En
                revisión.
              </p>
              <label
                htmlFor="room-photo"
                className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#c9d5e5] bg-surface-secondary/50 px-5 py-10 text-center hover:border-brand-primary"
              >
                <ImagePlus className="h-9 w-9 text-brand-primary" />
                <span className="mt-3 text-sm font-semibold text-ink-primary">
                  Selecciona una fotografía
                </span>
                <input
                  id="room-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
                    setPhotoFile(file);
                    setPhotoPreview(URL.createObjectURL(file));
                  }}
                />
              </label>
              {photoPreview ? (
                <div className="relative mt-5 overflow-hidden rounded-xl border border-line">
                  <img
                    src={photoPreview}
                    alt="Vista previa de la habitación"
                    className="max-h-72 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="absolute right-3 top-3 rounded-lg bg-white p-2 text-ink-secondary shadow-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {error ? (
            <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                step === 1 ? navigate(`/host/listings/${listingId}`) : setStep((current) => current - 1)
              }
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              {step === 1 ? 'Cancelar' : 'Atrás'}
            </Button>
            {step === 4 ? (
              <Button
                type="button"
                onClick={() => void saveRoom()}
                disabled={saving}
                rightIcon={
                  saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )
                }
              >
                {saving ? 'Publicando…' : 'Publicar'}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={nextStep}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Siguiente
              </Button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Counter({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (amount: number) => void;
  suffix: string;
}) {
  return (
    <div>
      <span className="label">{label}</span>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-secondary hover:bg-surface-secondary"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="flex h-9 min-w-10 items-center justify-center rounded-lg border border-line px-2 font-semibold text-ink-primary">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-secondary hover:bg-surface-secondary"
        >
          <Plus className="h-4 w-4" />
        </button>
        <span className="text-xs text-ink-secondary">{suffix}</span>
      </div>
    </div>
  );
}
