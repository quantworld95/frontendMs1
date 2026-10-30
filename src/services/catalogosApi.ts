import { apiClient } from '@/api/client';
import type { CatalogosAlojamiento } from '@/types/alojamientos';

export function getCatalogosAlojamiento(): Promise<CatalogosAlojamiento> {
  return apiClient.get<CatalogosAlojamiento>('/catalogos-alojamiento');
}
