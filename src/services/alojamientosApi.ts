import { apiClient } from '@/api/client';
import type {
  AgregarUnidadRequest,
  AlojamientoDetalle,
  AlojamientoResumen,
  FotografiasRequest,
  OfertaUnicaRequest,
  PresentacionRequest,
  PoliticasRequest,
  RegistroAlojamientoRequest,
  ServiciosRequest,
  UbicacionRequest,
  UnidadAlojamiento,
} from '@/types/alojamientos';

export function crearAlojamiento(body: RegistroAlojamientoRequest): Promise<AlojamientoDetalle> {
  return apiClient.post<AlojamientoDetalle>('/alojamientos', body);
}

export function listarMisAlojamientos(): Promise<AlojamientoResumen[]> {
  return apiClient.get<AlojamientoResumen[]>('/alojamientos');
}

export function obtenerAlojamiento(id: string): Promise<AlojamientoDetalle> {
  return apiClient.get<AlojamientoDetalle>(`/alojamientos/${id}`);
}

export function obtenerUnidad(alojamientoId: string, unidadId: string): Promise<UnidadAlojamiento> {
  return apiClient.get<UnidadAlojamiento>(`/alojamientos/${alojamientoId}/unidades/${unidadId}`);
}

export function guardarUbicacion(id: string, body: UbicacionRequest): Promise<AlojamientoDetalle> {
  return apiClient.put<AlojamientoDetalle>(`/alojamientos/${id}/ubicacion`, body);
}

export function guardarPresentacion(id: string, body: PresentacionRequest): Promise<AlojamientoDetalle> {
  return apiClient.put<AlojamientoDetalle>(`/alojamientos/${id}/presentacion`, body);
}

export function guardarPoliticas(id: string, body: PoliticasRequest): Promise<AlojamientoDetalle> {
  return apiClient.put<AlojamientoDetalle>(`/alojamientos/${id}/politicas`, body);
}

export function guardarServicios(id: string, body: ServiciosRequest): Promise<AlojamientoDetalle> {
  return apiClient.put<AlojamientoDetalle>(`/alojamientos/${id}/servicios`, body);
}

export function guardarFotografias(id: string, body: FotografiasRequest): Promise<AlojamientoDetalle> {
  return apiClient.put<AlojamientoDetalle>(`/alojamientos/${id}/fotografias`, body);
}

export function subirFotografia(id: string, archivo: File): Promise<AlojamientoDetalle> {
  const form = new FormData();
  form.append('archivo', archivo, archivo.name || 'foto.jpg');
  return apiClient.post<AlojamientoDetalle>(`/alojamientos/${id}/fotografias/archivo`, form);
}

/** Sube imagen sin asociarla al hotel; se usa luego en la unidad/habitación. */
export function subirImagen(
  id: string,
  archivo: File,
): Promise<{ identificadorAlmacen: string; url: string }> {
  const form = new FormData();
  form.append('archivo', archivo, archivo.name || 'foto.jpg');
  return apiClient.post<{ identificadorAlmacen: string; url: string }>(
    `/alojamientos/${id}/imagenes/archivo`,
    form,
  );
}

export function guardarOfertaUnica(id: string, body: OfertaUnicaRequest): Promise<AlojamientoDetalle> {
  return apiClient.put<AlojamientoDetalle>(`/alojamientos/${id}/oferta-unica`, body);
}

/** Crea un solo tipo de habitación → POST /alojamientos/{id}/unidades. */
export function agregarUnidad(id: string, body: AgregarUnidadRequest): Promise<AlojamientoDetalle> {
  return apiClient.post<AlojamientoDetalle>(`/alojamientos/${id}/unidades`, body);
}

/**
 * Cierra el wizard (Strategy en backend):
 * casa/depto → EN_REVISION; hotel/hostal → ACTIVO.
 */
export function finalizarRegistro(id: string): Promise<AlojamientoDetalle> {
  return apiClient.post<AlojamientoDetalle>(`/alojamientos/${id}/finalizar-registro`);
}

/** Envía a moderación: → EN_REVISION. */
export function enviarARevision(id: string): Promise<AlojamientoDetalle> {
  return apiClient.post<AlojamientoDetalle>(`/alojamientos/${id}/enviar-revision`);
}

/** Habitación publicada → DESACTIVADO (anfitrión). */
export function desactivarUnidad(alojamientoId: string, unidadId: string): Promise<AlojamientoDetalle> {
  return apiClient.post<AlojamientoDetalle>(
    `/alojamientos/${alojamientoId}/unidades/${unidadId}/desactivar`,
  );
}

/** Habitación desactivada → PUBLICADO (requiere establecimiento ACTIVO). */
export function activarUnidad(alojamientoId: string, unidadId: string): Promise<AlojamientoDetalle> {
  return apiClient.post<AlojamientoDetalle>(
    `/alojamientos/${alojamientoId}/unidades/${unidadId}/activar`,
  );
}
