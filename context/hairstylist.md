# Hairstylist catalog — one flat map of styles, each declaring the axes it offers.
#
# A style is the only mandatory user choice. Every axis it declares carries its own
# allowed `values` and a `default`, so a request that names only the style is complete.
# The front end can render a style's controls straight from `axes` without knowing what
# kind of style it is: a style that offers no `length` is an updo, one that offers no
# `texture` is a braid or loc treatment. That is why there are no cuts/arrangements/
# treatments sections — the axes ARE the classification.
#
# Build prompts with `edits/hairstylist.py`, never by hand:
#     build_prompt("m_messy_quiff", sides="skin_fade")
# It validates each value against that style's own list and fills the rest from defaults.
#
# Why the axes are bounded per style (measured 2026-09-23 on gpt-image-2.5 flare, two
# subjects, scripts/hairstyle_{cut_texture,ablation}_grid.py):
#
#   - Texture is free for a style whose identity is its SILHOUETTE (pixie, crop, wolf cut):
#     all six textures render and the style stays recognisable.
#   - Texture is NOT free for a style whose identity is a LINE (blunt bob) or LAYER FALLOFF
#     (butterfly, layered). Past `wavy` the defining feature stops being visible — a blunt
#     bob in coily is just a curly bob. Those styles carry a truncated texture list. This
#     reproduced on both subjects, so the limit belongs to the style, not to the user's
#     hair, and is safe to author once here.
#   - Length is bounded by the style, and not every style uses the same ruler. Body-part
#     anchors are meaningless for a pixie, so short styles use their own scale. Sub-inch
#     stops did not render as a pixie length, so a buzz cut is its own style.
#
# `default` matters because for some styles the texture IS most of the style: a wash-and-go
# defaults to coily, an Italian bob to wavy, a blowout to straight. The catalog tile renders
# at the defaults; the user then moves whichever axis they like.
#
# `natural` as a texture means the user's OWN texture, preserved. Measured to resolve
# per-subject: the identical string gave curls on a curly subject and straight hair on a
# straight one.
#
# `sides` is offered by men's styles only. A man's cut is named by the top (quiff, crop,
# crew cut) and separately by how the sides come down (taper, fade height, undercut), and
# the two combine freely. This is why m_high_fade / m_low_fade / m_skin_fade / m_undercut
# are `sides` values here rather than styles of their own.
#
# Folded into the texture axis because they ARE texture values, and keeping them as styles
# collided with the axis (a "tight curls" tile asked for texture=straight came back curly —
# the name beat the field):
#   woman: straight_blowout, loose_waves, beach_waves, tight_curls, loose_curls, wavy_lob,
#          side_part_straight, middle_part_straight
#   man:   short_curly, medium_curly, wavy_textured
# Folded into a length stop of their parent style: woman long_pixie, short_afro.
# Kept separate on purpose, because the name denotes a different cut rather than the same
# cut rendered differently: bob vs lob vs French bob vs Italian bob; curly bob vs blunt bob.

version: 2

# ---------------------------------------------------------------------------
# Prompt assembly
#
# The opening and closing are always emitted. Each clause is emitted only if the style
# declares that axis, in the order listed here, so a woman's style simply never mentions
# sides. A length scale may override the length clause — men's lengths describe the top
# only, which needs different wording from a body-part anchor.
# ---------------------------------------------------------------------------

prompt:
  # {name} arrives with its article already attached ("a quiff", "an afro",
  # "box braids") — see _name_phrase in hairstylist.py
  opening: "Change my hairstyle to {name}: {cut}."
  clause_order: [sides, texture, length, color]
  clauses:
    sides: "The back and sides should be {sides}."
    texture: "The hair texture should be {texture}."
    length: "The length should be {length}."
    # colour is the one axis whose DEFAULT emits a lock rather than an instruction, which is
    # why it has two clauses. Keeping the lock here rather than in `closing` is what lets a
    # single pass cut and colour at once instead of needing a second edit.
    color: "Change my hair colour to {color}."
    color_natural: "Keep my own natural hair colour exactly as it is in the image; do not change the colour."
  closing: >-
    Keep my face, identity, skin tone, expression, pose, framing, clothing and background
    exactly as they are.

# Axes every style offers, merged in by the builder so 90 entries do not each repeat them.
# Colour values are NOT duplicated here: they are read from haircolors.yaml, which already
# curates 69 women's and 31 men's shades including balayage and ombre gradients.
global_axes:
  color:
    source: haircolors.yaml
    default: natural
    # the value that means "leave it alone"; it is not in haircolors.yaml
    natural_value: natural

