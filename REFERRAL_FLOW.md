# Referral Flow — Experience Spec & QA Checklist

> ⚠️ This document describes the *expected* experience of the referral flow. The current build is a prototype meant to demonstrate the design intent — it should be treated as a reference for what to build, not a record of production behaviour.

The "Invite 3 coworkers to unlock an extra 25% off Premium" referral flow lives on the user's photo gallery and on a plan-selection sheet that opens on top of it. This doc covers what the user sees, when they see it, what they can do, and how each state should feel.

---

## 1. What the user sees

Two surfaces drive the experience:

1. **Gallery page** — the user's collection of generated headshots. From here the user can:
   - View and like images.
   - Open the plan-selection sheet via a primary "Pay to download" button or via a promotional toast.
2. **Plan-selection sheet** — a modal-style surface that opens over the gallery. It contains:
   - The list of Premium / Standard / Starter packs.
   - A "Get an extra 25% off Premium" toggle (only relevant for Premium).
   - An invite-coworkers screen (reached after toggling the discount on).
   - A payment screen.

On phones the sheet slides up from the bottom of the screen like a tray. On larger screens it appears as a centered card with a dimmed backdrop. The behaviour and animations are tuned to feel native to the device size.

---

## 2. The seven possible discount states

The user's relationship with the discount evolves through these states. They are mutually exclusive and the UI changes accordingly.

| # | State | What's true | What the user sees on the gallery |
|---|---|---|---|
| 1 | **Brand new** | User hasn't opened the plan sheet yet. | Only the regular "Pay to download" button. |
| 2 | **Aware** | User has opened the plan sheet once and closed it without toggling. | A green promotional toast: *"Get an extra 25% off Premium"*. |
| 3 | **Interested** | User toggled the discount on but didn't invite anyone yet. | A green toast: *"Invite & get 25% off on Premium"*. |
| 4 | **Mid-invite** | User typed at least one invite email but didn't complete the send. | A green toast: *"Complete Invitation & get 25% off"*. |
| 5 | **Partially invited** | Send attempt produced 1 or 2 successful invites but 1 invalid email. | Same as Mid-invite, plus the toggle card shows *"N/3 invited"*. |
| 6 | **Unlocked, timer running** | All 3 invites succeeded. A 2-minute countdown is live. | A red toast: *"Get Premium at ₹3,999 for MM:SS"*. |
| 7 | **Unlocked, last chance** | Timer hit zero but the user is still in the same browser tab. | A red toast (heartbeat-pulsing): *"Last chance! Get Premium at ₹3,999"*. |

When the tab is closed, anything earned during this tab (timer + last-chance window) is gone. The user can still complete a previously-started invite next time because their entered emails and toggle state are remembered — but they will need to re-finish the invite flow to unlock the discount again.

---

## 3. User stories

### Story 1 — Discovering the offer

> **As a** user looking at my generated headshots
> **I want** to see that I can save extra on Premium
> **so that** I have a reason to engage with the invite flow.

**Expected behaviour**
- The first time the user opens the plan sheet, the system "notices" them and starts showing a green promotional toast on the gallery.
- The toast has a gentle shimmer sweep that loops, making it feel alive.
- Tapping the toast opens the plan sheet at the right place for where they are in the flow.
- The promotional toast fades out of relevance after roughly half an hour of inactivity.

### Story 2 — Browsing the packs

> **As a** user
> **I want** to compare Premium, Standard, and Starter at a glance
> **so that** I can pick the pack that fits me.

**Expected behaviour**
- On phones, only one pack is fully open at a time — the selected pack is shown with all its features in a dark themed card, and the others appear as compact pills below it.
- On larger screens, all three packs are visible side by side. The selected pack is dark/highlighted; the other two are presented as light cards with the same information.
- Tapping any pack switches the selection with a smooth animation.
- Premium is visually positioned as the recommended pack (it always carries a "BEST VALUE" ribbon).

### Story 3 — Unlocking the extra discount

