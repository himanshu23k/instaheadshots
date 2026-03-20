# Enhanced Edit Flow — Product Specification v2.1
**Product**: AI Headshot Editor
**Version**: 2.1 (Post-UX Audit Revision)
**Date**: March 2026
**Status**: Updated Draft — Supersedes v2.0

### What Changed from v2.0 and Why

| Change | Source Risk / Question |
|---|---|
| Face Selection is now optional (skippable on entry) | R3 — mandatory entry step regressed simple edits |
| Loading states specified for every AI render step | R1 — dead UI during renders was high severity |
| Step dependency model defined; cascade reset reduced | R2, Q12 — back-nav resets were too aggressive |
| Credit forecast banner added at journey entry | Q7, Flow D — mid-journey credit shock preempted |
| Cancel affordance added to all render states | Q9 — user was trapped during slow renders |
| Drag-and-drop added to custom background upload | Q6 — desktop omission felt like a bug |
| Myntra/Ajio: variant selector + timeout + cancel | Q8, Flow E — color variant ambiguity, no timeout |
| Return-from-purchase state defined | R8, Flow D — journey context was lost after purchase |
| AI Prompt: moderation boundary documented | Q4, Flow G — identity edge cases were vague |
| Credit re-charge logic rewritten unambiguously | R5 — PRD v2.0 was contradictory |
| Step tracker redesigned for mobile | R10 — 6 pills scrolled off-screen |
| Before/After toggle moved to each step | R11 — comparison only at final screen was too late |
| Accessibility requirements added | R6 — WCAG gaps were high severity |

---

## 1. Vision

The enhanced flow reimagines editing as a **creative journey** — a guided, layered experience where the user builds their ideal headshot step by step, previewing changes before committing credits, and feeling authorial control throughout.

The metaphor: from *choosing from a menu* to *directing a shoot*.

Critically, this must not regress the simple-edit case. A user who only wants a background swap should reach it in no more steps than today.

---

## 2. Design System Reference

All UI must strictly follow the existing visual language.

### 2.1 Color Palette

| Role | Value | Usage |
|---|---|---|
| Page background | `#F0EDE8` (warm cream) | App shell, canvas |
| Surface / card | `#FFFFFF` | Sidebar, option panels, modals |
| Primary CTA | `#111111` | "Download", "Create", "Apply" buttons |
| Primary CTA text | `#FFFFFF` | Text on dark buttons |
| Accent / active | `#00C37A` (mint green) | Active sidebar item, credit gem icon, selected card border |
| Accent background | `#E6F9F1` (mint tint) | Active sidebar item fill |
| Warning / forecast | `#FFF3CD` (amber tint) | Credit forecast banner background |
| Warning text | `#856404` | Credit forecast banner text |
| Danger / heart | `#F04E6B` | Favourited heart, error messages |
| Muted text | `#6B6B6B` | Subheadings, counts, helper text |
| Border | `#E0DDD8` | Card borders, dividers, input outlines |
| Disabled | `#C8C5C0` | Disabled button fill, inactive controls |
| Overlay | `rgba(0,0,0,0.45)` | Modal backdrops, render overlay |
| Skeleton base | `#EBEBEB` | Loading skeleton fill |
| Skeleton shimmer | `#F5F5F5` | Shimmer sweep color |

New in v2.1: Warning palette for credit forecast banner. Error red unchanged.

### 2.2 Typography

| Style | Size | Weight | Usage |
|---|---|---|---|
| Page title | 22px | 500 | "Edit", section names |
| Section heading | 18px | 500 | "Change Background", step panel headers |
| Body | 14px | 400 | Option card labels, helper text, input values |
| Caption | 12px | 400 | Credit cost labels, metadata, error messages |
| Button label | 14px | 500 | All CTA labels |
| Badge / chip | 12px | 500 | Step tracker pills, suggestion chips |

### 2.3 Border Radius

| Component | Radius |
|---|---|
| Image preview container | `12px` |
| Option card (thumbnail) | `8px` |
| Modal / bottom sheet | `12px` top corners only |
| Primary button | `6px` |
| Ghost button | `6px` |
| Input field | `6px` |
| Sidebar nav item (active) | `6px` |
| Suggestion chips | `16px` (pill) |
| Step tracker pill | `20px` (pill) |
| Alert / toast | `8px` |
| Skeleton blocks | `6px` |

### 2.4 Button Styles

**Primary CTA** — "Apply", "Download", "Confirm Face", "Finish"
```
background:    #111111
color:         #FFFFFF
border-radius: 6px
padding:       10px 20px
font-size:     14px
font-weight:   500
border:        none
cursor:        pointer

:hover  → background: #2D2D2D
:active → background: #444444
:disabled → background: #C8C5C0; cursor: not-allowed
```

