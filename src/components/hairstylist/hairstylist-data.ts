/**
 * Static catalog for /hairstylist, generated from `context/hairstylist.md`
 * (parsed as YAML — the whole file is one YAML document under its comments).
 *
 * There are no per-style renders yet, so every tile borrows one of the six
 * wig mockups from the Figma file (`public/hairstylist/wig-*.jpg`) as a dummy.
 * The color axis is a placeholder set standing in for the project's full
 * haircolors.yaml palette (69 women's / 31 men's shades) until that's wired in.
 */

export type Gender = 'woman' | 'man'
export type TextureId = 'natural' | 'straight' | 'wavy' | 'curly' | 'coily' | 'frizzy'
export type SidesId =
  | 'uniform'
  | 'scissor_cut'
  | 'taper'
  | 'low_fade'
  | 'mid_fade'
  | 'high_fade'
  | 'skin_fade'
  | 'undercut'
export type LengthScale = 'body' | 'cropped' | 'afro' | 'mens_top'
export type ColorId =
  | 'natural'
  | 'black'
  | 'dark_brown'
  | 'medium_brown'
  | 'light_brown'
  | 'auburn'
  | 'copper_red'
  | 'strawberry_blonde'
  | 'golden_blonde'
  | 'ash_blonde'
  | 'platinum_blonde'
  | 'silver_gray'
  | 'burgundy'

export type StyleAxes = {
  sides?: { values: SidesId[]; default: SidesId }
  texture?: { values: TextureId[]; default: TextureId }
  length?: { scale: LengthScale; values: string[]; default: string }
}

export type Hairstyle = {
  id: string
  name: string
  gender: Gender
  family: string
  cut: string
  axes: StyleAxes
}

/** Every axis a style might carry, plus the color axis every style shares. */
export type AxisState = {
  sides?: SidesId
  texture?: TextureId
  length?: string
  color: ColorId
}