> **As a** Premium-curious user
> **I want** to opt into inviting coworkers in exchange for 25% extra off
> **so that** I get the best deal.

**Expected behaviour**
- A discount toggle sits directly above the Premium card (full-width above it on phones, only above the Premium column on desktop).
- Switching the toggle on for the first time in a session triggers a confetti burst that emerges from above the toggle — a moment of celebration. It only fires once per session.
- The discounted price (₹3,999) appears next to the original ₹4,500 with a brief size pulse for emphasis. The pulse repeats every time the toggle flips on.
- The "Invite 3 coworkers to unlock" subtitle briefly grows then settles when the user first lands on this screen, drawing the eye.
- The card has a subtle shimmer that loops while the toggle is off, then stops once toggled on.
- The primary action button at the bottom switches its label to "Invite & Unlock" — clicking it takes the user to the invite screen.

### Story 4 — Inviting coworkers

> **As a** user opting into the discount
> **I want** to enter 3 coworker emails and send them
> **so that** my discount unlocks.

**Expected behaviour**
- The invite screen shows three email fields, a "Discount will be applicable for the next 30 minutes" reassurance line, and a single primary "Invite & Pay" button.
- Email validation happens **only when the user leaves a field** (taps elsewhere, presses Tab). Typos do not produce errors while the user is still typing.
- Invalid emails surface inline + a brief floating error toast appears above the action buttons. The error is clearly recoverable — the field stays editable and a fresh blur re-validates.
- The fields do **not** trigger any browser-saved email suggestions or password-manager autofill. These are coworker addresses, not the user's own.
- On the first send attempt, the system simulates 2 successful sends and 1 invalid (random index) to demonstrate the partial-send experience. The 2 valid emails become locked rows with a green check; the 1 invalid stays editable.
- Correcting the invalid email and pressing the action again completes the invite. The user is taken **directly to the payment screen** at the discounted price — there is no intermediate "offer applied" celebration screen.
- The only way out of the invite screen without sending is the back arrow, which returns the user to plan selection (any typed emails and partial-send progress are preserved).

### Story 5 — Paying at the discounted price

> **As a** user who unlocked the discount
> **I want** to see a clear price, a countdown, and an obvious way to complete the purchase
> **so that** I understand the urgency and finish my checkout.

**Expected behaviour**
- The payment screen shows the active pack name, the discounted price, and a red banner along the top: *"Extra 25% off expires in MM:SS mins"*. The countdown ticks live every second.
- A footer CTA on plan selection always reflects the right price: ₹3,999 once the discount is unlocked, ₹4,500 otherwise.
- On larger screens, the plan-selection footer also shows an assurance ribbon — *"One time payment, no subscription!"* — to the left of the primary action.

### Story 6 — The "last chance" moment after the timer

> **As a** user who got distracted and let the 2-minute timer expire
> **I want** one final chance to claim the discount
> **so that** I'm not punished for a momentary distraction.

**Expected behaviour**
- The instant the countdown reaches zero, all three banner locations (the gallery red toast, the plan-selection top banner, and the toggle-slot banner) switch their text to *"Last chance! Get Premium at ₹3,999"*.
- The text gently pulses with a heartbeat rhythm — two soft thumps in the first second, then a roughly 3-second rest, then repeat. The rhythm conveys urgency without being aggressive.
- The user can still pay at ₹3,999 during this window.
- If the user refreshes the tab during the "last chance" period, the banner persists.
- If the user **closes the tab**, the discount window is gone. On reopening, they will be back in the "Aware" state and would need to redo the invite flow to claim the offer again.

### Story 7 — Resuming a paused flow

> **As a** user who started the invite flow and walked away
> **I want** my progress to be remembered when I come back
> **so that** I don't have to retype emails or re-toggle.

