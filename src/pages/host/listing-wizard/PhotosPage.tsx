import { ImagePlus, Star, Trash2 } from 'lucide-react';
import { useListingWizard } from '@/hooks/useListingWizard';
import { ListingWizardLayout } from '@/components/listings/ListingWizardLayout';

export default function PhotosPage() {
  const { data, addPhotos, removePhoto, setCoverPhoto } = useListingWizard();
  const cover = data.photos.find((photo) => photo.id === data.coverPhotoId) || data.photos[0];
  const rest = data.photos.filter((photo) => photo.id !== cover?.id);

  return (
    <ListingWizardLayout
      step={7}
      title="Agrega fotos de tu alojamiento"
      subtitle="Las fotos ayudan a mostrar lo mejor de tu espacio. Puedes quitar cualquiera antes de continuar."
    >
      <label
        htmlFor="listing-photos"
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#c9d5e5] bg-surface-secondary/50 px-5 py-8 text-center transition hover:border-brand-primary hover:bg-brand-light/40"
      >
        <ImagePlus className="h-8 w-8 text-brand-primary" />
        <span className="mt-3 text-sm font-semibold text-ink-primary">Selecciona tus fotografías</span>
        <span className="mt-1 text-xs text-ink-secondary">JPG, PNG o WEBP · Puedes agregar varias</span>
        <span className="mt-4 rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white">
          Elegir archivos
        </span>
        <input
          id="listing-photos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={(event) => event.target.files && addPhotos(event.target.files)}
        />
      </label>

      {data.photos.length > 0 && cover ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="group relative col-span-2 aspect-video overflow-hidden rounded-xl border border-brand-primary sm:col-span-1 sm:row-span-2">
            <img src={cover.url} alt="Vista previa principal" className="h-full w-full object-cover" />
            <span className="absolute left-2 top-2 rounded-md bg-brand-primary px-2 py-1 text-[10px] font-bold text-white">
              Principal
            </span>
            <button
              type="button"
              onClick={() => removePhoto(cover.id)}
              aria-label={`Eliminar ${cover.name}`}
              className="absolute right-2 top-2 rounded-lg bg-black/60 p-2 text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {rest.map((photo) => (
            <div key={photo.id} className="group relative aspect-video overflow-hidden rounded-xl border border-line">
              <img src={photo.url} alt={photo.name} className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 p-2 opacity-100 transition sm:translate-y-full sm:opacity-100 sm:group-hover:translate-y-0">
                <button
                  type="button"
                  onClick={() => setCoverPhoto(photo.id)}
                  className="text-[10px] font-semibold text-white"
                >
                  <Star className="mr-1 inline h-3 w-3" />
                  Principal
                </button>
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  aria-label={`Eliminar ${photo.name}`}
                  className="text-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <p className="mt-5 rounded-lg bg-brand-light px-4 py-3 text-xs leading-5 text-ink-secondary">
        Recomendación: incluye fotos de todos los ambientes, con buena iluminación y en formato
        horizontal cuando sea posible.
      </p>
    </ListingWizardLayout>
  );
}