**Ghost / Secondary** — "Edit", "Get High Resolution", "Skip this step"
```
background:    #FFFFFF
color:         #111111
border:        1px solid #E0DDD8
border-radius: 6px
padding:       10px 20px
font-size:     14px
font-weight:   400
cursor:        pointer

:hover → border-color: #AAAAAA; background: #F8F8F8
```

**Credit Action Button** — bottom of option panels
```
Two-part layout (flex row):
  [Left]  [Green gem icon 16px] [Credit count 14px #FFFFFF]  ← separated by 1px vertical rule
  [Right] ["Apply [Action] →" 14px 500 #FFFFFF]

Enabled state:
  background: #2D2D2D
  border-radius: 6px
  padding: 12px 20px
  width: 100%

Disabled state (no selection made):
  background: #C8C5C0
  cursor: not-allowed
  
Zero-credit step (e.g. Face confirm):
  [Left] Empty / no gem
  [Right] "Confirm Face →"
  background: #111111 (still black, just no left credit section)
```

**Cancel / Abort** (appears during AI render — see Section 4.7)
```
background:    transparent
color:         #6B6B6B
border:        none
font-size:     12px
text-decoration: underline
cursor:        pointer
padding:       8px 0

:hover → color: #111111
```

### 2.5 Sidebar Navigation

```
width:        200px
background:   #FFFFFF
padding:      16px 12px
border-right: 1px solid #E0DDD8

Nav item:
  display: flex; align-items: center; gap: 8px
  padding: 8px 12px
  border-radius: 6px
  font-size: 14px; font-weight: 400
  color: #6B6B6B
  cursor: pointer

Nav item (active):
  background: #E6F9F1
  color: #00C37A
  font-weight: 500
  icon: #00C37A

Nav item (completed — has a check badge):
  color: #111111
  font-weight: 400
  [right] Small circle checkmark, 16px, fill: #00C37A, white tick
  
Nav item (disabled — future step not yet unlocked):
  color: #C8C5C0
  cursor: not-allowed
  (Steps are not locked — all are tappable. "Disabled" visual only applies 
   during an active AI render when all navigation is frozen.)
```

### 2.6 Option Card (Thumbnail Grid)

```
Layout:         2-column grid, gap: 12px
Card:           border-radius: 8px; overflow: hidden; position: relative
                cursor: pointer; border: 2px solid transparent
                aspect-ratio: 3/4 (portrait for headshot context)

Unselected:     border: 2px solid transparent
Hovered:        border: 2px solid #AAAAAA
Selected:       border: 2px solid #00C37A
                [top-right] Checkmark badge: 20px circle, bg #00C37A, white check SVG

Label overlay:
  background:   rgba(0,0,0,0.55)
  color:        #FFFFFF
  font-size:    12px; font-weight: 500
  padding:      4px 8px
  position:     absolute; bottom: 0; left: 0; right: 0
  text-align:   center

Skeleton card (loading):
  Same dimensions; fill: #EBEBEB
  Shimmer: animated linear-gradient sweep left-to-right, 1.5s ease infinite
```

Accessibility: selected state must also be communicated with `aria-pressed="true"` and a visible non-color indicator (the checkmark badge serves this).

### 2.7 Info Toast / System Message

```
background:   rgba(30,30,30,0.85)
color:        #FFFFFF
border-radius: 8px
padding:      8px 14px
font-size:    12px
max-width:    320px
position:     absolute; bottom: 24px; left: 50%; transform: translateX(-50%)
z-index:      100
pointer-events: none
```
Auto-dismiss after 4 seconds. Not used for errors (errors are inline).

### 2.8 Credit Indicator

Header (always visible, top-right):
```
[Green gem SVG, 16px] [Number, 14px, #111111, font-weight: 500] ["Credits", 14px, #6B6B6B]
Updates in real-time immediately after a successful render charges a credit.
On update: number briefly scales to 1.1× then returns (250ms ease). Not animated
on the first load, only on change.
```

### 2.9 Loading / Render States

New in v2.1. Applies to any step that triggers an AI render.

**Stage 1 — Processing overlay** (appears on the right-side image preview immediately on "Apply"):
```
The image preview dims to 50% opacity.
Centered overlay content:
  [Spinner: 24px, border 2px solid #00C37A, top border transparent, rotating 0.8s linear]
  [Text: "Applying [action name]...", 14px, #FFFFFF]
  [Cancel link: "Cancel", 12px, underlined, #CCCCCC — appears after 3 seconds]

Background:   rgba(0,0,0,0.45) over the preview only (not the full panel)
```

**Stage 2 — Completion flash** (on success):
```
Overlay fades out (200ms).
Preview crossfades from old image to new image (300ms).
Toast: "[Action] applied" — 2 seconds.
Credit indicator in header animates down by 1.
```

**Stage 3 — Failure state** (on render error):
```
Overlay fades out.
Preview returns to original (no change applied).
Inline error below the CTA button:
  "Something went wrong. Your credit was not charged. Try again."
  Color: #F04E6B; font-size: 12px
[Try Again] button replaces the Apply button (ghost style)
```

