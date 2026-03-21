import { create } from 'zustand'
import type {
  StationId,
  RevealPhase,
  RevealType,
  StudioPhase,
  IrisRole,
  IrisSuggestion,
  PinnedVersion,
  Variation,
  StationSelections,
  LookSelections,
  SettingSelections,
  StyleSelections,
  RefineSelections,
} from '@/types/studio'
import { STATION_MAP } from '@/constants/stations'

const DEFAULT_ADJUSTMENTS = {
  saturation: 100,
  brightness: 100,
  temperature: 0,
  hue: 0,
}

const DEFAULT_SELECTIONS: StationSelections = {
  look: { faceId: null, postureId: null },
  setting: { backgroundId: null, customUpload: null },
  style: { outfitId: null, variantId: null, shopProduct: null },
  refine: {
    prompt: '',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    eraserPoints: [],
    brushSize: 20,
  },
}

const EMPTY_IRIS_GOALS_BY_STATION: Record<StationId, string> = {
  look: '',
  setting: '',
  style: '',
  refine: '',
}

interface StudioState {
  // Lifecycle
  phase: StudioPhase
  greetingComplete: boolean

  // Image
  sourceImage: string
  currentComposite: string

  // Navigation
  activeStation: StationId
  visitedStations: Set<StationId>

  // Selections
  stationSelections: StationSelections

  // Reveal
  revealPhase: RevealPhase
  revealStation: StationId | null
  pendingImage: string | null
  revealType: RevealType

  // Version Board
  pinnedVersions: PinnedVersion[]
  selectedFinalId: string | null

  // Variations
  variations: Variation[]
  variationsVisible: boolean

  // Looks
  activeLookId: string | null

  // Iris
  irisRole: IrisRole
  irisSuggestions: IrisSuggestion[]
  irisReaction: string | null
  irisVisible: boolean
  /** Per-station goal text in Iris panel — sent with apply; cleared after successful apply for that station */
  irisGoalByStation: Record<StationId, string>

  // Ambient
  ambientTint: string

  // Actions
  completeGreeting: () => void
  setActiveStation: (station: StationId) => void
  updateLookSelection: (partial: Partial<LookSelections>) => void
  updateSettingSelection: (partial: Partial<SettingSelections>) => void
  updateStyleSelection: (partial: Partial<StyleSelections>) => void
  updateRefineSelection: (partial: Partial<RefineSelections>) => void
  startReveal: (station: StationId, type?: RevealType) => void
  completeReveal: (newComposite: string) => void
  cancelReveal: () => void
  pinVersion: (label?: string) => void
  unpinVersion: (id: string) => void
  previewPinnedVersion: (id: string) => void
  showVariations: (variations: Variation[]) => void
  selectVariation: (id: string) => void
  dismissVariations: () => void
  setActiveLook: (lookId: string | null) => void
  startPicking: () => void
  selectFinal: (id: string) => void
  backToCreating: () => void
  setIrisReaction: (text: string | null) => void
  setIrisSuggestions: (suggestions: IrisSuggestion[]) => void
  setIrisGoalForStation: (station: StationId, text: string) => void
  clearIrisGoalForStation: (station: StationId) => void
  /** Load selected gallery image and open v2 Magic Studio (greeting + Let's go still shown) */
  enterMagicStudioFromGallery: (imageUrl: string) => void
  reset: () => void
}

