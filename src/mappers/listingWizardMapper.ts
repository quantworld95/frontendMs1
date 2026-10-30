import type { ListingType, ListingWizardData } from '@/hooks/listingWizardContext';
import type {
  CatalogosAlojamiento,
  OfertaUnicaRequest,
  PoliticasRequest,
  PresentacionRequest,
  ServiciosRequest,
  UbicacionRequest,
} from '@/types/alojamientos';

const CITY_TO_DEPARTAMENTO: Record<string, string> = {
  'Santa Cruz de la Sierra': 'Santa Cruz',
  'La Paz': 'La Paz',
  Cochabamba: 'Cochabamba',
  Sucre: 'Chuquisaca',
  Tarija: 'Tarija',
  Trinidad: 'Beni',
  Oruro: 'Oruro',
  Potosí: 'Potosí',
  Cobija: 'Pando',
};

/** UI type → keyword to match catalog nombre (case-insensitive contains). */
const TYPE_KEYWORDS: Record<ListingType, string> = {
  Casa: 'casa',
  Departamento: 'departamento',
  Hotel: 'hotel',
  Hostal: 'hostal',
};

export function isEstablishmentType(type: ListingType | ''): boolean {
  return type === 'Hotel' || type === 'Hostal';
}

export function resolveTipoPropiedadId(
  type: ListingType | '',
  catalogos: CatalogosAlojamiento,
): number | null {
  if (!type) return null;
  const keyword = TYPE_KEYWORDS[type];
  const match = catalogos.tiposPropiedad.find((item) =>
    item.nombre.toLowerCase().includes(keyword),
  );
  return match?.id ?? null;
}

/** Solo arma el texto de políticas que ms-01 acepta. Descuentos y estadía mínima son UI local. */
export function buildPoliticasText(data: ListingWizardData): string {
  const parts = [`Política de cancelación: ${data.cancellation}.`];
  if (data.stayConditions.trim()) parts.push(data.stayConditions.trim());
  const text = parts.join(' ');
  return text.length >= 10 ? text : `${text} Condiciones estándar de estadía.`.trim();
}

export function toUbicacionRequest(data: ListingWizardData): UbicacionRequest {
  const hasCoords = data.latitude != null && data.longitude != null;
  return {
    direccion: data.address.trim(),
    ciudad: data.city,
    departamento: CITY_TO_DEPARTAMENTO[data.city] ?? data.city,
    ...(hasCoords
      ? { latitud: data.latitude!, longitud: data.longitude! }
      : {}),
  };
}

export function toPresentacionRequest(data: ListingWizardData): PresentacionRequest {
  return {
    titulo: data.name.trim(),
    descripcion: data.description.trim(),
    politicas: buildPoliticasText(data),
    horarioEntrada: data.checkIn,
    horarioSalida: data.checkOut,
  };
}

export function toPoliticasRequest(data: ListingWizardData): PoliticasRequest {
  return {
    politicas: buildPoliticasText(data),
    horarioEntrada: data.checkIn,
    horarioSalida: data.checkOut,
  };
}

export function toServiciosRequest(data: ListingWizardData): ServiciosRequest {
  return {
    servicios: [...data.servicioIds],
  };
}

export function toOfertaUnicaRequest(data: ListingWizardData): OfertaUnicaRequest {
  return {
    capacidadHuespedes: data.guests,
    cantidadDormitorios: data.bedrooms,
    cantidadCamas: data.beds,
    cantidadBanos: data.bathrooms,
    precioNoche: Number(data.nightlyPrice),
    politicas: buildPoliticasText(data),
    horarioEntrada: data.checkIn,
    horarioSalida: data.checkOut,
  };
}

export function resolveDefaultTipoEspacioId(catalogos: CatalogosAlojamiento): number | null {
  return catalogos.tiposEspacio[0]?.id ?? null;
}
