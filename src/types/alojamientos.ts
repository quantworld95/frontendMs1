/** Tipos alineados con ms-01 AlojamientoRegistroController / DTOs. */

export interface CatalogoItem {
  id: number;
  nombre: string;
}

export interface ServicioCatalogo {
  id: number;
  nombre: string;
  categoria: string;
}

export interface CatalogosAlojamiento {
  tiposPropiedad: CatalogoItem[];
  tiposEspacio: CatalogoItem[];
  servicios: ServicioCatalogo[];
}

export interface FotografiaAlojamiento {
  id: string;
  identificadorAlmacen: string;
  url: string;
  orden: number;
}

export interface ServicioAlojamiento {
  id: number;
  nombre: string;
  categoria: string;
}

export interface UnidadAlojamiento {
  id: string;
  tipoEspacioId: number;
  tipoEspacio: string;
  nombre: string;
  descripcion: string;
  capacidadHuespedes: number;
  cantidadDormitorios: number;
  cantidadCamas: number;
  cantidadBanos: number;
  inventarioTotal: number;
  precioNoche: number;
  estado: string;
  fotografias: FotografiaAlojamiento[];
  servicios: ServicioAlojamiento[];
}

export interface AlojamientoDetalle {
  id: string;
  anfitrionId: string;
  tipoPropiedadId: number;
  tipoPropiedad: string;
  titulo: string | null;
  descripcion: string | null;
  politicas: string | null;
  horarioEntrada: string | null;
  horarioSalida: string | null;
  direccion: string | null;
  ciudad: string | null;
  departamento: string | null;
  latitud: number | null;
  longitud: number | null;
  estado: string;
  motivo: string | null;
  fechaCreacion: string;
  establecimientoCompleto: boolean;
  listoParaRevision: boolean;
  fotografias: FotografiaAlojamiento[];
  servicios: ServicioAlojamiento[];
  unidades: UnidadAlojamiento[];
}

export interface AlojamientoResumen {
  id: string;
  tipoPropiedadId: number;
  tipoPropiedad: string;
  titulo: string | null;
  ciudad: string | null;
  departamento: string | null;
  estado: string;
  motivo: string | null;
  fechaCreacion: string;
  establecimientoCompleto: boolean;
  listoParaRevision: boolean;
  /** URL de la primera fotografía (orden más bajo), si existe. */
  fotoPortada: string | null;
}

export interface RegistroAlojamientoRequest {
  tipoPropiedadId: number;
}

export interface UbicacionRequest {
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  latitud?: number;
  longitud?: number;
}

export interface PresentacionRequest {
  titulo: string;
  descripcion: string;
  politicas?: string;
  horarioEntrada?: string;
  horarioSalida?: string;
}

export interface PoliticasRequest {
  politicas: string;
  horarioEntrada: string;
  horarioSalida: string;
}

export interface ServiciosRequest {
  servicios: number[];
}

export interface FotoRequest {
  id?: string;
  identificadorAlmacen: string;
  url: string;
  orden: number;
}

export interface FotografiasRequest {
  fotografias: FotoRequest[];
}

export interface OfertaUnicaRequest {
  capacidadHuespedes: number;
  cantidadDormitorios: number;
  cantidadCamas: number;
  cantidadBanos: number;
  precioNoche: number;
  politicas?: string;
  horarioEntrada?: string;
  horarioSalida?: string;
}

/** POST /alojamientos/{id}/unidades — alta individual de habitación. */
export interface AgregarUnidadRequest {
  tipoEspacioId: number;
  nombre: string;
  descripcion: string;
  capacidadHuespedes: number;
  cantidadDormitorios: number;
  cantidadCamas: number;
  cantidadBanos: number;
  inventarioTotal: number;
  precioNoche: number;
  fotografias: FotoRequest[];
  servicios: number[];
}

export interface ApiErrorBody {
  codigo?: string;
  mensaje?: string;
}
