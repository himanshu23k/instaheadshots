import { useCallback, useMemo } from 'react'
import { useStudioStore } from '@/store/studio-store'
import { STATION_MAP } from '@/constants/stations'
import suggestionsData from '@/data/iris-suggestions.json'
import reactionsData from '@/data/iris-reactions.json'
import type { StationId, IrisSuggestion } from '@/types/studio'

const reactions = reactionsData as Record<string, string[]>
const suggestions = suggestionsData as Record<string, unknown>

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function useIris() {
  const activeStation = useStudioStore((s) => s.activeStation)
  const pinnedCount = useStudioStore((s) => s.pinnedVersions.length)

  /** Get the station greeting from Iris */
  const greeting = useMemo(() => {
    return STATION_MAP[activeStation]?.irisGreeting || ''
  }, [activeStation])

  /** Get a post-reveal reaction */
  const getReaction = useCallback(
    (station: StationId): string => {
      const stationReactions = reactions[station]
      if (!stationReactions || stationReactions.length === 0) {
        return 'Nice.'
      }
      return pickRandom(stationReactions)
    },
    []
  )

  /** Get contextual nudge suggestions */
  const getNudgeSuggestions = useCallback(
    (station: StationId): IrisSuggestion[] => {
      const result: IrisSuggestion[] = []
      const stationSuggestions = suggestions[station] as {
        nudges?: Array<{ text: string; optionId: string }>
        pairings?: Array<{ text: string; targetStation: string }>
      } | undefined

      if (!stationSuggestions) return result

      // Pick one nudge
      if (stationSuggestions.nudges && stationSuggestions.nudges.length > 0) {
        const nudge = pickRandom(stationSuggestions.nudges)
        result.push({
          id: `nudge-${Date.now()}`,
          text: nudge.text,
          station,
          optionId: nudge.optionId,
          type: 'nudge',
        })
      }

      // Pick one pairing (cross-station)
      if (stationSuggestions.pairings && stationSuggestions.pairings.length > 0) {
        const pairing = pickRandom(stationSuggestions.pairings)
        result.push({
          id: `pairing-${Date.now()}`,
          text: pairing.text,
          station: pairing.targetStation as StationId,
          type: 'pairing',
        })
      }

      // Maybe add a pin prompt if no versions pinned yet
      if (pinnedCount === 0) {
        const pinSuggestions = (suggestions as Record<string, unknown>).pin as Array<{ text: string }> | undefined
        if (pinSuggestions && pinSuggestions.length > 0) {
          result.push({
            id: `pin-${Date.now()}`,
            text: pickRandom(pinSuggestions).text,
            type: 'pin',
          })
        }
      }

      return result.slice(0, 2) // Max 2 suggestions at a time
    },
    [pinnedCount]
  )

  return { greeting, getReaction, getNudgeSuggestions }
}