# ---------------------------------------------------------------------------
# Axis vocabularies
# ---------------------------------------------------------------------------

textures:
  natural: left exactly as my own natural hair texture is now, completely unchanged
  straight: poker-straight and sleek, smooth and flat from root to tip
  wavy: soft loose waves with a relaxed S-bend through the mid-lengths
  curly: bouncy well-defined ringlet curls with springy separation
  coily: tight dense coils with a compact zig-zag pattern close to the head
  frizzy: dry and frizzy with undefined, fluffy volume and flyaway strands

# Men's styles only.
sides:
  uniform: clipped to the same length as the top
  scissor_cut: left long and scissor-cut to blend softly, with no clipper work
  taper: a classic taper, shortening gradually to a neat edge at the neckline
  low_fade: a low fade starting just above the ear and blending up
  mid_fade: a mid fade starting around the temple and blending up
  high_fade: a high fade taken up near the parietal ridge, leaving a strong contrast
  skin_fade: a skin fade shaved to bare skin at the bottom and blended up
  undercut: a disconnected undercut, clipped short with a hard line and no blend

length_scales:
  # Body-part anchored. Wording carried over verbatim from hairlengths.yaml, which already
  # solved "how long, relative to what" and is wired into nothing today.
  body:
    values:
      chin: chin-level, hair ending at the chin in a bob-like length
      neck: neck-level, hair reaching the base of the neck
      shoulder: shoulder-level, hair resting on the shoulders
      collarbone: collarbone-level, hair falling to the collarbone
      armpit: armpit-level, hair reaching down to the armpits
      bra_strap: bra-strap-level, hair falling to the bra strap line on the back
      mid_back: mid-back-level, hair reaching the middle of the back
      waist: waist-level, long hair flowing down to the waist

  # Head-feature anchored, for styles too short for a body part to mean anything.
  cropped:
    values:
      crop: cropped to about an inch all over, with the ears fully exposed
      classic: short at the nape and sides with the ears exposed and a little length left on top
      textured: short at the sides and nape with noticeably more length on top, two to three inches
      long: long enough on top to sweep to one side, the sides just covering the tops of the ears
      grown_out: grown out past the ears and onto the nape, edging towards a short crop

  # Afros are measured by how far the hair stands off the head, not by where it falls.
  afro:
    clause: "The shape should be {length}."
    values:
      tapered: close at the sides and nape with the volume kept on top
      short: a short rounded shape sitting close to the head
      medium: a full rounded shape standing a few inches off the head
      full: a large full rounded shape with maximum height and width

  # Men's top length. The sides are the `sides` axis, not part of this.
  mens_top:
    clause: "The length on top should be {length}."
    values:
      buzz: clipped to a uniform very short stubble all over
      very_short: about half an inch, too short to style
      short: an inch or two, just long enough to hold a shape
      medium: three to four inches, enough to sweep or push back
      long: long enough to fall past the brows when loose
      flowing: past the ears and onto the shoulders

# ---------------------------------------------------------------------------
# Styles — 90 entries. A style offers exactly the axes listed under `axes`.
# ---------------------------------------------------------------------------

