import type { Station, StationId } from '@/types/studio'

export const STATIONS: Station[] = [
  {
    id: 'look',
    label: 'Look',
    shortLabel: 'Look',
    icon: 'Eye',
    cost: 1,
    ambientTint: '#F0EDE8',  // warm cream (default)
    irisRole: 'photographer',
    irisGreeting: "Let's find your angle.",
  },
  {
    id: 'setting',
    label: 'Setting',
    shortLabel: 'Setting',
    icon: 'Aperture',
    cost: 1,
    ambientTint: '#EDF0F0',  // slightly cool
    irisRole: 'director',
    irisGreeting: 'Where does this version of you live?',
  },
  {
    id: 'style',
    label: 'Style',
    shortLabel: 'Style',
    icon: 'Shirt',
    cost: 1,
    ambientTint: '#F0EDE8',  // warm neutral
    irisRole: 'stylist',
    irisGreeting: "Clothes tell a story. What's yours?",
  },
  {
    id: 'refine',
    label: 'Refine',
    shortLabel: 'Refine',
    icon: 'Sparkles',
    cost: 1,
    ambientTint: '#E8E5E0',  // slightly dark
    irisRole: 'director',
    irisGreeting: "Almost there. Let's make it sing.",
  },
]

export const STATION_MAP: Record<StationId, Station> = Object.fromEntries(
  STATIONS.map((s) => [s.id, s])
) as Record<StationId, Station>

export const STATION_IDS: StationId[] = STATIONS.map((s) => s.id)

/** Get the index of a station (for ordering if needed) */
export function getStationIndex(id: StationId): number {
  return STATION_IDS.indexOf(id)
}