**Cancel behaviour** (user taps "Cancel" during render):
```
If render has not yet returned: cancels the API call; no credit charged; 
preview returns to pre-apply state; step remains active.
If render has returned but is still crossfading: transition completes; 
credit IS charged (render completed); Cancel is no longer available at this point.
The Cancel link only appears after 3 seconds to avoid accidental taps on fast renders.
```

**Timeout**: If no response after 30 seconds, treat as failure (Stage 3). No credit charged.

---

## 3. Enhanced Edit Flow — Entry & Structure

### 3.1 Entry Point

User taps "Edit" from the Preview screen.

**New behaviour (v2.1)**: A lightweight **Edit Entry Sheet** appears as a bottom sheet (mobile) or small centered modal (desktop) before the full Edit journey begins.

```
Modal: width 480px (desktop), full-width bottom sheet (mobile)
       border-radius: 12px top corners; background: #FFFFFF; padding: 24px

Header:
  Title: "What do you want to edit?"  (18px, 500)
  Close [×]: top-right, 20px, color: #6B6B6B

Quick-action buttons (vertical stack, each full-width, ghost style, 48px tall):
  [Background icon]  Change Background        1 credit →
  [Outfit icon]      Change Outfit            1 credit →
  [Eraser icon]      Remove Objects (Eraser)  0 credits →

Divider: "or build a full look"  (12px, muted, centered, horizontal lines either side)

[Start Full Journey →]  Primary CTA, full width
  Subtext below button: "Up to 4 credits — change face, posture, background, outfit & more"
                         (12px, #6B6B6B)
```

**Quick-action buttons** jump directly to that specific step in the journey, skipping all preceding steps. This resolves R3 — simple edits are 1 tap away, not gated behind Face Selection.

**"Start Full Journey"** enters the step-by-step flow at Step 1 (Face Selection).

If the user entered from a single standalone headshot (not a gallery album of 50+), the Entry Sheet omits "Start Full Journey" and defaults to showing only the three quick actions.

### 3.2 Step Tracker (Revised for Mobile — R10)

The step tracker is now a **compact icon + label strip** rather than full text pills.

**Desktop (≥ 1024px)** — horizontal strip above the option panel:
```
[ ✓ Face ] — [ ✓ Posture ] — [ ● Background ] — [ ○ Outfit ] — [ ○ AI ] — [ ○ Erase ]

Pill anatomy (active: ●):
  icon (16px) + label (12px, 500)
  padding: 6px 14px
  border-radius: 20px
  Active:    background: #111111; color: #FFFFFF
  Completed: background: #E6F9F1; color: #00C37A; icon: checkmark
  Inactive:  background: transparent; color: #C8C5C0; border: 1px solid #E0DDD8
  Width: auto (content-fit), max 120px
  
All pills on one line; no horizontal scroll (desktop has room at 200px sidebar + 480px panel + tracker).
```

**Mobile (< 1024px)** — replaces text pills with icon-only dots + step label above:
```
Top of screen: "Step 3 of 6 — Background"  (14px, 500, centered)

Below it: 6 small circles in a row (centered):
  Completed: filled #00C37A, 10px diameter
  Active:    filled #111111, 12px diameter (slightly larger)
  Inactive:  border 1px solid #C8C5C0, fill transparent, 10px diameter
  Gap between circles: 10px
```

No horizontal scrolling on either form factor.

### 3.3 Credit Forecast Banner (New — Q7)

Shown once, at the top of the first active step in any journey (whether quick-action or full journey). Dismissed by the user or auto-hides after they apply their first edit.

```
Banner (below the step tracker, above the option panel content):
  background: #FFF3CD
  border-left: 3px solid #F0A500
  border-radius: 4px
  padding: 8px 12px
  font-size: 12px
  color: #856404
  display: flex; align-items: center; gap: 8px

Content:
  [Info icon, 14px, #856404]
  "You have [N] credits. This edit costs [M] credit(s)."
  [×] dismiss button, right-aligned

For full journey:
  "You have [N] credits. A full journey costs up to 4 credits."
```

The banner updates its "costs" figure dynamically as the user moves between steps (e.g. if they skip Posture, it recalculates remaining forecast).

If user has fewer credits than the current step costs:
```
  background: #FDECEA
  border-left: 3px solid #F04E6B
  color: #8B1A1A
  Content: "You need [M] credit(s) for this step but have [N]. 
             [Get more credits ↗]" (link, same color, underlined)
```

### 3.4 Step Dependency Model (Revised — R2, Q12)

v2.0 cascaded all later steps on back-navigation. v2.1 introduces **independent vs. dependent** step relationships.

**Dependency table:**

