import { useSearchParams } from 'react-router-dom'
import { useCreateProfileStore } from '@/store/create-profile-store'
import { HairstylistV1 } from './HairstylistV1'
import { HairstylistV2 } from './HairstylistV2'
import { toHairstylistGender } from './hairstylist-data'

/**
 * /hairstylist — ?version=1/2/3 picks which flow to try (see HairstylistV1/V2
 * for what each one is). Version 3 isn't designed yet, so it falls back to v1.
 *
 * Gender is already known by the time this screen is reached (picked earlier
 * in /create-profile), so there's no gender control here — just the catalog
 * for whichever gender that step recorded.
 */
export function HairstylistPage() {
  const [params] = useSearchParams()
  const version = params.get('version') === '2' ? 2 : 1
  const gender = toHairstylistGender(useCreateProfileStore((s) => s.gender))

  if (version === 2) {
    return <HairstylistV2 gender={gender} />
  }
  return <HairstylistV1 gender={gender} />
}
