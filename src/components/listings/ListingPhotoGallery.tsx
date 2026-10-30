interface ListingPhotoGalleryProps {
  photos: string[];
  name: string;
}

export function ListingPhotoGallery({ photos, name }: ListingPhotoGalleryProps) {
  const hero = photos[0];
  const sides = [1, 2, 3, 4].map((index) => photos[index] || hero).filter(Boolean) as string[];

  if (!hero) {
    return (
      <div className="flex h-[240px] items-center justify-center rounded-xl bg-surface-secondary text-sm text-ink-secondary sm:h-[320px] lg:h-[380px]">
        Aún no hay fotografías
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="grid h-[240px] grid-cols-1 gap-2 sm:h-[320px] sm:grid-cols-4 sm:grid-rows-2 lg:h-[380px]">
        <div className="h-full w-full sm:col-span-2 sm:row-span-2">
          <img src={hero} alt={name} className="h-full w-full object-cover" />
        </div>
        {sides.map((photo, index) => (
          <div key={`${photo}-tile-${index}`} className="hidden h-full min-h-0 w-full sm:block">
            <img
              src={photo}
              alt={`${name} ${index + 2}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