**Expected behaviour**
- Within the same browser, even across reloads or modal closes: the toggle state, all 3 typed emails, validity of those emails (including locked rows from a partial send), and the partial-invite count (e.g. "2/3 invited") all persist.
- Closing the tab and reopening retains these in-progress fields too (so the user can resume), but the **timer / last-chance** window is reset (since that's session-only).
- A successful payment clears all referral state — the next session starts clean.

### Story 8 — Already invited, just want to pay

> **As a** user who already completed the invite flow
> **I want** the plan sheet to take me straight to payment
> **so that** I don't get sent back through the invite flow.

**Expected behaviour**
- When all 3 invites are already in, the discount toggle is **replaced** by the red timer/last-chance banner. The toggle controls aren't shown — there's nothing to opt into anymore.
- The footer CTA reads "Pay to Continue" (not "Invite & Unlock") and shows the discounted ₹3,999 price regardless of toggle state.
- Clicking it goes directly to payment. The user is never re-routed through the invite screen once their invitation is complete.
- The "Pay to download" button on the gallery always opens the plan-selection screen first (it never auto-skips to payment), so the user always gets to compare packs before paying.

### Story 9 — Contextual gallery toast

> **As a** user
> **I want** the gallery toast to mirror where I am in the flow
> **so that** clicking it always feels useful.

**Expected behaviour**

| Current state | Toast message | Where it takes the user |
|---|---|---|
| Discount unlocked, timer running | *"Get Premium at ₹3,999 for MM:SS"* | Payment screen |
| Discount unlocked, last chance | *"Last chance! Get Premium at ₹3,999"* (heartbeat pulse) | Payment screen |
| Email entered, invite not sent | *"Complete Invitation & get 25% off"* | Invite screen |
| Toggle on, no email yet | *"Invite & get 25% off on Premium"* | Invite screen |
| User has just discovered the offer | *"Get an extra 25% off Premium"* | Plan-selection screen |

The "Pay to download" button always overrides the toast and goes to plan selection.

---

## 4. Layout differences — phone vs. larger screens

| Surface | Phone | Larger screens |
|---|---|---|
| Plan sheet | Slides up from the bottom; tray-like; drag handle along the top edge; can be dragged down to dismiss. | Appears as a centered card; click outside or X to dismiss; no drag handle. |
| Plan layout | One pack expanded, others collapsed as pills below. Selecting a pill swaps which one is expanded with a smooth animation. | All 3 packs visible side by side. Selected pack is dark; the other two use a lighter card style. |
| Discount toggle position | Full-width banner directly above the Premium card. | Sits above the Premium column only (the area above Standard/Starter is intentionally blank). |
| Pre-unlock gallery toast | Fixed strip across the bottom of the screen. | An in-flow band tucked between the page header and the "Gallery" heading. |
| Primary "Pay to download" button | Fixed strip at the very bottom of the gallery. | A button in the top-right of the "Gallery" heading row. |
| Image grid | A single column, square images, top to bottom. | A four-column grid. |
| Invite screen action button | Single full-width "Invite & Pay" button at the bottom. | Single right-aligned "Invite & Pay" button. |

The flow, copy, and state transitions are identical across breakpoints. Only the chrome, layout density, and entry/exit animations differ.

---

## 5. QA checklist

A checklist for testers to walk through. Tick boxes as the experience is verified.

### 5.1 Gallery

- [ ] On a fresh user (no prior interactions), only the regular "Pay to download" button is shown — no toast.
- [ ] After opening the plan sheet once, the green "Get an extra 25% off Premium" toast appears.
- [ ] The promotional toast has a continuous shimmer sweep.
- [ ] Toggling the discount and closing the sheet changes the toast copy to "Invite & get 25% off on Premium".
- [ ] Typing one or more emails and closing the sheet changes the toast copy to "Complete Invitation & get 25% off".
- [ ] After all 3 invites succeed, the toast becomes a red countdown: "Get Premium at ₹3,999 for MM:SS".
- [ ] When the countdown reaches zero (in the same tab), the toast changes to "Last chance! Get Premium at ₹3,999" with a heartbeat pulse.
- [ ] Tapping any toast opens the plan sheet in a state appropriate to that toast (per the table in Story 9).
- [ ] The "Pay to download" button always opens the plan-selection screen, even when the discount is unlocked.
- [ ] Hearting / un-hearting images works regardless of any toast state.

### 5.2 Plan sheet — open / close

- [ ] On phones, the sheet slides up from the bottom on open.
- [ ] On phones, dragging the sheet down dismisses it.
- [ ] On phones, tapping outside the sheet (on the dimmed area) dismisses it.
- [ ] On larger screens, the sheet appears as a centered modal with a fade + slight scale-in.
- [ ] On larger screens, clicking outside the modal dismisses it.
- [ ] The gallery behind the sheet animates back slightly (scales down) while the sheet is open.
- [ ] Close / X button works on both layouts.
- [ ] On larger screens, the close and back icons have visible breathing room above them (not flush with the modal's top edge).

### 5.3 Plan selection (initial view)

#### Phone
- [ ] One pack expanded, two collapsed as pills.
- [ ] Tapping a pill expands it (with a smooth height animation) and collapses the previously expanded pack.
- [ ] The discount toggle is flush above the Premium card with no visible gap.

#### Larger screens
- [ ] All three packs visible side by side.
- [ ] Selected pack is dark; the other two are light/white with the same information.
- [ ] The discount toggle sits above only the Premium column; the area above the other two packs is blank.
- [ ] The toggle and Premium card are flush — no gap between them.
- [ ] Horizontal dividers inside each pack card line up vertically across all three packs.
- [ ] Clicking any pack switches selection (the previously selected pack visually changes to "not selected" — light theme — and vice versa).
- [ ] The modal does not require scrolling to see all 3 packs in their entirety.
- [ ] There is no large blank space below the cards inside the modal.

### 5.4 Discount toggle

- [ ] First time the user toggles ON in a session: confetti emerges from above the toggle card (only once per session).
- [ ] Each toggle-ON: the discounted ₹3,999 price briefly pulses (grows then settles) for emphasis.
- [ ] First time the user lands on the screen showing the toggle: the "Invite 3 coworkers to unlock" line briefly enlarges and settles.
- [ ] Subtle shimmer loops across the toggle card while the toggle is OFF.
- [ ] Shimmer stops when the toggle is ON.
- [ ] After a partial send (e.g. 2 of 3 emails accepted), reopening the sheet shows the toggle subtitle as "N/3 invited" instead of "Invite 3 coworkers to unlock".
- [ ] Once all 3 invites have been completed, the toggle is replaced entirely by the red timer/last-chance banner — no toggle UI is visible.

### 5.5 Invite screen

- [ ] Three labelled email fields appear.
- [ ] Typing in a field does NOT produce a validation error while typing.
- [ ] Leaving a non-empty field triggers a brief loading state, then a valid / invalid result.
- [ ] Leaving an empty field clears any prior validity (no error).
- [ ] Invalid emails surface a floating error toast above the action buttons.
- [ ] Browser-saved emails, Google Smart Lock, 1Password, LastPass etc. do NOT show their autofill UI on these fields.
- [ ] The primary action is disabled until all 3 emails are valid.
- [ ] First send attempt: 2 fields lock to a green-check / read-only state; 1 stays editable with an invalid indicator (random position).
- [ ] An error toast appears explaining the partial send.
- [ ] Correcting the invalid email and pressing the action again locks the 3rd email and proceeds directly to the payment screen (no "offer applied" intermediate screen).
- [ ] Back arrow returns to plan selection. If a partial send happened, the toggle card subtitle shows "N/3 invited".
- [ ] On both layouts, only the primary "Invite & Pay" button is shown — no secondary skip option.

### 5.6 Payment screen

- [ ] When the discount is unlocked and the timer is running, a red banner at the top displays "Extra 25% off expires in MM:SS mins" and ticks every second.
- [ ] When the timer hits 00:00 within the same tab, the banner switches to "Last chance! Get Premium at ₹3,999" with a heartbeat pulse.
- [ ] The price displayed reflects the unlocked discount (₹3,999) when applicable.
- [ ] Tapping "Pay" dismisses the sheet and the entire referral flow is wiped (toast on gallery resets, emails clear).

### 5.7 Footer action button

- [ ] On plan selection with Premium and no discount: button reads "Pay to Continue" with the regular Premium price.
- [ ] On plan selection with Premium + toggle on (discount not yet unlocked): button reads "Invite & Unlock" and routes to the invite screen.
- [ ] On plan selection with the discount already unlocked: button reads "Pay to Continue" with ₹3,999, regardless of toggle state. Clicking goes directly to payment (never back to invite).
- [ ] On larger screens, on plan selection, an assurance ribbon "One time payment, no subscription!" appears to the left of the button.
- [ ] On the invite screen: a single primary "Invite & Pay" button is shown (no secondary skip).

### 5.8 Last-chance grace period

- [ ] At 00:00, all three banners (gallery, top of plan sheet, toggle slot) switch to "Last chance! Get Premium at ₹3,999".
- [ ] All three pulse with a slow heartbeat rhythm (~2 thumps in the first ~1 second, then ~3 seconds of rest, then repeat).
- [ ] The user can still complete payment at ₹3,999 during this window.
- [ ] Refreshing the tab during this period keeps the "Last chance" state.
- [ ] **Closing the tab and re-opening** clears the timer / last-chance state — gallery is back to the green promotional toast or whichever pre-unlock state matches the user's progress; ₹3,999 is no longer available without redoing the invite flow.

### 5.9 Persistence

| Scenario | Expected outcome |
|---|---|
| User types emails, closes the sheet, reopens it | Emails are restored exactly as typed; validity is restored; toggle is in the same position. |
| User toggles on, closes the sheet, reopens it | Toggle is still on; no need to re-toggle. |
| User performs a partial send (2 valid + 1 invalid), closes, reopens | Toggle card subtitle shows "2/3 invited"; the 2 locked rows are still locked; the 1 invalid row stays editable. |
| User completes payment | All referral state is wiped — next visit starts fresh. |
| User idles on the gallery for ~30+ minutes without further interaction | The green promotional toast fades from the gallery (until they re-engage). |
| User closes the tab | The timer and last-chance window are gone on reopen, but their toggle/email progress persists. |

### 5.10 Microinteractions

- [ ] Confetti fires exactly once per session on first toggle-on.
- [ ] Discounted price emphasis-pulse plays every time the toggle is switched on (not just the first time).
- [ ] "Invite 3 coworkers" line enlarges & settles when the user first arrives on the screen.
- [ ] Toggle shimmer loops when off, stops when on.
- [ ] View transitions inside the sheet (plan-selection ↔ invite ↔ payment) feel smooth: fade-out, height re-flow, fade-in.
- [ ] Heartbeat pulse on "Last chance" text has two thumps close together, then a long rest before repeating.
- [ ] No layout shifts ripple through the page when any of the above animations play.

### 5.11 Cross-cutting

- [ ] No console errors on opening / closing the sheet, switching views, or completing a flow.
- [ ] No browser autofill prompts on any email field.
- [ ] The flow works identically on Chrome, Safari, Firefox, and the mobile equivalents.
- [ ] Browser back button on phones dismisses the sheet rather than navigating away from the gallery.
- [ ] The sheet's close animation completes before the page navigates back (no jarring snap).
- [ ] All text is legible on both themes (dark selected card and light non-selected card).

---

## 6. Analytics — event tracking

The ten events below are the minimum required to track the referral flow end-to-end. Property names are suggestions; the production build should align them with the existing analytics taxonomy.

Recommended **global properties** sent with every event: `user_id`, `session_id`, `device` (phone / desktop), `discount_state` (one of the seven states from §2), `timestamp` (auto).

| # | Event | When it fires | Properties |
|---|---|---|---|
| 1 | **`profile_gallery_viewed`** | The gallery page loads or becomes active. | `toast_key` — which promotional toast is currently visible (`none` / `pre_unlock` / `mid_invite` / `complete_invite` / `timer_running` / `last_chance`). |
| 2 | **`plans_viewed`** | The plan-selection screen renders (sheet/modal opens on this view). | `entry_point` (`toast` / `pay_to_download` / `direct_link` / `back_from_invite` / `back_from_payment`). |
| 3 | **`referral_toggled`** | User flips the discount toggle. | `state` (`on` / `off`); `current_plan_selection` (`premium` / `standard` / `starter`); `first_time_in_session` (true/false). |
| 4 | **`plan_selected`** | User switches to a different pack (does not fire when the already-selected pack is tapped). | `plan_selected` (`premium` / `standard` / `starter`); `previous_plan` (`premium` / `standard` / `starter`); `via` (`pill_tap` on phone / `card_click` on desktop). |
| 5 | **`plans_cta_clicked`** | User taps the primary action button on the plan-selection screen. | `cta_type` (`pay` / `invite`); `plan_selected`; `amount` (number); `currency` (`INR`); `discount_applied` (true/false). |
| 6 | **`discount_referrals_viewed`** | The invite-coworkers screen renders. | `pre_filled` (true/false — whether at least one of the three email fields was restored from a prior session); `entry_point` (`plans_cta` / `gallery_toast` / `back_from_payment`); `partial_invite_count` (0–2 — how many invites are already locked when the screen opens). |
| 7 | **`email_invite_attempted`** | User taps "Invite & Pay" on the invite screen. | `attempt_number` (1st / 2nd send in this session); `valid_email_count` (0–3 at submit time). |
| 8 | **`email_invite_failed`** | Send attempt comes back with one or more invalid emails (partial or full failure). | `failed_email_count` (1–3); `failed_indices` (array of 0/1/2 positions). |
| 9 | **`email_invite_sent`** | All three emails are successfully sent (discount is unlocked at this moment). | `total_attempts_to_succeed` (1 or 2); `time_on_screen_seconds`. |
| 10 | **`payment_viewed`** | The payment screen renders. | `plan_selected`; `amount`; `currency`; `referral_sent` (true/false — whether the user paid via the discount path). |

### Funnel summary

The above events draw the canonical conversion funnel:

`profile_gallery_viewed` → `plans_viewed` → `referral_toggled (state=on)` → `discount_referrals_viewed` → `email_invite_attempted` → `email_invite_sent` → `payment_viewed`

With these in place, drop-off can be measured between each step, and `email_invite_failed` quantifies the recovery loop inside the invite step.

---

## 7. Notes for the production build

This is a prototype demonstrating intended behaviour. The following are simulated and will need real implementation:

- **Email send.** The "partial send → 2 valid + 1 invalid on first attempt" outcome is simulated to demonstrate the recovery experience. The production build needs a real email-sending service with realistic failure handling.
- **Timer values.** The 2-minute countdown is short to make the demo tangible — production values should be set by the marketing team (e.g. 30 minutes).
- **Plan prices.** Numbers used in the prototype (₹4,500, ₹3,999, ₹3,499, ₹2,999, ₹7,500 strike-through) are illustrative.
- **Authentication / user identity.** The prototype does not represent any user identity model; production needs to associate referral state with the correct user account.
- **Analytics.** No events are emitted; the production build should instrument every state transition, button press, and toast click for funnel analysis.

## 8. Open questions for product

- Should the green promotional toast appear before the user has opened the plan sheet at least once, or only after — as currently shown?
- Should the discount banner remain visible if the user pays successfully, until the sheet is dismissed? (Currently it disappears as soon as the user pays.)
- Should the 30-minute promotional-toast lifespan be extended, shortened, or removed entirely?
- Should the user be able to retry the invite flow after a successful payment within the same session? Currently the flow assumes one-and-done per user.