| Step | Depends On | Independent of |
|---|---|---|
| 1. Face | None | All |
| 2. Posture | Face (renders on selected face) | Background, Outfit, AI, Erase |
| 3. Background | Face, Posture | Outfit, AI Prompt, Erase |
| 4. Outfit | Face, Posture | Background, AI Prompt, Erase |
| 5. AI Prompt | Face, Posture, Background, Outfit | Erase |
| 6. Erase | All previous (operates on composed image) | None |

**Back-navigation rules:**

Going back to Step 1 or 2 (Face or Posture) invalidates everything — the base image changes, so all renders are void. Full cascade. Confirmation modal required.

Going back to Step 3 (Background) while Step 4 (Outfit) is already applied: Background and Outfit are independent. Re-applying a new background does NOT reset the outfit. Both are re-composed on the server. **No confirmation modal needed.** The user simply re-selects a background, the credit for re-applying is charged (1 credit), and the preview shows the new background with the existing outfit still applied.

Going back from Step 6 (Erase) to any prior step: Erase result is discarded (it's a local operation on the composed image). Confirmation: "Your erased edits will be lost. The background, outfit, and AI edits are preserved."

**Confirmation modal (when cascade IS required):**
```
Modal: centered, 400px wide, border-radius: 12px, background: #FFFFFF
       padding: 24px

Title:   "This will reset some edits"  (18px, 500)
Body:    Specific to context:
         "Going back to Face Selection will reset your Posture, Background, 
          Outfit, and AI Prompt. Credits spent on those steps will not be refunded."
         (14px, #6B6B6B, line-height: 1.6)

Buttons (row, right-aligned):
  [Keep My Edits]  Ghost button
  [Go Back]        Primary CTA (black)
```

---

## 4. Step-by-Step Specifications

---

### Step 1 — Face Selection

**Entry**: Only reached via "Start Full Journey". Quick-action users skip this.

**Purpose**: When a user has 50+ headshots from a generation session, pick the base face before applying any edits. Avoids spending credits on a face the user doesn't actually want.

**Layout** — Left panel:
```
Header:  "Choose your face"   (18px, 500)
Subtext: "All edits apply to this image."  (12px, #6B6B6B)

Filter tabs above grid: [All] [Social] [Dating] [Favorites]
  Tab style: underline on active tab (#111111), inactive (#C8C5C0)
  Font: 12px, 500

Grid: 3-column, gap: 8px
  Thumbnail: square, border-radius: 8px
  Selected:  border: 2px solid #00C37A + checkmark badge
  Max shown: 12 (scroll within panel for more)
  Panel is scrollable vertically; sticky header + tabs

No credit icon in CTA (face selection is free).
CTA: [Confirm Face →]  Primary CTA (full width)
```

**Right panel**: Large preview of currently selected face. Before/After toggle not applicable (no edit applied yet). Preview label: "Selected face" (12px, muted, below image).

**Skip behaviour**: If user is entering from a single headshot (not gallery), this step is auto-confirmed with that headshot. Step tracker shows Face as completed; user lands directly on Step 2 or the target step.

---

### Step 2 — Posture Selection

**Beta flag**: This step carries a visual badge until render quality is validated.

```
Badge (inline with step header):
  text: "Beta"
  background: #FFF3CD; color: #856404
  border-radius: 4px; padding: 2px 6px; font-size: 11px; font-weight: 500
  positioned inline after the step title
```

**Layout** — Left panel:
```
Header: "Choose posture"  (18px, 500) [Beta badge]
Subtext: "Select how you want to be positioned."  (12px, #6B6B6B)

Grid: 2-column option cards
  Each card shows a rendered example (not a user's own face — use a generic model)
  Label overlay: posture name

Posture options (V1):
  Straight On | Three-Quarter Left | Three-Quarter Right
  Relaxed Lean | Profile Left | Profile Right
```

**Before/After toggle** (new in v2.1 — R11):
```
Appears on the right-side preview AFTER a posture has been applied.
Toggle pill: [Before] [After]  
  Pill style: border: 1px solid #E0DDD8; border-radius: 20px; overflow: hidden
  Active segment: background: #111111; color: #FFFFFF
  Inactive segment: background: #FFFFFF; color: #6B6B6B
  Width: 120px; positioned top-right of the image preview
```

**Intelligent default**: If the source headshot is already a forward-facing straight-on pose (detectable from generation metadata), "Straight On" is pre-selected. CTA reads "No change — Continue →" with no gem or credit indicator shown (no credit charged if user continues with same posture).

**Credit cost**: 1 credit if posture differs from source. 0 if source matches selection.

**Beta warning in CTA area** (below the button):
```
"Beta: Posture quality may vary. Credit is still charged on apply."
(11px, #856404)
```

---

### Step 3 — Background (Enhanced)

**Layout** — Left panel:
```
Header: "Change background"  (18px, 500)

Category tabs: [Studio] [Outdoor] [Location] [Custom]
  Tab style: underline on active, 12px, 500

Grid: 2-column option cards (portrait aspect ratio 3:4)
```

**Tab: Studio** — existing presets (White Studio, Light Grey, Grey Studio, Dark Grey, Black Studio, Canary Yellow, Navy Blue, Pastel Blue, etc.) Unchanged from v2.0.

**Tab: Outdoor** — new presets: City Street, Rooftop Skyline, Garden Path, Beachfront, Suburban.

**Tab: Location** — new presets: Modern Office Desk, Conference Room, Home Study, Café Counter.

**Tab: Custom Upload** (enhanced from v2.0):

```
Upload zone:
  border: 1.5px dashed #C8C5C0
  border-radius: 8px
  min-height: 140px
  display: flex; flex-direction: column; align-items: center; justify-content: center
  gap: 8px
  cursor: pointer
  
  States:
    Default:   border-color: #C8C5C0; background: #FAFAFA
    Drag-over: border-color: #00C37A; background: #E6F9F1 (NEW — Q6 drag-and-drop)
    Uploading: border-color: #C8C5C0; [progress bar replaces icon]
    Error:     border-color: #F04E6B; background: #FDECEA

  Content (default):
    [Upload cloud icon, 24px, #6B6B6B]
    "Drag & drop or browse"  (14px, #111111)
    "JPG or PNG • Min 1000px wide • Max 10 MB"  (12px, #6B6B6B)
    [Browse Files]  Ghost button, 32px tall

Upload progress (during upload, replaces content):
  Filename (truncated, 14px)
  Progress bar: full width, 4px tall, fill: #00C37A, bg: #E0DDD8, border-radius: 2px
  Percentage label: 12px, right-aligned

Error states (inline, below upload zone):
  Wrong file type:   "Only JPG or PNG files are supported."
  File too large:    "File is too large. Max 10 MB."
  Resolution low:    "Image must be at least 1000 × 600px."
  Upload failed:     "Upload failed. Check your connection and try again."
  All errors: #F04E6B, 12px, icon [!] inline before text
  Upload zone border turns #F04E6B on error.

After successful upload:
  "Your Upload" card appears at the top of the Custom grid (pinned position)
  Card label overlay: "Your upload"
  Persists for the session only (not across sessions in V1)
```

**Before/After toggle**: appears on right preview after background is applied. Same spec as Step 2.

**Credit cost**: 1 credit (preset or custom upload). The "already applied" logic: if user revisits this step and re-selects the same background they already applied, the CTA reads "No change — Continue →" (no credit). If they select a different background, credit is charged.

---

### Step 4 — Outfit (Enhanced)

**Layout** — Left panel:
```
Header: "Change outfit"  (18px, 500)

Category tabs: [All] [Formal] [Business Casual] [Smart Casual] [Ethnic] [Shop →]
  The "Shop →" tab has a subtle external-link arrow to signal it's a different mode.

Grid: 2-column option cards
```

**Preset tabs** (All, Formal, Business Casual, Smart Casual, Ethnic) — existing presets mapped into these categories. "Ethnic" includes Kurta, Nehru jacket, etc.

**Tab: Shop Your Outfit** (revised from v2.0 — Q8, Flow E):

```
Panel content (no grid — different layout):

Header: "Paste a product link"  (14px, 500)
Subtext: "Myntra and Ajio supported."  (12px, #6B6B6B)

Input row:
  [Text input, flex-grow] [Fetch →] button (primary CTA, fixed width 80px)
  input: placeholder "Paste product URL..."
         border: 1px solid #E0DDD8; border-radius: 6px; padding: 10px 12px; font-size: 14px
  button: border-radius: 6px; font-size: 14px; font-weight: 500

Loading state (after Fetch is tapped):
  Input: spinner replaces the right side of the input (14px, #00C37A)
  Button: disabled, text "Fetching..."
  Below: "Fetching product details..."  (12px, #6B6B6B)
  Cancel link: "Cancel fetch" appears after 5s  (12px, underlined, #6B6B6B)
  Timeout: 15 seconds → error state

Success state — product card:
  Card: border: 1px solid #E0DDD8; border-radius: 8px; padding: 12px
  Layout (flex row, gap: 12px):
    [Left] Product image: 64×64px, border-radius: 6px, object-fit: cover
    [Right, flex column]:
      Product name: 14px, 500, max 2 lines, overflow ellipsis
      Brand:        12px, #6B6B6B
      Price:        12px, #6B6B6B

  VARIANT SELECTOR (new — Q8):
  If product has multiple color options, show below the product card:
    "Which color?" (12px, 500, #111111)
    Row of color swatches (16px circles, border: 1px solid #E0DDD8, 
                           selected: border: 2px solid #00C37A)
    Max 6 shown; "+ N more" link if overflow
    Default: first color variant pre-selected

  [Use This Outfit] Primary CTA, full width, below card + variant selector

Error states (inline, below input):
  Wrong domain:    "We support Myntra and Ajio links only."
  Non-clothing:    "This looks like a non-clothing item. Try a shirt, blazer, or top."
  Product removed: "This product page is no longer available."
  Timeout:         "The fetch timed out. Check your connection and try again."
  Parse error:     "We couldn't read this product. Try copying the link directly 
                    from the product page."
  All errors: #F04E6B, 12px, inline below input
```

**Supported domains (V1)**: `myntra.com`, `ajio.com`

**Credit cost**: 1 credit. Toast on apply: "Rendering [Product Name]..."

**Before/After toggle**: same spec as Steps 2–3.

---

### Step 5 — AI Prompt Refinement

**Layout** — Left panel:
```
Header: "Describe refinements"  (18px, 500)
Subtext: "Lighting, mood, expression, collar, background detail — anything subtle."
         (12px, #6B6B6B)

Textarea:
  border: 1px solid #E0DDD8; border-radius: 6px
  padding: 12px; font-size: 14px; line-height: 1.5
  min-height: 120px; resize: vertical; width: 100%
  placeholder: "e.g. Warmer lighting, sharpen the collar, 
                      soften background blur, confident expression..."

Character counter (below textarea, right-aligned):
  "0 / 300"  (12px, #6B6B6B)
  Turns #F04E6B when >280 (nearing limit)
  Turns #F04E6B + "!" when at 300 (at limit)

Suggestion chips (horizontal scroll row, below counter):
  "Warmer lighting"   "Softer bokeh"      "Sharper collar"
  "Brighter skin"     "Confident look"    "Remove flyaways"
  "Cooler tones"      "Lift shadows"

  Chip: border: 1px solid #E0DDD8; border-radius: 16px; padding: 5px 12px
        font-size: 12px; background: #FFFFFF; cursor: pointer; white-space: nowrap
  On tap: appends text to textarea with a leading space (if textarea not empty)

Moderation boundary (what is and is not allowed):

  ALLOWED:
    - Lighting adjustments ("warmer", "softer", "brighter", "more contrast")
    - Expression refinements ("subtle smile", "more relaxed", "eyes slightly wider")
    - Clothing details ("sharper collar", "neater lapel", "fix the crease")
    - Background refinements ("more blur", "darker bokeh", "lighter tone")
    - Hair ("smoother", "neater", "fix flyaways")
    - Skin ("clearer", "brighter", "reduce shine") — general tone only
    
  NOT ALLOWED (will trigger inline error — client-side check where possible, 
               server-side fallback):
    - Requests to resemble a named person ("look like...", "similar to...")
    - Ethnic/racial identity alteration ("look more...", "look less...")
    - Age alteration beyond ±5 years of perceived age ("look 20 years younger")
    - Specific eye/nose/lip shape changes ("thinner nose", "bigger lips")
    - Gender presentation changes
    - Requests referencing protected characteristics

  Inline error (below suggestion chips, replaces CTA area on validation failure):
    "This edit isn't supported. Try describing lighting, background, 
     clothing, or general expression instead."
    (#F04E6B, 12px)
    [Clear prompt ×]  ghost button below error

  Note: client-side keyword detection catches obvious cases. Server-side 
  moderation is the final gate. If server rejects, no credit is charged 
  and the error message above is shown.

CTAs:
  If textarea has content:   [Green gem] 1  |  Apply Prompt →  (primary CTA)
  If textarea is empty:      [Skip — Continue →]  (ghost button)
```

**Before/After toggle**: available on right preview after prompt is applied.

---

### Step 6 — Magic Eraser

Existing functionality. The right-side preview now shows the fully composed image (face + posture + background + outfit + AI prompt all applied) — not the raw source image.

**Important UX note**: Add a tooltip on first visit to this step:
```
Tooltip (one-time, dismissable):
  "You're erasing from your fully edited image — background, outfit, 
   and AI refinements are already applied."
  (12px, dark tooltip, appears below the tool icons, auto-dismisses after 5s)
```

**Before/After toggle**: shows original source headshot (Before) vs current composed + erased state (After). This is especially useful here since accumulated changes from prior steps are significant.

---

## 5. Journey Completion — Final Preview

After completing or skipping the last active step, or tapping "Finish" in the sidebar, the full-screen Final Preview appears.

```
Layout (full-width, replaces the three-column edit layout):

Header row:
  [← Back to editing]  ghost link, left
  "Your headshot is ready"  (22px, 500, centered)
  [Credits: N remaining]  credit indicator, right

Image area:
  Large centered preview, max-height: 60vh
  border-radius: 12px
  [Before] [After] toggle pill — top-right of image

Edit summary strip (below image):
  Horizontal scrollable chip row
  Each chip: 
    icon (16px) + label
    border: 1px solid #E0DDD8; border-radius: 16px; padding: 5px 10px; font-size: 12px
  
  Examples:
    [face icon] Confident look
    [posture icon] Three-Quarter Left
    [bg icon] Grey Studio
    [outfit icon] Black Blazer
    [AI icon] Warmer lighting
    [eraser icon] Object removed

Credits used summary:
  "[N] credit(s) used for this headshot"  (12px, #6B6B6B, centered)

Action buttons (two-column row below):
  [Save to Gallery]  ghost button, full width (left col)
  [Download]         primary CTA, full width (right col)
```

---

## 6. Credit Logic (Unambiguous Rewrite — R5)

v2.0 had a contradiction between the "free if not applied" rule and the back-navigation scenario. This version is the authoritative source.

### 6.1 Core Rules

**Rule 1 — Credit is charged at render completion, not at button tap.**
If a render is triggered and completes successfully, 1 credit is charged. If the render fails, is cancelled, or times out, 0 credits are charged.

**Rule 2 — Each unique transformation is charged once per session.**
A "transformation" is defined as: `{step, option_id}`. Examples: `{background, grey_studio}`, `{outfit, myntra_url_xyz}`.

If the user applies `{background, grey_studio}`, goes to a later step, comes back to Background, and selects `{background, grey_studio}` again — **0 credits charged** (same transformation).

If they select `{background, navy_blue}` instead — **1 credit charged** (new transformation).

**Rule 3 — Going back and re-applying the same option is free. Re-applying a different option costs 1 credit.**

**Rule 4 — Independent step re-application (Background + Outfit re-compose) costs 1 credit per changed step.**
If Background changes but Outfit stays the same: 1 credit (for background). Outfit is not re-charged (it was already applied and hasn't changed).

**Rule 5 — Cascade reset credits are not refunded.**
If the user goes back to Face/Posture (invalidating later renders), the credits already spent on Background, Outfit, and AI Prompt are not returned. The confirmation modal makes this explicit.

**Rule 6 — Face Selection and Magic Eraser: 0 credits.**
(Magic Eraser credit policy to be confirmed — currently free. If it moves to paid, this spec must be updated before release.)

### 6.2 Credit Summary Table

| Step | Action | Credit charged? |
|---|---|---|
| 1. Face | Select any face | No |
| 2. Posture | Apply a posture different from source | Yes (1) |
| 2. Posture | "Same as source" / no change | No |
| 3. Background | Apply any preset or custom background | Yes (1) |
| 3. Background | Re-apply same background after back-nav | No |
| 3. Background | Apply different background after back-nav | Yes (1) |
| 4. Outfit | Apply any preset outfit | Yes (1) |
| 4. Outfit | Apply via Myntra/Ajio link | Yes (1) |
| 4. Outfit | Re-apply same outfit after back-nav | No |
| 5. AI Prompt | Apply any prompt | Yes (1) |
| 5. AI Prompt | Skip (empty textarea) | No |
| 6. Erase | Any number of erases | No (confirm) |
| Any | Render fails or times out | No |
| Any | User cancels render | No |
| **Full journey, all steps, all different** | | **Max 4 credits** |

---

## 7. Out-of-Credits Flow (Enhanced — R8)

```
Trigger: user taps any credit-costing "Apply" button with 0 credits remaining.

Bottom sheet (mobile) / centered modal (desktop):
  border-radius: 12px top corners; background: #FFFFFF; padding: 24px

  Title: "You're out of credits"  (18px, 500)
  Body:  "Get more credits to keep editing."  (14px, #6B6B6B)
  
  Credit packs (3-column visual selector):
    Each pack: border: 1px solid #E0DDD8; border-radius: 8px; padding: 12px; text-center
    [Gem icon]
    "10 Credits"  (14px, 500)
    "₹ XXX"       (12px, #6B6B6B)
    Selected pack: border: 2px solid #00C37A
  
  [Buy Now →]  Primary CTA, full width (proceeds to payment)
  [Cancel]     Ghost button, full width

CRITICAL — Return state (R8):
  After successful credit purchase, user returns to EXACTLY where they left off:
  - Same step active
  - Same option selected (if they had selected but not applied)
  - Apply button re-enabled and ready
  - No journey context lost

  Implementation note: journey state must be persisted in session storage 
  before redirecting to the purchase flow. On return, the app hydrates from 
  session storage before rendering. This must be tested on iOS Safari 
  (aggressive background tab memory management) and Android Chrome.

  If purchase is cancelled or fails: user returns to same state; no change.
  If purchase succeeds but return state cannot be restored (session expired):
    Toast: "Credits added! Your previous edits were not saved — start again from Preview."
    User lands on Preview screen, not the Edit journey.
```

---

## 8. Navigation & Back Behaviour

**Left sidebar nav**: Always visible. Tapping any step navigates to it (subject to dependency rules in Section 3.4). No steps are locked.

**Back arrow (top-left)**: Exits the Edit journey entirely. One-tap confirmation:
```
"Exit editing? Your applied edits are saved in your gallery. 
 Any unapplied selections will be lost."
[Keep Editing]  [Exit]
```

**Browser/device back button**: Treated identically to the in-app back arrow (intercepted with a beforeunload handler).

**Step tracker navigation**: Tapping a completed step navigates back (with cascade confirmation if applicable per Section 3.4). Tapping an incomplete/future step jumps forward, skipping intermediate steps silently.

**During AI render**: All navigation is frozen. The step tracker and sidebar nav items are visually disabled (`opacity: 0.4, pointer-events: none`). Only the Cancel link on the render overlay is interactive.

---

## 9. Accessibility Requirements (New — R6)

Target: WCAG 2.1 AA compliance throughout the Edit flow.

**Color**: Every state communicated by color must also have a non-color indicator:
- Selected card: border + checkmark badge (not border alone)
- Step tracker: icon + text label (not color alone)
- Error messages: icon [!] + text (not color alone)
- Active sidebar item: background tint + font-weight change + icon color

**Keyboard navigation**:
- Tab order: sidebar nav → step tracker → option panel content → CTA buttons
- Arrow keys: navigate within thumbnail grid (2D arrow key navigation)
- Enter / Space: activate selected thumbnail or button
- Escape: close modals, dismiss tooltips

**Focus management**:
- On step change: focus moves to the step panel header (not the first grid item — avoids accidental selection)
- On modal open: focus trapped inside modal; returns to trigger on close
- On render completion: focus moves to the "Apply [next step]" CTA or "Continue" button

**ARIA**:
- Thumbnail grid: `role="radiogroup"` + `role="radio"` per card, `aria-checked`
- Step tracker: `role="list"` + `role="listitem"` per pill, `aria-current="step"` on active
- Credit Action Button: `aria-label="Apply background for 1 credit"`
- Render overlay: `role="status"` + `aria-live="polite"` for status updates
- Error messages: `role="alert"` + `aria-live="assertive"`

**Screen reader**:
- Image thumbnails: `alt="[Background name] preview"` / `alt="[Outfit name] on model"`
- Credit indicator: `aria-label="79 credits remaining"`
- Before/After toggle: `aria-label="Show before editing"` / `aria-label="Show after editing"`

---

## 10. Out of Scope for V1

- Batch editing (applying edits across multiple headshots simultaneously)
- Saving journeys as reusable "Looks" / presets
- Custom outfit upload (non-link path)
- Session resume (if user closes app mid-journey, progress is lost)
- Video headshots
- Speculative or parallel rendering across steps

---

## 11. Open Questions (Updated)

| # | Question | Status |
|---|---|---|
| OQ1 | What is the expected P50/P90 render time per step? Determines timeout value (currently set to 30s) and whether UX needs a progress bar vs. spinner. | Open |
| OQ2 | Magic Eraser credit policy — currently specced as free. Confirm before release. | Open |
| OQ3 | Posture rendering quality — should it be gated as Beta or released fully? Current spec has a Beta badge; remove when quality is confirmed. | Open |
| OQ4 | Myntra/Ajio integration approach — scraping vs. affiliate API. If scraping: what is the legal review status? If API: what is the data contract for color variants? | Open |
| OQ5 | Is session storage sufficient for journey-state persistence across credit purchase redirect, given iOS Safari memory management? May need server-side session hydration. | Open |
| OQ6 | What is the content moderation pipeline for AI Prompt inputs? The spec defines the policy boundary; the implementation needs a client-side keyword list + server-side model. Who owns this? | Open |
| OQ7 | Posture step: if user's source image posture matches their selection (e.g. already three-quarter left), can this be auto-detected from generation metadata to avoid charging a credit? | Open |

---

## 12. Validation Plan (from UX Audit)

| What to Test | Method | Signal |
|---|---|---|
| Entry sheet reduces friction for simple edits | Moderated usability test (5 users) | Time-to-background-applied vs. current flow |
| Skip behaviour across steps | Unmoderated click test (Maze) | Do users find the skip path? Do they understand jump navigation? |
| Back-nav cascade reset comprehension | Think-aloud test | Do users read the confirmation modal? Do they understand credit loss? |
| Credit forecast banner effectiveness | A/B test (with vs. without) | Mid-journey abandon rate; support tickets for unexpected charges |
| Cumulative wait time | Instrumentation: P50/P90 per step | Total journey wall-clock; correlate with abandon rate |
| Shop-to-Headshot (Myntra/Ajio) | Diary study + analytics | Fetch success rate, variant selection accuracy, satisfaction score |
| AI Prompt moderation false-positive rate | Red-team testing | Valid prompts incorrectly blocked; invalid prompts passing through |
| Accessibility | axe/Lighthouse auto + manual screen reader | WCAG 2.1 AA score; keyboard-only task completion rate |
| Mobile step tracker discoverability | Heatmap (Hotjar/FullStory) | Do users on mobile discover steps 5 and 6? |
| Cancel during render | QA + usability test | Does cancel abort cleanly? Is credit correctly not charged? |
| Return state after credit purchase | QA regression (iOS Safari, Android Chrome, web) | Is journey state fully restored after purchase redirect? |