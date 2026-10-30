export interface RoomType {
  id: string;
  name: string;
  units: number;
  capacity: number;
  beds: string;
  bathrooms: number;
  price: string;
  status:
    | 'Activa'
    | 'Pausada'
    | 'Desactivada'
    | 'Suspendida'
    | 'En revisión'
    | 'Activo'
    | 'Borrador'
    | 'Rechazado'
    | 'Publicado';
  photo?: string;
  description?: string;
  services?: string[];
}

const storageKey = 'host-room-types';

function readStoredRooms(): Record<string, RoomType[]> {
  const value = window.localStorage.getItem(storageKey);
  if (!value) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, RoomType[]>) : {};
  } catch {
    return {};
  }
}

/** Habitaciones locales del anfitrión (sin seeds). Preferir unidades de la API en detalle. */
export function getRoomTypes(listingId: string): RoomType[] {
  return readStoredRooms()[listingId] ?? [];
}

export function saveRoomType(listingId: string, room: RoomType): void {
  const stored = readStoredRooms();
  const current = stored[listingId] ?? [];
  stored[listingId] = [...current.filter((item) => item.id !== room.id), room];
  window.localStorage.setItem(storageKey, JSON.stringify(stored));
}

export function deleteRoomType(listingId: string, roomId: string): void {
  const stored = readStoredRooms();
  const current = stored[listingId] ?? [];
  stored[listingId] = current.filter((room) => room.id !== roomId);
  window.localStorage.setItem(storageKey, JSON.stringify(stored));
}
