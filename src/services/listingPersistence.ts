import * as alojamientosApi from '@/services/alojamientosApi';
import { getCatalogosAlojamiento } from '@/services/catalogosApi';
import {
  isEstablishmentType,
  resolveTipoPropiedadId,
  toOfertaUnicaRequest,
  toPoliticasRequest,
  toPresentacionRequest,
  toServiciosRequest,
  toUbicacionRequest,
} from '@/mappers/listingWizardMapper';
import type { ListingWizardData } from '@/hooks/listingWizardContext';
import type { AlojamientoDetalle, CatalogosAlojamiento } from '@/types/alojamientos';

export interface PersistContext {
  data: ListingWizardData;
  alojamientoId: string | null;
  catalogos?: CatalogosAlojamiento;
}

async function ensureCatalogos(catalogos?: CatalogosAlojamiento): Promise<CatalogosAlojamiento> {
  return catalogos ?? getCatalogosAlojamiento();
}

/** Paso 1: crea borrador si aún no existe. */
export async function persistTipo(ctx: PersistContext): Promise<AlojamientoDetalle> {
  const catalogos = await ensureCatalogos(ctx.catalogos);
  const tipoPropiedadId =
    ctx.data.tipoPropiedadId ?? resolveTipoPropiedadId(ctx.data.type, catalogos);
  if (!tipoPropiedadId) {
    throw new Error('No se pudo mapear el tipo de alojamiento al catálogo del backend.');
  }

  if (ctx.alojamientoId) {
    return alojamientosApi.obtenerAlojamiento(ctx.alojamientoId);
  }

  return alojamientosApi.crearAlojamiento({ tipoPropiedadId });
}

export async function persistPresentacion(ctx: PersistContext): Promise<AlojamientoDetalle> {
  if (!ctx.alojamientoId) throw new Error('Falta alojamientoId para guardar presentación.');
  return alojamientosApi.guardarPresentacion(ctx.alojamientoId, toPresentacionRequest(ctx.data));
}

export async function persistUbicacion(ctx: PersistContext): Promise<AlojamientoDetalle> {
  if (!ctx.alojamientoId) throw new Error('Falta alojamientoId para guardar ubicación.');
  return alojamientosApi.guardarUbicacion(ctx.alojamientoId, toUbicacionRequest(ctx.data));
}

export async function persistServicios(ctx: PersistContext): Promise<AlojamientoDetalle> {
  if (!ctx.alojamientoId) throw new Error('Falta alojamientoId para guardar servicios.');
  return alojamientosApi.guardarServicios(ctx.alojamientoId, toServiciosRequest(ctx.data));
}

export async function persistPoliticas(ctx: PersistContext): Promise<AlojamientoDetalle> {
  if (!ctx.alojamientoId) throw new Error('Falta alojamientoId para guardar políticas.');
  return alojamientosApi.guardarPoliticas(ctx.alojamientoId, toPoliticasRequest(ctx.data));
}

export async function persistFotos(ctx: PersistContext): Promise<AlojamientoDetalle> {
  if (!ctx.alojamientoId) throw new Error('Falta alojamientoId para subir fotografías.');

  const selected = ctx.data.photos ?? [];
  const files = selected
    .map((photo) => photo.file)
    .filter((file): file is File => !!file);

  if (files.length === 0) {
    const soloRemotas =
      selected.length > 0 &&
      selected.every(
        (photo) => !!photo.url && !photo.url.startsWith('blob:') && !photo.file,
      );
    if (soloRemotas) {
      return alojamientosApi.obtenerAlojamiento(ctx.alojamientoId);
    }
    if (selected.length > 0) {
      throw new Error(
        'Las fotos seleccionadas no tienen archivo para subir. Vuelve a elegirlas (JPG, PNG o WEBP).',
      );
    }
    throw new Error('Agrega al menos una fotografía para continuar.');
  }

  let latest: AlojamientoDetalle | null = null;
  for (const file of files) {
    const tipo = file.type || '';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(tipo)) {
      throw new Error(
        `El archivo "${file.name}" no es JPG, PNG o WEBP (tipo: ${tipo || 'desconocido'}).`,
      );
    }
    latest = await alojamientosApi.subirFotografia(ctx.alojamientoId, file);
  }

  return latest!;
}

/** Casa/departamento: guarda la oferta única (unidad) + políticas/horarios. */
export async function persistOfertaOUnidades(ctx: PersistContext): Promise<AlojamientoDetalle> {
  if (!ctx.alojamientoId) throw new Error('Falta alojamientoId para guardar oferta.');
  return alojamientosApi.guardarOfertaUnica(ctx.alojamientoId, toOfertaUnicaRequest(ctx.data));
}

/**
 * Persiste la sección correspondiente a un paso del wizard UI.
 * Casa/Depto: 1 tipo, 2 presentación, 3 ubicación, 4 servicios, 5+6 oferta, 7 fotos → finalizar EN_REVISION
 * Hotel/Hostal: 1–5 + 6 solo fotos (sin habitaciones) → finalizar ACTIVO; habitaciones después
 */
export async function persistWizardStep(
  step: number,
  ctx: PersistContext,
): Promise<AlojamientoDetalle> {
  const establishment = isEstablishmentType(ctx.data.type);

  if (step === 1) return persistTipo(ctx);
  if (step === 2) return persistPresentacion(ctx);
  if (step === 3) return persistUbicacion(ctx);
  if (step === 4) return persistServicios(ctx);

  if (establishment) {
    if (step === 5) return persistPoliticas(ctx);
    if (step === 6) return persistFotos(ctx);
  } else {
    if (step === 5) {
      if (!ctx.alojamientoId) throw new Error('Falta alojamientoId en características.');
      return alojamientosApi.obtenerAlojamiento(ctx.alojamientoId);
    }
    if (step === 6) return persistOfertaOUnidades(ctx);
    if (step === 7) return persistFotos(ctx);
  }

  throw new Error(`Paso de wizard no soportado para persistencia: ${step}`);
}
