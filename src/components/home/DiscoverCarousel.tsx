const FACES = Array.from(
  { length: 12 },
  (_, i) => `/mock/faces/face-${String(i + 1).padStart(2, '0')}.jpg`,
)

type Feature = {
  id: string
  name: string
  subtitle: string
  image: string
}

const FEATURES: Feature[] = [
  { id: 'imagine', name: 'Imagine', subtitle: 'Type what you want', image: FACES[0] },
  { id: 'mix-match', name: 'Mix & Match', subtitle: 'Combine your favourites', image: FACES[3] },
  { id: 'looks', name: 'Looks', subtitle: 'You in many different ways', image: FACES[6] },
  { id: 'studio', name: 'Studio', subtitle: 'Edit any photo', image: FACES[9] },
]

export function DiscoverCarousel() {
  return (
    <section aria-labelledby="discover-heading" className="flex flex-col gap-3 md:gap-4">
      <h2 id="discover-heading" className="heading-2 text-text-body">
        Discover
      </h2>

      <div className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:mx-0 md:px-0 md:pb-0">
        {FEATURES.map((feature) => (
          <button
            key={feature.id}
            type="button"
            onClick={() => console.log('[home] open feature', feature.id)}
            aria-label={`${feature.name} — ${feature.subtitle}`}
            className="group flex flex-col shrink-0 w-[200px] snap-start md:w-auto md:shrink overflow-hidden border-2 border-button-primary-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-highlight focus-visible:ring-offset-2"
          >
            <div className="relative aspect-square w-full overflow-hidden bg-shapes-grey">
              <img
                src={feature.image}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />
            </div>
            <div className="flex flex-col gap-1 px-5 md:px-6 py-4 md:py-5 bg-button-primary-default text-text-white text-left">
              <span className="text-22 md:text-24 font-medium leading-tight truncate">
                {feature.name}
              </span>
              <span className="text-14 md:text-16 leading-snug text-text-white/65 truncate">
                {feature.subtitle}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