styles:
  w_classic_bob:
    name: Classic Bob
    gender: woman
    family: bob
    cut: a rounded bob with the ends curving gently inward and a soft, polished finish
    axes:
      texture:
        values: [natural, straight, wavy, curly]
        default: straight
      length:
        scale: body
        values: [chin, neck]
        default: chin

  # measured: the blunt line stops being legible past wavy, on both subjects
  w_blunt_bob:
    name: Blunt Bob
    gender: woman
    family: bob
    cut: one single length all the way round with no layers and a sharp, blunt horizontal edge
    axes:
      texture:
        values: [natural, straight, wavy]
        default: straight
      length:
        scale: body
        values: [chin, neck, shoulder]
        default: chin

  w_a_line_bob:
    name: A-Line Bob
    gender: woman
    family: bob
    cut: an A-line bob cut shorter at the back and angling down to a longer front
    axes:
      texture:
        values: [natural, straight, wavy]
        default: straight
      length:
        scale: body
        values: [chin, neck]
        default: chin

  w_asymmetrical_bob:
    name: Asymmetrical Bob
    gender: woman
    family: bob
    cut: an asymmetrical bob with one side cut noticeably longer than the other
    axes:
      texture:
        values: [natural, straight, wavy]
        default: straight
      length:
        scale: body
        values: [chin, neck]
        default: chin

  w_french_bob:
    name: French Bob
    gender: woman
    family: bob
    cut: a short French bob sitting at the jaw with a blunt fringe across the brows
    axes:
      texture:
        values: [natural, straight, wavy]
        default: straight
      length:
        scale: body
        values: [chin]
        default: chin

  w_italian_bob:
    name: Italian Bob
    gender: woman
    family: bob
    cut: a jaw-length bob with soft bevelled ends turning under and plenty of body through the sides
    axes:
      texture:
        values: [straight, wavy]
        default: wavy
      length:
        scale: body
        values: [chin, neck]
        default: chin

  # a genuinely different cut, taken dry and curl by curl — not a blunt bob rendered curly
  w_curly_bob:
    name: Curly Bob
    gender: woman
    family: bob
    cut: a bob shaped for curl, cut curl by curl so the perimeter falls in a soft rounded shape
    axes:
      texture:
        values: [curly, coily]
        default: curly
      length:
        scale: body
        values: [chin, neck, shoulder]
        default: chin

  w_long_bob:
    name: Long Bob (Lob)
    gender: woman
    family: lob
    cut: a long bob falling just above the shoulders with a subtle inward curve at the ends
    axes:
      texture:
        values: [natural, straight, wavy, curly]
        default: straight
      length:
        scale: body
        values: [neck, shoulder]
        default: shoulder

  w_textured_lob:
    name: Textured Lob
    gender: woman
    family: lob
    cut: a lob cut with piecey, point-cut ends and visible separation through the lengths
    axes:
      texture:
        values: [natural, straight, wavy, curly]
        default: wavy
      length:
        scale: body
        values: [neck, shoulder, collarbone]
        default: shoulder

  # silhouette-defined: measured to hold across every texture on both subjects
  w_pixie_cut:
    name: Pixie Cut
    gender: woman
    family: pixie
    cut: cropped close through the sides and nape with the weight kept on top
    axes:
      texture:
        values: [natural, straight, wavy, curly, coily, frizzy]
        default: natural
      length:
        scale: cropped
        values: [crop, classic, textured, long, grown_out]
        default: classic

  # its own style, not a pixie length — sub-inch stops did not render on the pixie scale
  w_buzz_cut:
    name: Buzz Cut
    gender: woman
    family: pixie
    cut: clipped to a uniform very short length all over with a soft even outline
    axes:
      texture:
        values: [natural, straight, coily]
        default: natural
      length:
        scale: cropped
        values: [crop]
        default: crop

  w_short_textured_crop:
    name: Short Textured Crop
    gender: woman
    family: pixie
    cut: a short crop with choppy, piece-y layers through the top and a tousled finish
    axes:
      texture:
        values: [natural, straight, wavy, curly, coily, frizzy]
        default: natural
      length:
        scale: cropped
        values: [crop, classic, textured]
        default: textured

  w_tapered_cut:
    name: Tapered Cut
    gender: woman
    family: pixie
    cut: very short at the sides and nape, tapering longer towards the top of the head
    axes:
      texture:
        values: [natural, wavy, curly, coily]
        default: coily
      length:
        scale: cropped
        values: [crop, classic, textured]
        default: classic

  w_buzzed_sides_long_top:
    name: Buzzed Sides, Long Top
    gender: woman
    family: pixie
    cut: the sides clipped very short with a hard disconnection and a long styled section on top
    axes:
      texture:
        values: [natural, straight, wavy, curly, coily]
        default: natural
      length:
        scale: cropped
        values: [textured, long, grown_out]
        default: long

  # measured: layer falloff is invisible past wavy, coils hide it through shrinkage
  w_layered_cut:
    name: Layered Cut
    gender: woman
    family: layered
    cut: graduated layers cut throughout, shorter through the top and crown and progressively longer towards the ends
    axes:
      texture:
        values: [natural, straight, wavy]
        default: straight
      length:
        scale: body
        values: [chin, neck, shoulder, collarbone, armpit, mid_back]
        default: collarbone

  w_long_layers:
    name: Long Layers
    gender: woman
    family: layered
    cut: long layers cut into the lengths with face-framing pieces at the front and the bulk kept long
    axes:
      texture:
        values: [natural, straight, wavy]
        default: wavy
      length:
        scale: body
        values: [collarbone, armpit, bra_strap, mid_back, waist]
        default: mid_back

  w_shaggy_layers:
    name: Shag
    gender: woman
    family: layered
    cut: a shag with choppy stacked layers through the crown and wispy separated ends
    axes:
      texture:
        values: [natural, wavy, curly, frizzy]
        default: wavy
      length:
        scale: body
        values: [neck, shoulder, collarbone, armpit]
        default: collarbone

  w_wolf_cut:
    name: Wolf Cut
    gender: woman
    family: layered
    cut: heavy graduated layers, short around the crown and lengthening steeply towards the ends, with a face-framing fringe
    axes:
      texture:
        values: [natural, straight, wavy, curly, frizzy]
        default: wavy
      length:
        scale: body
        values: [shoulder, collarbone, armpit]
        default: armpit

  # same layer-falloff limit as w_layered_cut
  w_butterfly_cut:
    name: Butterfly Cut
    gender: woman
    family: layered
    cut: shorter face-framing layers around the cheekbones over much longer layers underneath
    axes:
      texture:
        values: [natural, straight, wavy]
        default: straight
      length:
        scale: body
        values: [armpit, bra_strap, mid_back]
        default: mid_back

  w_curly_shag:
    name: Curly Shag
    gender: woman
    family: layered
    cut: a shag cut for curl, with stacked layers that let the curls stack and expand outward
    axes:
      texture:
        values: [curly, coily, frizzy]
        default: curly
      length:
        scale: body
        values: [shoulder, collarbone, armpit]
        default: collarbone

  w_deva_cut:
    name: Curly Layered Cut
    gender: woman
    family: layered
    cut: layers cut curl by curl on dry hair so each curl sits into the shape without losing length
    axes:
      texture:
        values: [curly, coily]
        default: curly
      length:
        scale: body
        values: [shoulder, collarbone, armpit, bra_strap]
        default: armpit

  w_blowout:
    name: Blowout
    gender: woman
    family: smooth
    cut: blown out smooth and full with soft volume at the root and the ends turning gently under
    axes:
      texture:
        values: [straight, wavy]
        default: straight
      length:
        scale: body
        values: [shoulder, collarbone, armpit, bra_strap]
        default: collarbone

  w_middle_part_sleek:
    name: Sleek Middle Part
    gender: woman
    family: smooth
    cut: a clean centre parting with the hair falling flat and even on both sides
    axes:
      texture:
        values: [straight, wavy]
        default: straight
      length:
        scale: body
        values: [collarbone, armpit, bra_strap, mid_back, waist]
        default: mid_back

  w_deep_side_part:
    name: Deep Side Part
    gender: woman
    family: smooth
    cut: a deep side parting with the heavier side sweeping across the forehead
    axes:
      texture:
        values: [straight, wavy]
        default: straight
      length:
        scale: body
        values: [shoulder, collarbone, armpit, bra_strap]
        default: armpit

  w_old_hollywood_waves:
    name: Old Hollywood Waves
    gender: woman
    family: smooth
    cut: deep sculpted S-waves pressed into a uniform pattern and falling to one shoulder
    axes:
      texture:
        values: [wavy]
        default: wavy
      length:
        scale: body
        values: [shoulder, collarbone, armpit]
        default: collarbone

  w_curtain_bangs:
    name: Curtain Bangs
    gender: woman
    family: fringe
    cut: centre-parted curtain bangs sweeping open from the middle of the forehead down to the cheekbones, blending into the length
    axes:
      texture:
        values: [natural, straight, wavy, curly]
        default: straight
      length:
        scale: body
        values: [shoulder, collarbone, armpit, bra_strap, mid_back]
        default: collarbone

  w_blunt_bangs:
    name: Blunt Bangs
    gender: woman
    family: fringe
    cut: a heavy blunt fringe cut straight across just above the eyebrows
    axes:
      texture:
        values: [natural, straight, wavy]
        default: straight
      length:
        scale: body
        values: [collarbone, armpit, bra_strap, mid_back]
        default: armpit

  w_side_swept_bangs:
    name: Side Swept Bangs
    gender: woman
    family: fringe
    cut: a fringe angled across the forehead and swept to one side, blending into the layers
    axes:
      texture:
        values: [natural, straight, wavy, curly]
        default: wavy
      length:
        scale: body
        values: [collarbone, armpit, bra_strap]
        default: armpit

  w_wispy_bangs:
    name: Wispy Bangs
    gender: woman
    family: fringe
    cut: a light feathered fringe with visible gaps, sitting softly across the forehead
    axes:
      texture:
        values: [natural, straight, wavy]
        default: straight
      length:
        scale: body
        values: [collarbone, armpit, bra_strap]
        default: armpit

  w_natural_afro:
    name: Afro
    gender: woman
    family: natural
    cut: a full rounded afro shaped evenly all round
    axes:
      texture:
        values: [coily]
        default: coily
      length:
        scale: afro
        values: [tapered, short, medium, full]
        default: medium

  w_twist_out:
    name: Twist Out
    gender: woman
    family: natural
    cut: elongated defined curls set by unravelling two-strand twists
    axes:
      texture:
        values: [coily, curly]
        default: coily
      length:
        scale: body
        values: [neck, shoulder, collarbone, armpit]
        default: shoulder

  w_wash_and_go:
    name: Wash and Go
    gender: woman
    family: natural
    cut: natural curls left to air-dry in their own pattern with defined, moisturised separation
    axes:
      texture:
        values: [curly, coily]
        default: coily
      length:
        scale: body
        values: [neck, shoulder, collarbone]
        default: shoulder

  w_low_bun:
    name: Low Bun
    gender: woman
    family: arrangement
    cut: the hair gathered smoothly and twisted into a neat bun at the nape of the neck
    axes:
      texture:
        values: [natural, straight, wavy, curly, coily]
        default: straight

  w_classic_chignon:
    name: Chignon
    gender: woman
    family: arrangement
    cut: the hair rolled and pinned into a low, elegant knot at the back of the head
    axes:
      texture:
        values: [natural, straight, wavy]
        default: straight

  w_french_twist:
    name: French Twist
    gender: woman
    family: arrangement
    cut: the hair swept up and twisted vertically against the back of the head and pinned
    axes:
      texture:
        values: [natural, straight, wavy]
        default: straight

  w_low_ponytail:
    name: Low Ponytail
    gender: woman
    family: arrangement
    cut: the hair gathered and tied smoothly at the nape of the neck
    axes:
      texture:
        values: [natural, straight, wavy, curly, coily]
        default: straight

  w_high_ponytail:
    name: High Ponytail
    gender: woman
    family: arrangement
    cut: the hair gathered and tied high at the crown with volume through the top
    axes:
      texture:
        values: [natural, straight, wavy, curly, coily]
        default: straight

  w_sleek_ponytail:
    name: Sleek Ponytail
    gender: woman
    family: arrangement
    cut: the hair pulled back completely flat against the head and tied, with no volume at the root
    axes:
      texture:
        values: [straight]
        default: straight

  w_messy_bun:
    name: Messy Bun
    gender: woman
    family: arrangement
    cut: the hair loosely gathered into a bun on top with soft pieces pulled out around the face
    axes:
      texture:
        values: [natural, wavy, curly, coily]
        default: wavy

  w_top_knot:
    name: Top Knot
    gender: woman
    family: arrangement
    cut: the hair pulled up and twisted tightly into a knot at the very top of the head
    axes:
      texture:
        values: [natural, straight, wavy, curly, coily]
        default: straight

  w_claw_clip_updo:
    name: Claw Clip Updo
    gender: woman
    family: arrangement
    cut: the hair twisted up and held with a claw clip, with loose pieces falling at the front
    axes:
      texture:
        values: [natural, straight, wavy]
        default: wavy

  w_half_up_half_down:
    name: Half Up Half Down
    gender: woman
    family: arrangement
    cut: the top section pulled back and secured with the rest left flowing loose
    axes:
      texture:
        values: [natural, straight, wavy, curly, coily]
        default: wavy

  w_box_braids:
    name: Box Braids
    gender: woman
    family: treatment
    cut: individual square-sectioned braids of even medium gauge, parted down the centre
    axes:
      length:
        scale: body
        values: [shoulder, collarbone, armpit, bra_strap, mid_back, waist]
        default: mid_back

  w_knotless_braids:
    name: Knotless Braids
    gender: woman
    family: treatment
    cut: knotless braids fed in from the scalp so each braid lies flat at the root
    axes:
      length:
        scale: body
        values: [shoulder, collarbone, armpit, bra_strap, mid_back, waist]
        default: mid_back

  w_micro_braids:
    name: Micro Braids
    gender: woman
    family: treatment
    cut: very fine individual braids in small even sections across the whole head
    axes:
      length:
        scale: body
        values: [collarbone, armpit, bra_strap, mid_back]
        default: bra_strap

  w_goddess_braids:
    name: Goddess Braids
    gender: woman
    family: treatment
    cut: large braids fed close to the scalp with loose wavy pieces left out along their length
    axes:
      length:
        scale: body
        values: [collarbone, armpit, bra_strap, mid_back]
        default: bra_strap

  w_senegalese_twists:
    name: Senegalese Twists
    gender: woman
    family: treatment
    cut: smooth rope-like two-strand twists in even sections
    axes:
      length:
        scale: body
        values: [shoulder, collarbone, armpit, bra_strap, mid_back]
        default: armpit

  w_cornrows:
    name: Cornrows
    gender: woman
    family: treatment
    cut: hair braided flat against the scalp in neat straight-back rows
    axes:
      length:
        scale: body
        values: [neck, shoulder, collarbone]
        default: neck

  w_dutch_braid:
    name: Dutch Braid
    gender: woman
    family: treatment
    cut: a single raised inverted braid woven down the centre of the back
    axes:
      length:
        scale: body
        values: [shoulder, collarbone, armpit, bra_strap]
        default: armpit

  w_double_braids:
    name: Double Braids
    gender: woman
    family: treatment
    cut: two neat braids starting at each side of the head and running down
    axes:
      length:
        scale: body
        values: [shoulder, collarbone, armpit, bra_strap]
        default: armpit

  w_side_braid:
    name: Side Braid
    gender: woman
    family: treatment
    cut: a loose braid drawn over one shoulder with soft pieces left around the face
    axes:
      length:
        scale: body
        values: [collarbone, armpit, bra_strap, mid_back]
        default: bra_strap

  w_fishtail_braid:
    name: Fishtail Braid
    gender: woman
    family: treatment
    cut: a fishtail braid woven in a fine herringbone pattern
    axes:
      length:
        scale: body
        values: [collarbone, armpit, bra_strap, mid_back]
        default: bra_strap

  w_crown_braid:
    name: Crown Braid
    gender: woman
    family: treatment
    cut: braids taken around the head and pinned like a halo
    axes:
      length:
        scale: body
        values: [shoulder]
        default: shoulder

  w_braided_updo:
    name: Braided Updo
    gender: woman
    family: treatment
    cut: braids twisted and pinned into a gathered shape at the back of the head
    axes:
      length:
        scale: body
        values: [shoulder]
        default: shoulder

  w_medium_locs:
    name: Locs
    gender: woman
    family: treatment
    cut: neat evenly sectioned locs with a natural, well-kept surface
    axes:
      length:
        scale: body
        values: [neck, shoulder, collarbone, armpit, bra_strap, mid_back]
        default: shoulder

  w_faux_locs:
    name: Faux Locs
    gender: woman
    family: treatment
    cut: uniform wrapped faux locs of even thickness
    axes:
      length:
        scale: body
        values: [shoulder, collarbone, armpit, bra_strap, mid_back]
        default: armpit

  m_buzz_cut:
    name: Buzz Cut
    gender: man
    family: clipper
    cut: clipped to a single uniform length over the whole head with a clean outline
    axes:
      sides:
        values: [uniform]
        default: uniform
      texture:
        values: [natural, straight, coily]
        default: natural
      length:
        scale: mens_top
        values: [buzz]
        default: buzz

  m_shaved_head:
    name: Shaved Head
    gender: man
    family: clipper
    cut: the head shaved completely smooth with no stubble
    axes:
      sides:
        values: [uniform]
        default: uniform
      texture:
        values: [natural]
        default: natural
      length:
        scale: mens_top
        values: [buzz]
        default: buzz

  m_crew_cut:
    name: Crew Cut
    gender: man
    family: classic
    cut: an evenly trimmed flat top with the front left slightly longer than the crown
    axes:
      sides:
        values: [taper, low_fade, mid_fade]
        default: taper
      texture:
        values: [natural, straight, wavy]
        default: straight
      length:
        scale: mens_top
        values: [very_short, short]
        default: short

  m_ivy_league:
    name: Ivy League
    gender: man
    family: classic
    cut: a crew cut left long enough at the front to take a side parting and comb over
    axes:
      sides:
        values: [taper, low_fade]
        default: taper
      texture:
        values: [natural, straight, wavy]
        default: straight
      length:
        scale: mens_top
        values: [short, medium]
        default: short

  m_regulation_cut:
    name: Regulation Cut
    gender: man
    family: classic
    cut: a military regulation cut, short and square on top with a sharp neat outline
    axes:
      sides:
        values: [taper]
        default: taper
      texture:
        values: [natural, straight]
        default: straight
      length:
        scale: mens_top
        values: [very_short, short]
        default: very_short

  m_classic_taper:
    name: Classic Taper
    gender: man
    family: classic
    cut: a classic barber's taper with the length on top left natural and unstyled
    axes:
      sides:
        values: [taper, low_fade]
        default: taper
      texture:
        values: [natural, straight, wavy, curly, coily]
        default: natural
      length:
        scale: mens_top
        values: [short, medium]
        default: short

  m_short_side_part:
    name: Side Part
    gender: man
    family: classic
    cut: a defined hard side parting with the top combed neatly across
    axes:
      sides:
        values: [scissor_cut, taper, low_fade]
        default: taper
      texture:
        values: [straight, wavy]
        default: straight
      length:
        scale: mens_top
        values: [short, medium]
        default: short

  m_slicked_back:
    name: Slicked Back
    gender: man
    family: classic
    cut: the top swept straight back off the forehead with a smooth polished finish
    axes:
      sides:
        values: [scissor_cut, taper, low_fade, undercut]
        default: taper
      texture:
        values: [straight, wavy]
        default: straight
      length:
        scale: mens_top
        values: [medium, long]
        default: medium

  m_business_pompadour:
    name: Pompadour
    gender: man
    family: classic
    cut: height built at the front and swept up and back, tapering down towards the crown
    axes:
      sides:
        values: [taper, low_fade, mid_fade]
        default: low_fade
      texture:
        values: [straight, wavy]
        default: straight
      length:
        scale: mens_top
        values: [medium, long]
        default: medium

  m_messy_quiff:
    name: Quiff
    gender: man
    family: modern
    cut: volume lifted at the front and pushed up and back, left tousled rather than combed
    axes:
      sides:
        values: [taper, low_fade, mid_fade, skin_fade]
        default: mid_fade
      texture:
        values: [natural, straight, wavy, curly]
        default: wavy
      length:
        scale: mens_top
        values: [medium, long]
        default: medium

  m_textured_crop:
    name: Textured Crop
    gender: man
    family: modern
    cut: a choppy layered top with the ends point-cut for separation, pushed forward
    axes:
      sides:
        values: [low_fade, mid_fade, high_fade, skin_fade]
        default: mid_fade
      texture:
        values: [natural, straight, wavy, curly]
        default: wavy
      length:
        scale: mens_top
        values: [short, medium]
        default: short

  m_french_crop:
    name: French Crop
    gender: man
    family: modern
    cut: a short textured top with a straight-cut fringe pushed flat across the forehead
    axes:
      sides:
        values: [mid_fade, high_fade, skin_fade]
        default: high_fade
      texture:
        values: [natural, straight, wavy, curly]
        default: straight
      length:
        scale: mens_top
        values: [short, medium]
        default: short

  m_textured_fringe:
    name: Textured Fringe
    gender: man
    family: modern
    cut: layered length left at the front to fall naturally across the forehead
    axes:
      sides:
        values: [taper, low_fade, mid_fade]
        default: low_fade
      texture:
        values: [natural, straight, wavy, curly]
        default: wavy
      length:
        scale: mens_top
        values: [short, medium]
        default: medium

  m_spiky_textured:
    name: Spiky Textured
    gender: man
    family: modern
    cut: the top styled upward into soft separated points
    axes:
      sides:
        values: [taper, low_fade, mid_fade]
        default: low_fade
      texture:
        values: [straight, wavy]
        default: straight
      length:
        scale: mens_top
        values: [short, medium]
        default: short

  m_faux_hawk:
    name: Faux Hawk
    gender: man
    family: modern
    cut: a strip of length along the centre styled upward, the sides taken down short
    axes:
      sides:
        values: [mid_fade, high_fade, skin_fade, undercut]
        default: high_fade
      texture:
        values: [natural, straight, wavy, curly, coily]
        default: natural
      length:
        scale: mens_top
        values: [short, medium]
        default: medium

  m_mohawk:
    name: Mohawk
    gender: man
    family: modern
    cut: a bold strip of long hair down the centre with the sides taken right down
    axes:
      sides:
        values: [high_fade, skin_fade]
        default: skin_fade
      texture:
        values: [natural, straight, wavy, curly, coily]
        default: natural
      length:
        scale: mens_top
        values: [medium, long]
        default: long

  m_modern_mullet:
    name: Modern Mullet
    gender: man
    family: modern
    cut: short and textured through the front and sides with deliberate length left long at the back
    axes:
      sides:
        values: [taper, mid_fade]
        default: taper
      texture:
        values: [natural, straight, wavy, curly]
        default: wavy
      length:
        scale: mens_top
        values: [medium, long]
        default: medium

  m_tousled_medium:
    name: Tousled Medium
    gender: man
    family: long
    cut: mid-length hair left loose with natural movement and no fixed parting
    axes:
      sides:
        values: [scissor_cut, taper]
        default: scissor_cut
      texture:
        values: [natural, straight, wavy, curly]
        default: wavy
      length:
        scale: mens_top
        values: [medium, long]
        default: medium

  m_curtain_bangs:
    name: Curtains
    gender: man
    family: long
    cut: a centre parting with the front lengths falling open on either side of the forehead
    axes:
      sides:
        values: [scissor_cut, taper, low_fade]
        default: scissor_cut
      texture:
        values: [natural, straight, wavy]
        default: straight
      length:
        scale: mens_top
        values: [medium, long]
        default: long

  m_shoulder_length:
    name: Shoulder Length
    gender: man
    family: long
    cut: grown out to the shoulders with natural flow and a soft parting
    axes:
      sides:
        values: [scissor_cut]
        default: scissor_cut
      texture:
        values: [natural, straight, wavy, curly]
        default: wavy
      length:
        scale: mens_top
        values: [flowing]
        default: flowing

  m_long_swept_back:
    name: Long Swept Back
    gender: man
    family: long
    cut: long hair pushed back off the forehead with volume held at the root
    axes:
      sides:
        values: [scissor_cut]
        default: scissor_cut
      texture:
        values: [straight, wavy]
        default: wavy
      length:
        scale: mens_top
        values: [long, flowing]
        default: flowing

  m_curly_top_fade:
    name: Curly Top
    gender: man
    family: natural
    cut: the curl kept full and defined on top with the sides taken down clean
    axes:
      sides:
        values: [low_fade, mid_fade, high_fade, skin_fade]
        default: mid_fade
      texture:
        values: [curly, coily]
        default: curly
      length:
        scale: mens_top
        values: [short, medium]
        default: medium

  m_afro:
    name: Afro
    gender: man
    family: natural
    cut: a full rounded afro shaped evenly all round
    axes:
      sides:
        values: [uniform, taper, low_fade]
        default: taper
      texture:
        values: [coily]
        default: coily
      length:
        scale: afro
        values: [tapered, short, medium, full]
        default: short

  m_twist_out:
    name: Twist Out
    gender: man
    family: natural
    cut: elongated defined curls set by unravelling two-strand twists
    axes:
      sides:
        values: [uniform, taper, low_fade]
        default: taper
      texture:
        values: [coily, curly]
        default: coily
      length:
        scale: mens_top
        values: [short, medium]
        default: medium

  m_waves_360:
    name: 360 Waves
    gender: man
    family: natural
    cut: short coily hair brushed into a continuous ripple pattern radiating from the crown
    axes:
      sides:
        values: [taper, low_fade]
        default: taper
      texture:
        values: [coily]
        default: coily
      length:
        scale: mens_top
        values: [very_short, short]
        default: very_short

  m_man_bun:
    name: Man Bun
    gender: man
    family: arrangement
    cut: the hair pulled back and tied into a bun at the crown
    axes:
      texture:
        values: [natural, straight, wavy, curly]
        default: straight

  m_top_knot:
    name: Top Knot
    gender: man
    family: arrangement
    cut: the top length gathered and tied at the very top of the head with the sides kept short
    axes:
      texture:
        values: [natural, straight, wavy, curly]
        default: straight

  m_ponytail:
    name: Ponytail
    gender: man
    family: arrangement
    cut: the hair gathered and tied at the back of the head
    axes:
      texture:
        values: [natural, straight, wavy, curly]
        default: straight

  m_half_up_half_down:
    name: Half Up
    gender: man
    family: arrangement
    cut: the top section tied back with the rest left loose
    axes:
      texture:
        values: [natural, straight, wavy, curly]
        default: wavy

  m_cornrows:
    name: Cornrows
    gender: man
    family: treatment
    cut: hair braided flat against the scalp in neat straight-back rows
    axes:
      length:
        scale: mens_top
        values: [short, medium]
        default: short

  m_braided_top:
    name: Braided Top
    gender: man
    family: treatment
    cut: small braids on top styled backward with the sides taken down clean
    axes:
      length:
        scale: mens_top
        values: [short, medium]
        default: medium

  m_box_braids_short:
    name: Box Braids
    gender: man
    family: treatment
    cut: individual square-sectioned braids in even parts
    axes:
      length:
        scale: mens_top
        values: [short, medium, long]
        default: medium

  m_two_strand_twists:
    name: Two-Strand Twists
    gender: man
    family: treatment
    cut: even two-strand twists sectioned across the whole head
    axes:
      length:
        scale: mens_top
        values: [short, medium]
        default: short

  m_short_locs:
    name: Locs
    gender: man
    family: treatment
    cut: neat evenly sectioned locs with a natural, well-kept surface
    axes:
      length:
        scale: mens_top
        values: [short, medium, long, flowing]
        default: medium