export const useStudioStore = create<StudioState>((set, get) => ({
  // Initial state
  phase: 'greeting',
  greetingComplete: false,
  sourceImage: '/mock/faces/face-01.jpg',
  currentComposite: '/mock/faces/face-01.jpg',
  activeStation: 'look',
  visitedStations: new Set<StationId>(),
  stationSelections: structuredClone(DEFAULT_SELECTIONS),
  revealPhase: 'idle',
  revealStation: null,
  pendingImage: null,
  revealType: 'single',
  pinnedVersions: [],
  selectedFinalId: null,
  variations: [],
  variationsVisible: false,
  activeLookId: null,
  irisRole: 'photographer',
  irisSuggestions: [],
  irisReaction: null,
  irisVisible: true,
  irisGoalByStation: { ...EMPTY_IRIS_GOALS_BY_STATION },
  ambientTint: '#F0EDE8',

  completeGreeting: () =>
    set({ phase: 'creating', greetingComplete: true }),

  setActiveStation: (station) => {
    const stationDef = STATION_MAP[station]
    set((state) => ({
      activeStation: station,
      visitedStations: new Set([...state.visitedStations, station]),
      irisRole: stationDef.irisRole,
      ambientTint: stationDef.ambientTint,
      irisReaction: null,
      irisSuggestions: [],
    }))
  },

  updateLookSelection: (partial) =>
    set((state) => ({
      stationSelections: {
        ...state.stationSelections,
        look: { ...state.stationSelections.look, ...partial },
      },
    })),

  updateSettingSelection: (partial) =>
    set((state) => ({
      stationSelections: {
        ...state.stationSelections,
        setting: { ...state.stationSelections.setting, ...partial },
      },
    })),

  updateStyleSelection: (partial) =>
    set((state) => ({
      stationSelections: {
        ...state.stationSelections,
        style: { ...state.stationSelections.style, ...partial },
      },
    })),

  updateRefineSelection: (partial) =>
    set((state) => ({
      stationSelections: {
        ...state.stationSelections,
        refine: { ...state.stationSelections.refine, ...partial },
      },
    })),

  startReveal: (station, type = 'single') =>
    set({
      revealPhase: 'processing',
      revealStation: station,
      revealType: type,
    }),

  completeReveal: (newComposite) =>
    set({
      revealPhase: 'complete',
      currentComposite: newComposite,
      pendingImage: null,
    }),

  cancelReveal: () =>
    set({
      revealPhase: 'idle',
      revealStation: null,
      pendingImage: null,
    }),

  pinVersion: (label) => {
    const state = get()
    if (state.pinnedVersions.length >= 6) return
    const versionNumber = state.pinnedVersions.length + 1
    const newPin: PinnedVersion = {
      id: `pin-${Date.now()}`,
      image: state.currentComposite,
      timestamp: Date.now(),
      label: label || `v${versionNumber}`,
      stationSelections: structuredClone(state.stationSelections),
    }
    set({ pinnedVersions: [...state.pinnedVersions, newPin] })
  },

  unpinVersion: (id) =>
    set((state) => ({
      pinnedVersions: state.pinnedVersions.filter((v) => v.id !== id),
    })),

  previewPinnedVersion: (id) => {
    const version = get().pinnedVersions.find((v) => v.id === id)
    if (version) {
      set({ currentComposite: version.image })
    }
  },

  showVariations: (variations) =>
    set({ variations, variationsVisible: true }),

  selectVariation: (id) => {
    const variation = get().variations.find((v) => v.id === id)
    if (variation) {
      set({
        currentComposite: variation.image,
        variationsVisible: false,
        variations: [],
      })
    }
  },

  dismissVariations: () =>
    set({ variationsVisible: false, variations: [] }),

  setActiveLook: (lookId) =>
    set({ activeLookId: lookId }),

  startPicking: () =>
    set({ phase: 'picking' }),

  selectFinal: (id) =>
    set({ selectedFinalId: id, phase: 'done' }),

  backToCreating: () =>
    set({ phase: 'creating', selectedFinalId: null }),

  setIrisReaction: (text) =>
    set({ irisReaction: text }),

  setIrisSuggestions: (suggestions) =>
    set({ irisSuggestions: suggestions }),

  setIrisGoalForStation: (station, text) =>
    set((state) => ({
      irisGoalByStation: { ...state.irisGoalByStation, [station]: text },
    })),

  clearIrisGoalForStation: (station) =>
    set((state) => ({
      irisGoalByStation: { ...state.irisGoalByStation, [station]: '' },
    })),

  enterMagicStudioFromGallery: (imageUrl) => {
    get().reset()
    set({
      sourceImage: imageUrl,
      currentComposite: imageUrl,
    })
  },

  reset: () =>
    set({
      phase: 'greeting',
      greetingComplete: false,
      sourceImage: '/mock/faces/face-01.jpg',
      currentComposite: '/mock/faces/face-01.jpg',
      activeStation: 'look',
      visitedStations: new Set<StationId>(),
      stationSelections: structuredClone(DEFAULT_SELECTIONS),
      revealPhase: 'idle',
      revealStation: null,
      pendingImage: null,
      revealType: 'single',
      pinnedVersions: [],
      selectedFinalId: null,
      variations: [],
      variationsVisible: false,
      activeLookId: null,
      irisRole: 'photographer',
      irisSuggestions: [],
      irisReaction: null,
      irisVisible: true,
      irisGoalByStation: { ...EMPTY_IRIS_GOALS_BY_STATION },
      ambientTint: '#F0EDE8',
    }),
}))