/** "bra_strap" -> "Bra Strap", "low_fade" -> "Low Fade". */
export function titleCase(id: string): string {
  return id
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export const HAIR_COLORS: { id: ColorId; label: string; swatch: string }[] = [
  { id: 'natural', label: 'Natural', swatch: '#E0E1E1' },
  { id: 'black', label: 'Black', swatch: '#1B1B1B' },
  { id: 'dark_brown', label: 'Dark Brown', swatch: '#3B2314' },
  { id: 'medium_brown', label: 'Medium Brown', swatch: '#6F4A2F' },
  { id: 'light_brown', label: 'Light Brown', swatch: '#A9734B' },
  { id: 'auburn', label: 'Auburn', swatch: '#7A3B2E' },
  { id: 'copper_red', label: 'Copper Red', swatch: '#B5502A' },
  { id: 'strawberry_blonde', label: 'Strawberry Blonde', swatch: '#D99A6C' },
  { id: 'golden_blonde', label: 'Golden Blonde', swatch: '#E0B973' },
  { id: 'ash_blonde', label: 'Ash Blonde', swatch: '#CBB994' },
  { id: 'platinum_blonde', label: 'Platinum Blonde', swatch: '#E8DCC0' },
  { id: 'silver_gray', label: 'Silver Gray', swatch: '#B9B9B9' },
  { id: 'burgundy', label: 'Burgundy', swatch: '#4B1F2F' },
]

export const HAIRSTYLES: Hairstyle[] = [
  {
    id: 'w_classic_bob',
    name: 'Classic Bob',
    gender: 'woman',
    family: 'bob',
    cut: 'a rounded bob with the ends curving gently inward and a soft, polished finish',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy', 'curly'], default: 'straight' },
      length: { scale: 'body', values: ['chin', 'neck'], default: 'chin' },
    },
  },
  {
    id: 'w_blunt_bob',
    name: 'Blunt Bob',
    gender: 'woman',
    family: 'bob',
    cut: 'one single length all the way round with no layers and a sharp, blunt horizontal edge',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy'], default: 'straight' },
      length: { scale: 'body', values: ['chin', 'neck', 'shoulder'], default: 'chin' },
    },
  },
  {
    id: 'w_a_line_bob',
    name: 'A-Line Bob',
    gender: 'woman',
    family: 'bob',
    cut: 'an A-line bob cut shorter at the back and angling down to a longer front',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy'], default: 'straight' },
      length: { scale: 'body', values: ['chin', 'neck'], default: 'chin' },
    },
  },
  {
    id: 'w_asymmetrical_bob',
    name: 'Asymmetrical Bob',
    gender: 'woman',
    family: 'bob',
    cut: 'an asymmetrical bob with one side cut noticeably longer than the other',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy'], default: 'straight' },
      length: { scale: 'body', values: ['chin', 'neck'], default: 'chin' },
    },
  },
  {
    id: 'w_french_bob',
    name: 'French Bob',
    gender: 'woman',
    family: 'bob',
    cut: 'a short French bob sitting at the jaw with a blunt fringe across the brows',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy'], default: 'straight' },
      length: { scale: 'body', values: ['chin'], default: 'chin' },
    },
  },
  {
    id: 'w_italian_bob',
    name: 'Italian Bob',
    gender: 'woman',
    family: 'bob',
    cut: 'a jaw-length bob with soft bevelled ends turning under and plenty of body through the sides',
    axes: {
      texture: { values: ['straight', 'wavy'], default: 'wavy' },
      length: { scale: 'body', values: ['chin', 'neck'], default: 'chin' },
    },
  },
  {
    id: 'w_curly_bob',
    name: 'Curly Bob',
    gender: 'woman',
    family: 'bob',
    cut: 'a bob shaped for curl, cut curl by curl so the perimeter falls in a soft rounded shape',
    axes: {
      texture: { values: ['curly', 'coily'], default: 'curly' },
      length: { scale: 'body', values: ['chin', 'neck', 'shoulder'], default: 'chin' },
    },
  },
  {
    id: 'w_long_bob',
    name: 'Long Bob (Lob)',
    gender: 'woman',
    family: 'lob',
    cut: 'a long bob falling just above the shoulders with a subtle inward curve at the ends',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy', 'curly'], default: 'straight' },
      length: { scale: 'body', values: ['neck', 'shoulder'], default: 'shoulder' },
    },
  },
  {
    id: 'w_textured_lob',
    name: 'Textured Lob',
    gender: 'woman',
    family: 'lob',
    cut: 'a lob cut with piecey, point-cut ends and visible separation through the lengths',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy', 'curly'], default: 'wavy' },
      length: { scale: 'body', values: ['neck', 'shoulder', 'collarbone'], default: 'shoulder' },
    },
  },
  {
    id: 'w_pixie_cut',
    name: 'Pixie Cut',
    gender: 'woman',
    family: 'pixie',
    cut: 'cropped close through the sides and nape with the weight kept on top',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy', 'curly', 'coily', 'frizzy'], default: 'natural' },
      length: { scale: 'cropped', values: ['crop', 'classic', 'textured', 'long', 'grown_out'], default: 'classic' },
    },
  },
  {
    id: 'w_buzz_cut',
    name: 'Buzz Cut',
    gender: 'woman',
    family: 'pixie',
    cut: 'clipped to a uniform very short length all over with a soft even outline',
    axes: {
      texture: { values: ['natural', 'straight', 'coily'], default: 'natural' },
      length: { scale: 'cropped', values: ['crop'], default: 'crop' },
    },
  },
  {
    id: 'w_short_textured_crop',
    name: 'Short Textured Crop',
    gender: 'woman',
    family: 'pixie',
    cut: 'a short crop with choppy, piece-y layers through the top and a tousled finish',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy', 'curly', 'coily', 'frizzy'], default: 'natural' },
      length: { scale: 'cropped', values: ['crop', 'classic', 'textured'], default: 'textured' },
    },
  },
  {
    id: 'w_tapered_cut',
    name: 'Tapered Cut',
    gender: 'woman',
    family: 'pixie',
    cut: 'very short at the sides and nape, tapering longer towards the top of the head',
    axes: {
      texture: { values: ['natural', 'wavy', 'curly', 'coily'], default: 'coily' },
      length: { scale: 'cropped', values: ['crop', 'classic', 'textured'], default: 'classic' },
    },
  },
  {
    id: 'w_buzzed_sides_long_top',
    name: 'Buzzed Sides, Long Top',
    gender: 'woman',
    family: 'pixie',
    cut: 'the sides clipped very short with a hard disconnection and a long styled section on top',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy', 'curly', 'coily'], default: 'natural' },
      length: { scale: 'cropped', values: ['textured', 'long', 'grown_out'], default: 'long' },
    },
  },
  {
    id: 'w_layered_cut',
    name: 'Layered Cut',
    gender: 'woman',
    family: 'layered',
    cut: 'graduated layers cut throughout, shorter through the top and crown and progressively longer towards the ends',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy'], default: 'straight' },
      length: {
        scale: 'body',
        values: ['chin', 'neck', 'shoulder', 'collarbone', 'armpit', 'mid_back'],
        default: 'collarbone',
      },
    },
  },
  {
    id: 'w_long_layers',
    name: 'Long Layers',
    gender: 'woman',
    family: 'layered',
    cut: 'long layers cut into the lengths with face-framing pieces at the front and the bulk kept long',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy'], default: 'wavy' },
      length: {
        scale: 'body',
        values: ['collarbone', 'armpit', 'bra_strap', 'mid_back', 'waist'],
        default: 'mid_back',
      },
    },
  },
  {
    id: 'w_shaggy_layers',
    name: 'Shag',
    gender: 'woman',
    family: 'layered',
    cut: 'a shag with choppy stacked layers through the crown and wispy separated ends',
    axes: {
      texture: { values: ['natural', 'wavy', 'curly', 'frizzy'], default: 'wavy' },
      length: { scale: 'body', values: ['neck', 'shoulder', 'collarbone', 'armpit'], default: 'collarbone' },
    },
  },
  {
    id: 'w_wolf_cut',
    name: 'Wolf Cut',
    gender: 'woman',
    family: 'layered',
    cut: 'heavy graduated layers, short around the crown and lengthening steeply towards the ends, with a face-framing fringe',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy', 'curly', 'frizzy'], default: 'wavy' },
      length: { scale: 'body', values: ['shoulder', 'collarbone', 'armpit'], default: 'armpit' },
    },
  },
  {
    id: 'w_butterfly_cut',
    name: 'Butterfly Cut',
    gender: 'woman',
    family: 'layered',
    cut: 'shorter face-framing layers around the cheekbones over much longer layers underneath',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy'], default: 'straight' },
      length: { scale: 'body', values: ['armpit', 'bra_strap', 'mid_back'], default: 'mid_back' },
    },
  },
  {
    id: 'w_curly_shag',
    name: 'Curly Shag',
    gender: 'woman',
    family: 'layered',
    cut: 'a shag cut for curl, with stacked layers that let the curls stack and expand outward',
    axes: {
      texture: { values: ['curly', 'coily', 'frizzy'], default: 'curly' },
      length: { scale: 'body', values: ['shoulder', 'collarbone', 'armpit'], default: 'collarbone' },
    },
  },
  {
    id: 'w_deva_cut',
    name: 'Curly Layered Cut',
    gender: 'woman',
    family: 'layered',
    cut: 'layers cut curl by curl on dry hair so each curl sits into the shape without losing length',
    axes: {
      texture: { values: ['curly', 'coily'], default: 'curly' },
      length: { scale: 'body', values: ['shoulder', 'collarbone', 'armpit', 'bra_strap'], default: 'armpit' },
    },
  },
  {
    id: 'w_blowout',
    name: 'Blowout',
    gender: 'woman',
    family: 'smooth',
    cut: 'blown out smooth and full with soft volume at the root and the ends turning gently under',
    axes: {
      texture: { values: ['straight', 'wavy'], default: 'straight' },
      length: { scale: 'body', values: ['shoulder', 'collarbone', 'armpit', 'bra_strap'], default: 'collarbone' },
    },
  },
  {
    id: 'w_middle_part_sleek',
    name: 'Sleek Middle Part',
    gender: 'woman',
    family: 'smooth',
    cut: 'a clean centre parting with the hair falling flat and even on both sides',
    axes: {
      texture: { values: ['straight', 'wavy'], default: 'straight' },
      length: {
        scale: 'body',
        values: ['collarbone', 'armpit', 'bra_strap', 'mid_back', 'waist'],
        default: 'mid_back',
      },
    },
  },
  {
    id: 'w_deep_side_part',
    name: 'Deep Side Part',
    gender: 'woman',
    family: 'smooth',
    cut: 'a deep side parting with the heavier side sweeping across the forehead',
    axes: {
      texture: { values: ['straight', 'wavy'], default: 'straight' },
      length: { scale: 'body', values: ['shoulder', 'collarbone', 'armpit', 'bra_strap'], default: 'armpit' },
    },
  },
  {
    id: 'w_old_hollywood_waves',
    name: 'Old Hollywood Waves',
    gender: 'woman',
    family: 'smooth',
    cut: 'deep sculpted S-waves pressed into a uniform pattern and falling to one shoulder',
    axes: {
      texture: { values: ['wavy'], default: 'wavy' },
      length: { scale: 'body', values: ['shoulder', 'collarbone', 'armpit'], default: 'collarbone' },
    },
  },
  {
    id: 'w_curtain_bangs',
    name: 'Curtain Bangs',
    gender: 'woman',
    family: 'fringe',
    cut: 'centre-parted curtain bangs sweeping open from the middle of the forehead down to the cheekbones, blending into the length',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy', 'curly'], default: 'straight' },
      length: {
        scale: 'body',
        values: ['shoulder', 'collarbone', 'armpit', 'bra_strap', 'mid_back'],
        default: 'collarbone',
      },
    },
  },
  {
    id: 'w_blunt_bangs',
    name: 'Blunt Bangs',
    gender: 'woman',
    family: 'fringe',
    cut: 'a heavy blunt fringe cut straight across just above the eyebrows',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy'], default: 'straight' },
      length: { scale: 'body', values: ['collarbone', 'armpit', 'bra_strap', 'mid_back'], default: 'armpit' },
    },
  },
  {
    id: 'w_side_swept_bangs',
    name: 'Side Swept Bangs',
    gender: 'woman',
    family: 'fringe',
    cut: 'a fringe angled across the forehead and swept to one side, blending into the layers',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy', 'curly'], default: 'wavy' },
      length: { scale: 'body', values: ['collarbone', 'armpit', 'bra_strap'], default: 'armpit' },
    },
  },
  {
    id: 'w_wispy_bangs',
    name: 'Wispy Bangs',
    gender: 'woman',
    family: 'fringe',
    cut: 'a light feathered fringe with visible gaps, sitting softly across the forehead',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy'], default: 'straight' },
      length: { scale: 'body', values: ['collarbone', 'armpit', 'bra_strap'], default: 'armpit' },
    },
  },
  {
    id: 'w_natural_afro',
    name: 'Afro',
    gender: 'woman',
    family: 'natural',
    cut: 'a full rounded afro shaped evenly all round',
    axes: {
      texture: { values: ['coily'], default: 'coily' },
      length: { scale: 'afro', values: ['tapered', 'short', 'medium', 'full'], default: 'medium' },
    },
  },
  {
    id: 'w_twist_out',
    name: 'Twist Out',
    gender: 'woman',
    family: 'natural',
    cut: 'elongated defined curls set by unravelling two-strand twists',
    axes: {
      texture: { values: ['coily', 'curly'], default: 'coily' },
      length: { scale: 'body', values: ['neck', 'shoulder', 'collarbone', 'armpit'], default: 'shoulder' },
    },
  },
  {
    id: 'w_wash_and_go',
    name: 'Wash and Go',
    gender: 'woman',
    family: 'natural',
    cut: 'natural curls left to air-dry in their own pattern with defined, moisturised separation',
    axes: {
      texture: { values: ['curly', 'coily'], default: 'coily' },
      length: { scale: 'body', values: ['neck', 'shoulder', 'collarbone'], default: 'shoulder' },
    },
  },
  {
    id: 'w_low_bun',
    name: 'Low Bun',
    gender: 'woman',
    family: 'arrangement',
    cut: 'the hair gathered smoothly and twisted into a neat bun at the nape of the neck',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy', 'curly', 'coily'], default: 'straight' },
    },
  },
  {
    id: 'w_classic_chignon',
    name: 'Chignon',
    gender: 'woman',
    family: 'arrangement',
    cut: 'the hair rolled and pinned into a low, elegant knot at the back of the head',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy'], default: 'straight' },
    },
  },
  {
    id: 'w_french_twist',
    name: 'French Twist',
    gender: 'woman',
    family: 'arrangement',
    cut: 'the hair swept up and twisted vertically against the back of the head and pinned',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy'], default: 'straight' },
    },
  },
  {
    id: 'w_low_ponytail',
    name: 'Low Ponytail',
    gender: 'woman',
    family: 'arrangement',
    cut: 'the hair gathered and tied smoothly at the nape of the neck',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy', 'curly', 'coily'], default: 'straight' },
    },
  },
  {
    id: 'w_high_ponytail',
    name: 'High Ponytail',
    gender: 'woman',
    family: 'arrangement',
    cut: 'the hair gathered and tied high at the crown with volume through the top',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy', 'curly', 'coily'], default: 'straight' },
    },
  },
  {
    id: 'w_sleek_ponytail',
    name: 'Sleek Ponytail',
    gender: 'woman',
    family: 'arrangement',
    cut: 'the hair pulled back completely flat against the head and tied, with no volume at the root',
    axes: {
      texture: { values: ['straight'], default: 'straight' },
    },
  },
  {
    id: 'w_messy_bun',
    name: 'Messy Bun',
    gender: 'woman',
    family: 'arrangement',
    cut: 'the hair loosely gathered into a bun on top with soft pieces pulled out around the face',
    axes: {
      texture: { values: ['natural', 'wavy', 'curly', 'coily'], default: 'wavy' },
    },
  },
  {
    id: 'w_top_knot',
    name: 'Top Knot',
    gender: 'woman',
    family: 'arrangement',
    cut: 'the hair pulled up and twisted tightly into a knot at the very top of the head',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy', 'curly', 'coily'], default: 'straight' },
    },
  },
  {
    id: 'w_claw_clip_updo',
    name: 'Claw Clip Updo',
    gender: 'woman',
    family: 'arrangement',
    cut: 'the hair twisted up and held with a claw clip, with loose pieces falling at the front',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy'], default: 'wavy' },
    },
  },
  {
    id: 'w_half_up_half_down',
    name: 'Half Up Half Down',
    gender: 'woman',
    family: 'arrangement',
    cut: 'the top section pulled back and secured with the rest left flowing loose',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy', 'curly', 'coily'], default: 'wavy' },
    },
  },
  {
    id: 'w_box_braids',
    name: 'Box Braids',
    gender: 'woman',
    family: 'treatment',
    cut: 'individual square-sectioned braids of even medium gauge, parted down the centre',
    axes: {
      length: {
        scale: 'body',
        values: ['shoulder', 'collarbone', 'armpit', 'bra_strap', 'mid_back', 'waist'],
        default: 'mid_back',
      },
    },
  },
  {
    id: 'w_knotless_braids',
    name: 'Knotless Braids',
    gender: 'woman',
    family: 'treatment',
    cut: 'knotless braids fed in from the scalp so each braid lies flat at the root',
    axes: {
      length: {
        scale: 'body',
        values: ['shoulder', 'collarbone', 'armpit', 'bra_strap', 'mid_back', 'waist'],
        default: 'mid_back',
      },
    },
  },
  {
    id: 'w_micro_braids',
    name: 'Micro Braids',
    gender: 'woman',
    family: 'treatment',
    cut: 'very fine individual braids in small even sections across the whole head',
    axes: {
      length: { scale: 'body', values: ['collarbone', 'armpit', 'bra_strap', 'mid_back'], default: 'bra_strap' },
    },
  },
  {
    id: 'w_goddess_braids',
    name: 'Goddess Braids',
    gender: 'woman',
    family: 'treatment',
    cut: 'large braids fed close to the scalp with loose wavy pieces left out along their length',
    axes: {
      length: { scale: 'body', values: ['collarbone', 'armpit', 'bra_strap', 'mid_back'], default: 'bra_strap' },
    },
  },
  {
    id: 'w_senegalese_twists',
    name: 'Senegalese Twists',
    gender: 'woman',
    family: 'treatment',
    cut: 'smooth rope-like two-strand twists in even sections',
    axes: {
      length: {
        scale: 'body',
        values: ['shoulder', 'collarbone', 'armpit', 'bra_strap', 'mid_back'],
        default: 'armpit',
      },
    },
  },
  {
    id: 'w_cornrows',
    name: 'Cornrows',
    gender: 'woman',
    family: 'treatment',
    cut: 'hair braided flat against the scalp in neat straight-back rows',
    axes: {
      length: { scale: 'body', values: ['neck', 'shoulder', 'collarbone'], default: 'neck' },
    },
  },
  {
    id: 'w_dutch_braid',
    name: 'Dutch Braid',
    gender: 'woman',
    family: 'treatment',
    cut: 'a single raised inverted braid woven down the centre of the back',
    axes: {
      length: { scale: 'body', values: ['shoulder', 'collarbone', 'armpit', 'bra_strap'], default: 'armpit' },
    },
  },
  {
    id: 'w_double_braids',
    name: 'Double Braids',
    gender: 'woman',
    family: 'treatment',
    cut: 'two neat braids starting at each side of the head and running down',
    axes: {
      length: { scale: 'body', values: ['shoulder', 'collarbone', 'armpit', 'bra_strap'], default: 'armpit' },
    },
  },
  {
    id: 'w_side_braid',
    name: 'Side Braid',
    gender: 'woman',
    family: 'treatment',
    cut: 'a loose braid drawn over one shoulder with soft pieces left around the face',
    axes: {
      length: { scale: 'body', values: ['collarbone', 'armpit', 'bra_strap', 'mid_back'], default: 'bra_strap' },
    },
  },
  {
    id: 'w_fishtail_braid',
    name: 'Fishtail Braid',
    gender: 'woman',
    family: 'treatment',
    cut: 'a fishtail braid woven in a fine herringbone pattern',
    axes: {
      length: { scale: 'body', values: ['collarbone', 'armpit', 'bra_strap', 'mid_back'], default: 'bra_strap' },
    },
  },
  {
    id: 'w_crown_braid',
    name: 'Crown Braid',
    gender: 'woman',
    family: 'treatment',
    cut: 'braids taken around the head and pinned like a halo',
    axes: {
      length: { scale: 'body', values: ['shoulder'], default: 'shoulder' },
    },
  },
  {
    id: 'w_braided_updo',
    name: 'Braided Updo',
    gender: 'woman',
    family: 'treatment',
    cut: 'braids twisted and pinned into a gathered shape at the back of the head',
    axes: {
      length: { scale: 'body', values: ['shoulder'], default: 'shoulder' },
    },
  },
  {
    id: 'w_medium_locs',
    name: 'Locs',
    gender: 'woman',
    family: 'treatment',
    cut: 'neat evenly sectioned locs with a natural, well-kept surface',
    axes: {
      length: {
        scale: 'body',
        values: ['neck', 'shoulder', 'collarbone', 'armpit', 'bra_strap', 'mid_back'],
        default: 'shoulder',
      },
    },
  },
  {
    id: 'w_faux_locs',
    name: 'Faux Locs',
    gender: 'woman',
    family: 'treatment',
    cut: 'uniform wrapped faux locs of even thickness',
    axes: {
      length: {
        scale: 'body',
        values: ['shoulder', 'collarbone', 'armpit', 'bra_strap', 'mid_back'],
        default: 'armpit',
      },
    },
  },
  {
    id: 'm_buzz_cut',
    name: 'Buzz Cut',
    gender: 'man',
    family: 'clipper',
    cut: 'clipped to a single uniform length over the whole head with a clean outline',
    axes: {
      sides: { values: ['uniform'], default: 'uniform' },
      texture: { values: ['natural', 'straight', 'coily'], default: 'natural' },
      length: { scale: 'mens_top', values: ['buzz'], default: 'buzz' },
    },
  },
  {
    id: 'm_shaved_head',
    name: 'Shaved Head',
    gender: 'man',
    family: 'clipper',
    cut: 'the head shaved completely smooth with no stubble',
    axes: {
      sides: { values: ['uniform'], default: 'uniform' },
      texture: { values: ['natural'], default: 'natural' },
      length: { scale: 'mens_top', values: ['buzz'], default: 'buzz' },
    },
  },
  {
    id: 'm_crew_cut',
    name: 'Crew Cut',
    gender: 'man',
    family: 'classic',
    cut: 'an evenly trimmed flat top with the front left slightly longer than the crown',
    axes: {
      sides: { values: ['taper', 'low_fade', 'mid_fade'], default: 'taper' },
      texture: { values: ['natural', 'straight', 'wavy'], default: 'straight' },
      length: { scale: 'mens_top', values: ['very_short', 'short'], default: 'short' },
    },
  },
  {
    id: 'm_ivy_league',
    name: 'Ivy League',
    gender: 'man',
    family: 'classic',
    cut: 'a crew cut left long enough at the front to take a side parting and comb over',
    axes: {
      sides: { values: ['taper', 'low_fade'], default: 'taper' },
      texture: { values: ['natural', 'straight', 'wavy'], default: 'straight' },
      length: { scale: 'mens_top', values: ['short', 'medium'], default: 'short' },
    },
  },
  {
    id: 'm_regulation_cut',
    name: 'Regulation Cut',
    gender: 'man',
    family: 'classic',
    cut: 'a military regulation cut, short and square on top with a sharp neat outline',
    axes: {
      sides: { values: ['taper'], default: 'taper' },
      texture: { values: ['natural', 'straight'], default: 'straight' },
      length: { scale: 'mens_top', values: ['very_short', 'short'], default: 'very_short' },
    },
  },
  {
    id: 'm_classic_taper',
    name: 'Classic Taper',
    gender: 'man',
    family: 'classic',
    cut: "a classic barber's taper with the length on top left natural and unstyled",
    axes: {
      sides: { values: ['taper', 'low_fade'], default: 'taper' },
      texture: { values: ['natural', 'straight', 'wavy', 'curly', 'coily'], default: 'natural' },
      length: { scale: 'mens_top', values: ['short', 'medium'], default: 'short' },
    },
  },
  {
    id: 'm_short_side_part',
    name: 'Side Part',
    gender: 'man',
    family: 'classic',
    cut: 'a defined hard side parting with the top combed neatly across',
    axes: {
      sides: { values: ['scissor_cut', 'taper', 'low_fade'], default: 'taper' },
      texture: { values: ['straight', 'wavy'], default: 'straight' },
      length: { scale: 'mens_top', values: ['short', 'medium'], default: 'short' },
    },
  },
  {
    id: 'm_slicked_back',
    name: 'Slicked Back',
    gender: 'man',
    family: 'classic',
    cut: 'the top swept straight back off the forehead with a smooth polished finish',
    axes: {
      sides: { values: ['scissor_cut', 'taper', 'low_fade', 'undercut'], default: 'taper' },
      texture: { values: ['straight', 'wavy'], default: 'straight' },
      length: { scale: 'mens_top', values: ['medium', 'long'], default: 'medium' },
    },
  },
  {
    id: 'm_business_pompadour',
    name: 'Pompadour',
    gender: 'man',
    family: 'classic',
    cut: 'height built at the front and swept up and back, tapering down towards the crown',
    axes: {
      sides: { values: ['taper', 'low_fade', 'mid_fade'], default: 'low_fade' },
      texture: { values: ['straight', 'wavy'], default: 'straight' },
      length: { scale: 'mens_top', values: ['medium', 'long'], default: 'medium' },
    },
  },
  {
    id: 'm_messy_quiff',
    name: 'Quiff',
    gender: 'man',
    family: 'modern',
    cut: 'volume lifted at the front and pushed up and back, left tousled rather than combed',
    axes: {
      sides: { values: ['taper', 'low_fade', 'mid_fade', 'skin_fade'], default: 'mid_fade' },
      texture: { values: ['natural', 'straight', 'wavy', 'curly'], default: 'wavy' },
      length: { scale: 'mens_top', values: ['medium', 'long'], default: 'medium' },
    },
  },
  {
    id: 'm_textured_crop',
    name: 'Textured Crop',
    gender: 'man',
    family: 'modern',
    cut: 'a choppy layered top with the ends point-cut for separation, pushed forward',
    axes: {
      sides: { values: ['low_fade', 'mid_fade', 'high_fade', 'skin_fade'], default: 'mid_fade' },
      texture: { values: ['natural', 'straight', 'wavy', 'curly'], default: 'wavy' },
      length: { scale: 'mens_top', values: ['short', 'medium'], default: 'short' },
    },
  },
  {
    id: 'm_french_crop',
    name: 'French Crop',
    gender: 'man',
    family: 'modern',
    cut: 'a short textured top with a straight-cut fringe pushed flat across the forehead',
    axes: {
      sides: { values: ['mid_fade', 'high_fade', 'skin_fade'], default: 'high_fade' },
      texture: { values: ['natural', 'straight', 'wavy', 'curly'], default: 'straight' },
      length: { scale: 'mens_top', values: ['short', 'medium'], default: 'short' },
    },
  },
  {
    id: 'm_textured_fringe',
    name: 'Textured Fringe',
    gender: 'man',
    family: 'modern',
    cut: 'layered length left at the front to fall naturally across the forehead',
    axes: {
      sides: { values: ['taper', 'low_fade', 'mid_fade'], default: 'low_fade' },
      texture: { values: ['natural', 'straight', 'wavy', 'curly'], default: 'wavy' },
      length: { scale: 'mens_top', values: ['short', 'medium'], default: 'medium' },
    },
  },
  {
    id: 'm_spiky_textured',
    name: 'Spiky Textured',
    gender: 'man',
    family: 'modern',
    cut: 'the top styled upward into soft separated points',
    axes: {
      sides: { values: ['taper', 'low_fade', 'mid_fade'], default: 'low_fade' },
      texture: { values: ['straight', 'wavy'], default: 'straight' },
      length: { scale: 'mens_top', values: ['short', 'medium'], default: 'short' },
    },
  },
  {
    id: 'm_faux_hawk',
    name: 'Faux Hawk',
    gender: 'man',
    family: 'modern',
    cut: 'a strip of length along the centre styled upward, the sides taken down short',
    axes: {
      sides: { values: ['mid_fade', 'high_fade', 'skin_fade', 'undercut'], default: 'high_fade' },
      texture: { values: ['natural', 'straight', 'wavy', 'curly', 'coily'], default: 'natural' },
      length: { scale: 'mens_top', values: ['short', 'medium'], default: 'medium' },
    },
  },
  {
    id: 'm_mohawk',
    name: 'Mohawk',
    gender: 'man',
    family: 'modern',
    cut: 'a bold strip of long hair down the centre with the sides taken right down',
    axes: {
      sides: { values: ['high_fade', 'skin_fade'], default: 'skin_fade' },
      texture: { values: ['natural', 'straight', 'wavy', 'curly', 'coily'], default: 'natural' },
      length: { scale: 'mens_top', values: ['medium', 'long'], default: 'long' },
    },
  },
  {
    id: 'm_modern_mullet',
    name: 'Modern Mullet',
    gender: 'man',
    family: 'modern',
    cut: 'short and textured through the front and sides with deliberate length left long at the back',
    axes: {
      sides: { values: ['taper', 'mid_fade'], default: 'taper' },
      texture: { values: ['natural', 'straight', 'wavy', 'curly'], default: 'wavy' },
      length: { scale: 'mens_top', values: ['medium', 'long'], default: 'medium' },
    },
  },
  {
    id: 'm_tousled_medium',
    name: 'Tousled Medium',
    gender: 'man',
    family: 'long',
    cut: 'mid-length hair left loose with natural movement and no fixed parting',
    axes: {
      sides: { values: ['scissor_cut', 'taper'], default: 'scissor_cut' },
      texture: { values: ['natural', 'straight', 'wavy', 'curly'], default: 'wavy' },
      length: { scale: 'mens_top', values: ['medium', 'long'], default: 'medium' },
    },
  },
  {
    id: 'm_curtain_bangs',
    name: 'Curtains',
    gender: 'man',
    family: 'long',
    cut: 'a centre parting with the front lengths falling open on either side of the forehead',
    axes: {
      sides: { values: ['scissor_cut', 'taper', 'low_fade'], default: 'scissor_cut' },
      texture: { values: ['natural', 'straight', 'wavy'], default: 'straight' },
      length: { scale: 'mens_top', values: ['medium', 'long'], default: 'long' },
    },
  },
  {
    id: 'm_shoulder_length',
    name: 'Shoulder Length',
    gender: 'man',
    family: 'long',
    cut: 'grown out to the shoulders with natural flow and a soft parting',
    axes: {
      sides: { values: ['scissor_cut'], default: 'scissor_cut' },
      texture: { values: ['natural', 'straight', 'wavy', 'curly'], default: 'wavy' },
      length: { scale: 'mens_top', values: ['flowing'], default: 'flowing' },
    },
  },
  {
    id: 'm_long_swept_back',
    name: 'Long Swept Back',
    gender: 'man',
    family: 'long',
    cut: 'long hair pushed back off the forehead with volume held at the root',
    axes: {
      sides: { values: ['scissor_cut'], default: 'scissor_cut' },
      texture: { values: ['straight', 'wavy'], default: 'wavy' },
      length: { scale: 'mens_top', values: ['long', 'flowing'], default: 'flowing' },
    },
  },
  {
    id: 'm_curly_top_fade',
    name: 'Curly Top',
    gender: 'man',
    family: 'natural',
    cut: 'the curl kept full and defined on top with the sides taken down clean',
    axes: {
      sides: { values: ['low_fade', 'mid_fade', 'high_fade', 'skin_fade'], default: 'mid_fade' },
      texture: { values: ['curly', 'coily'], default: 'curly' },
      length: { scale: 'mens_top', values: ['short', 'medium'], default: 'medium' },
    },
  },
  {
    id: 'm_afro',
    name: 'Afro',
    gender: 'man',
    family: 'natural',
    cut: 'a full rounded afro shaped evenly all round',
    axes: {
      sides: { values: ['uniform', 'taper', 'low_fade'], default: 'taper' },
      texture: { values: ['coily'], default: 'coily' },
      length: { scale: 'afro', values: ['tapered', 'short', 'medium', 'full'], default: 'short' },
    },
  },
  {
    id: 'm_twist_out',
    name: 'Twist Out',
    gender: 'man',
    family: 'natural',
    cut: 'elongated defined curls set by unravelling two-strand twists',
    axes: {
      sides: { values: ['uniform', 'taper', 'low_fade'], default: 'taper' },
      texture: { values: ['coily', 'curly'], default: 'coily' },
      length: { scale: 'mens_top', values: ['short', 'medium'], default: 'medium' },
    },
  },
  {
    id: 'm_waves_360',
    name: '360 Waves',
    gender: 'man',
    family: 'natural',
    cut: 'short coily hair brushed into a continuous ripple pattern radiating from the crown',
    axes: {
      sides: { values: ['taper', 'low_fade'], default: 'taper' },
      texture: { values: ['coily'], default: 'coily' },
      length: { scale: 'mens_top', values: ['very_short', 'short'], default: 'very_short' },
    },
  },
  {
    id: 'm_man_bun',
    name: 'Man Bun',
    gender: 'man',
    family: 'arrangement',
    cut: 'the hair pulled back and tied into a bun at the crown',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy', 'curly'], default: 'straight' },
    },
  },
  {
    id: 'm_top_knot',
    name: 'Top Knot',
    gender: 'man',
    family: 'arrangement',
    cut: 'the top length gathered and tied at the very top of the head with the sides kept short',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy', 'curly'], default: 'straight' },
    },
  },
  {
    id: 'm_ponytail',
    name: 'Ponytail',
    gender: 'man',
    family: 'arrangement',
    cut: 'the hair gathered and tied at the back of the head',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy', 'curly'], default: 'straight' },
    },
  },
  {
    id: 'm_half_up_half_down',
    name: 'Half Up',
    gender: 'man',
    family: 'arrangement',
    cut: 'the top section tied back with the rest left loose',
    axes: {
      texture: { values: ['natural', 'straight', 'wavy', 'curly'], default: 'wavy' },
    },
  },
  {
    id: 'm_cornrows',
    name: 'Cornrows',
    gender: 'man',
    family: 'treatment',
    cut: 'hair braided flat against the scalp in neat straight-back rows',
    axes: {
      length: { scale: 'mens_top', values: ['short', 'medium'], default: 'short' },
    },
  },
  {
    id: 'm_braided_top',
    name: 'Braided Top',
    gender: 'man',
    family: 'treatment',
    cut: 'small braids on top styled backward with the sides taken down clean',
    axes: {
      length: { scale: 'mens_top', values: ['short', 'medium'], default: 'medium' },
    },
  },
  {
    id: 'm_box_braids_short',
    name: 'Box Braids',
    gender: 'man',
    family: 'treatment',
    cut: 'individual square-sectioned braids in even parts',
    axes: {
      length: { scale: 'mens_top', values: ['short', 'medium', 'long'], default: 'medium' },
    },
  },
  {
    id: 'm_two_strand_twists',
    name: 'Two-Strand Twists',
    gender: 'man',
    family: 'treatment',
    cut: 'even two-strand twists sectioned across the whole head',
    axes: {
      length: { scale: 'mens_top', values: ['short', 'medium'], default: 'short' },
    },
  },
  {
    id: 'm_short_locs',
    name: 'Locs',
    gender: 'man',
    family: 'treatment',
    cut: 'neat evenly sectioned locs with a natural, well-kept surface',
    axes: {
      length: { scale: 'mens_top', values: ['short', 'medium', 'long', 'flowing'], default: 'medium' },
    },
  },
]

