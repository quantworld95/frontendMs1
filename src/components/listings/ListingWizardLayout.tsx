import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useDemoAuth } from '@/hooks/useDemoAuth';
import { useListingWizard } from '@/hooks/useListingWizard';
import { finalizarRegistro } from '@/services/alojamientosApi';
import { ApiError } from '@/api/client';

const standardSteps = [
  'Tipo de alojamiento',
  'Información general',
  'Ubicación',
  'Servicios y comodidades',
  'Características',
  'Precio y condiciones',
  'Fotografías',
];

const establishmentSteps = [
  'Tipo de alojamiento',
  'Información general',
  'Ubicación',
  'Servicios generales',
  'Políticas generales',
  'Fotografías',
];

interface ListingWizardLayoutProps {
  step: number;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function ListingWizardLayout({ step, title, subtitle, children }: ListingWizardLayoutProps) {
  const navigate = useNavigate();
  const { session } = useDemoAuth();
  const {
    data,
    error,
    dirty,
    persisting,
    editingListingId,
    remoteAlojamientoId,
    validateStep,
    clearError,
    setWizardError,
    reset,
    saveListing,
    persistStep,
    loadCatalogos,
  } = useListingWizard();

  const isEstablishment = data.type === 'Hotel' || data.type === 'Hostal';
  /** Wizard conectado a ms-01 cuando ya hay tipo elegido. */
  const usesApi =
    data.type === 'Casa' ||
    data.type === 'Departamento' ||
    data.type === 'Hotel' ||
    data.type === 'Hostal';
  const steps = isEstablishment ? establishmentSteps : standardSteps;
  const loggedIn = !!session;

  // Cargar catálogo en cuanto haya sesión (también en el paso 1, antes de elegir tipo).
  useEffect(() => {
    if (loggedIn) {
      void loadCatalogos();
    }
  }, [loggedIn, loadCatalogos]);

  const goToStep = (nextStep: number) => navigate(`/host/listings/new/step-${nextStep}`);

  const isUuid = (value: string | null | undefined) =>
    !!value &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

  const handleSave = () => {
    if (!validateStep(step)) return;
    const listingId = remoteAlojamientoId || editingListingId;
    if (!isUuid(listingId)) {
      setWizardError(
        'Aún no hay un alojamiento guardado en la API. Continúa el registro paso a paso (no uses Guardar con el wizard vacío).',
      );
      return;
    }
    saveListing(listingId!);
    navigate(`/host/listings/${listingId}`);
  };

  const handleContinue = async () => {
    if (!validateStep(step)) return;

    if (usesApi) {
      if (!loggedIn) {
        setWizardError('Inicia sesión para continuar el registro.');
        return;
      }

      // Casa/Depto paso 5 (características) no tiene endpoint propio: va con la oferta en el 6.
      // Hotel/Hostal paso 5 sí persiste políticas.
      const shouldPersist = isEstablishment || step !== 5;
      const saved = shouldPersist ? await persistStep(step) : null;
      if (shouldPersist && !saved) return;

      if (step === steps.length) {
        const id = saved?.id ?? remoteAlojamientoId ?? '';
        if (!isUuid(id)) {
          setWizardError(
            'No se pudo obtener el id del alojamiento. Vuelve al paso 1 e inicia el registro de nuevo.',
          );
          return;
        }
        try {
          // Strategy backend: casa/depto → EN_REVISION; hotel/hostal → ACTIVO
          await finalizarRegistro(id);
        } catch (err) {
          setWizardError(
            err instanceof ApiError
              ? err.message
              : err instanceof Error
                ? err.message
                : isEstablishment
                  ? 'No se pudo crear el establecimiento.'
                  : 'No se pudo enviar el alojamiento a revisión.',
          );
          return;
        }
        saveListing(id);
        reset();
        navigate('/host/listings');
        return;
      }

      goToStep(step + 1);
      return;
    }

    if (step === steps.length) {
      setWizardError(
        'Selecciona un tipo de alojamiento e inicia el registro desde el paso 1 para poder publicar.',
      );
      return;
    }
    goToStep(step + 1);
  };

  const handleBack = () => {
    clearError();
    if (step === 1) navigate('/host/listings');
    else goToStep(step - 1);
  };

  const handleClose = () => {
    if (dirty && !window.confirm('Tienes cambios sin guardar. ¿Quieres cerrar el registro?')) return;
    reset();
    navigate('/host/listings');
  };

  const continueLabel =
    step === steps.length
      ? isEstablishment
        ? 'Crear establecimiento'
        : 'Publicar alojamiento'
      : 'Continuar';

  return (
    <div className="min-h-screen bg-[#f7faff]">
      <header className="border-b border-line bg-white">
        <div className="flex w-full items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <div className="flex shrink-0 items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-white">
              <Check className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-ink-primary sm:text-base">
                {editingListingId ? 'Editar alojamiento' : 'Registrar alojamiento'}
              </p>
              <p className="text-xs text-ink-secondary">
                {isEstablishment ? 'Hoteles y hostales' : 'Casas y departamentos'}
                {usesApi && remoteAlojamientoId ? (
                  <span className="ml-2 text-brand-primary">· Guardado en API</span>
                ) : null}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink-secondary transition hover:bg-surface-secondary hover:text-ink-primary"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {editingListingId ? (
          <div className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
            <nav
              aria-label="Pasos del registro"
              className="rounded-2xl border border-line bg-white p-4 shadow-card lg:sticky lg:top-6"
            >
              <p className="mb-4 px-3 text-xs font-bold uppercase tracking-wide text-ink-secondary">
                Pasos del alojamiento
              </p>
              <div className="relative space-y-1">
                <div className="absolute bottom-5 left-[27px] top-5 w-px bg-line" aria-hidden="true" />
                {steps.slice(1).map((stepName, index) => {
                  const stepNumber = index + 2;
                  const active = stepNumber === step;
                  const completed = stepNumber < step;
                  return (
                    <button
                      key={stepName}
                      type="button"
                      onClick={() => {
                        clearError();
                        goToStep(stepNumber);
                      }}
                      className={`relative z-10 flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition ${
                        active
                          ? 'bg-brand-light/60 text-brand-primary'
                          : 'text-ink-secondary hover:bg-surface-secondary hover:text-ink-primary'
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-white text-xs font-bold ${
                          active
                            ? 'border-brand-primary text-brand-primary'
                            : completed
                              ? 'border-brand-primary bg-brand-primary text-white'
                              : 'border-line text-ink-secondary'
                        }`}
                      >
                        {completed ? <Check className="h-4 w-4" /> : stepNumber}
                      </span>
                      <span className={`text-sm ${active ? 'font-bold' : 'font-semibold'}`}>
                        {stepName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>
            <section className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
              <div className="mb-5">
                <p className="text-sm font-semibold text-brand-primary">
                  Paso {step - 1} de {steps.length - 1}
                </p>
                <h1 className="mt-1.5 text-xl font-bold tracking-tight text-ink-primary sm:text-2xl">
                  {title}
                </h1>
                <p className="mt-1.5 text-sm text-ink-secondary">{subtitle}</p>
              </div>
              {children}
              {error && (
                <div
                  className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                  role="alert"
                >
                  {error}
                </div>
              )}
              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Button type="button" variant="secondary" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="button" onClick={handleSave}>
                  Guardar cambios
                </Button>
              </div>
            </section>
          </div>
        ) : (
          <>
            <div className="mx-auto mb-5 max-w-2xl">
              <div className="mb-2 flex items-center justify-between gap-4 text-xs font-semibold sm:text-sm">
                <span className="text-brand-primary">
                  {step}/{steps.length}
                </span>
                <span className="truncate text-ink-primary">{steps[step - 1]}</span>
                <span className="shrink-0 text-ink-secondary">
                  {Math.round((step / steps.length) * 100)}%
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-[#dfe7f0]"
                aria-label={`Progreso: paso ${step} de ${steps.length}`}
              >
                <div
                  className="h-full rounded-full bg-brand-primary transition-all duration-300"
                  style={{ width: `${(step / steps.length) * 100}%` }}
                />
              </div>
            </div>
            <section className="mx-auto max-w-2xl rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6">
              <div className="mb-5">
                <p className="text-sm font-semibold text-brand-primary">
                  Paso {step} de {steps.length}
                </p>
                <h1 className="mt-1.5 text-xl font-bold tracking-tight text-ink-primary sm:text-2xl">
                  {title}
                </h1>
                <p className="mt-1.5 text-sm text-ink-secondary">{subtitle}</p>
                {usesApi && (
                  <p className="mt-2 text-xs text-ink-secondary">
                    Cada paso se guarda en el backend (ms-01)
                    {!loggedIn && (
                      <span className="font-semibold text-amber-700">
                        {' '}
                        · Inicia sesión para guardar
                      </span>
                    )}
                  </p>
                )}
              </div>
              {children}
              {error && (
                <div
                  className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                  role="alert"
                >
                  {error}
                </div>
              )}
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBack}
                  disabled={persisting}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  onClick={() => void handleContinue()}
                  disabled={persisting}
                  rightIcon={
                    persisting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )
                  }
                >
                  {persisting ? 'Guardando…' : continueLabel}
                </Button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default ListingWizardLayout;