export function getStyleById(id: string): Hairstyle | undefined {
  return HAIRSTYLES.find((s) => s.id === id)
}

export function getStylesByGender(gender: Gender): Hairstyle[] {
  return HAIRSTYLES.filter((s) => s.gender === gender)
}

/**
 * The catalog only has a woman's and a man's list — collapse whatever the
 * rest of the app calls gender (create-profile's 'male' | 'female' | 'other' | null)
 * onto that pair. 'other' and unset both fall back to the women's catalog,
 * the wider of the two lists.
 */
export function toHairstylistGender(gender: string | null): Gender {
  return gender === 'male' ? 'man' : 'woman'
}

/** The color axis every style shares, plus whichever of sides/texture/length that style declares. */
export function getDefaultAxisState(style: Hairstyle): AxisState {
  return {
    sides: style.axes.sides?.default,
    texture: style.axes.texture?.default,
    length: style.axes.length?.default,
    color: 'natural',
  }
}

export function colorLabel(id: ColorId): string {
  return HAIR_COLORS.find((c) => c.id === id)?.label ?? titleCase(id)
}

const DUMMY_THUMBNAILS = [1, 2, 3, 4, 5, 6].map((i) => `/hairstylist/wig-${i}.jpg`)
const STYLE_INDEX = new Map(HAIRSTYLES.map((s, i) => [s.id, i]))

/** Dummy tile image until each style has its own render — cycles the Figma wig mockups. */
export function thumbnailFor(style: Hairstyle): string {
  return DUMMY_THUMBNAILS[(STYLE_INDEX.get(style.id) ?? 0) % DUMMY_THUMBNAILS.length]
}
