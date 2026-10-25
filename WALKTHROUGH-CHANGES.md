# Scroll walkthrough: what changed and why

Written for a developer who has never seen this project. Read top to bottom once.

## 1. Context

**Syntonia** is a static marketing site (plain HTML, CSS, JS, no build step, no framework) for a Nigerian rental service.
It sells three things: find a home, find a compatible roommate, and get tenant advocacy (help when a landlord misbehaves).

**The goal of this change:** the top of the page should feel like walking into an apartment.
As the visitor scrolls, the camera "walks" from the building outside, to the flat door, the hallway, the living room, the kitchen and the bedroom.
Each room carries one section of the site's copy. Scrolling back up reverses the walk.

## 2. What was added and what was edited

| File | Status | What it is |
|---|---|---|
| `walkthrough.css` | NEW | All styling for the walkthrough. Every rule is scoped to `#walk` or `html.walk-on`. |
| `walkthrough.js` | NEW | Scroll logic. About 100 lines, no libraries. |
| `images/walkthrough/room-1..6-*.jpg` | NEW | The six room photos (AI-generated). |
| `index.html` | EDITED (3 insertions, nothing deleted) | A `<link>` to `walkthrough.css`, a `<script>` for `walkthrough.js`, and one `<div id="walk">` block right after `</header>`. |
| `style.css`, `script.js` | UNTOUCHED | The existing popups, hamburger menu and back-to-top button still work exactly as before. |
| `WALKTHROUGH-CHANGES.md` | NEW | This file. |

## 3. How it works (the part to understand)

1. `#walk` is a very tall empty container (about 12.5 screen-heights). Inside it, `.walk-stage` is `position: sticky`, so it stays pinned on screen while the visitor scrolls through the tall container.
2. `walkthrough.js` converts the scroll position into a number `s`, measured in screen-heights.
3. Each room owns a slice of that range. `layout()` in `walkthrough.js` gives every room a hold length and a start position (`hold[i]`, `start[i]`), so rooms can be different lengths (see section 10). On desktop every room holds for `H = 1` and travels for `T = 1.1` screen-heights:
   - **Hold** (`H = 1`): the room photo stays still (it drifts in about 4%), the text panel is visible, and the floating chips animate with CSS.
   - **Travel** (`T = 1.1`): the current photo zooms toward the doorway and fades out, the next photo scales up from 78% to 100% and fades in, and the text fades out and in.
4. The zoom centre is each photo's doorway. The coordinates live in `data-door="[x,y]"` on each `.w-room` in `index.html`, as fractions of the photo (0 to 1).
5. The page is a pure function of scroll position, not of time. That is why scrolling backward automatically plays the walk in reverse. There is no video file.
6. The scroll value is eased (`cur += (tgt - cur) * .14`) so the motion feels smooth instead of jumpy.

## 4. Where each original section went

All original text is preserved word for word. Nothing was deleted from `index.html`.

| Room | Photo | Original section now shown there |
|---|---|---|
| 1 | Building exterior | Hero: eyebrow, 3-line heading, paragraph, both buttons, "Tenant Protected" badge |
| 2 | Flat door | "Renting should feel different", plus the two feature cards (Tenant Advocacy, Roommate Matching) |
| 3 | Hallway | "How Syntonia works" (3 steps) |
| 4 | Living room | Roommate Matching section |
| 5 | Kitchen | Tenant Advocacy section (Report, Follow Up, Resolve) |
| 6 | Bedroom | Featured Homes **heading only** |

After room 6, the normal page continues: the three Featured Homes cards, "Built around better renting", the final call to action, the footer and the popups.

**Decision: Roommates and Tenant Advocacy now come BEFORE Featured Homes.**
Why: the bedroom is the last room, and its heading ("A few places worth coming home to.") leads straight into the home cards that follow. If Featured Homes stayed in its original position, the cards would be stranded between rooms. If you want the original order back, you must also change which sections sit in which room (see section 7).

## 5. How the old sections are handled (important)

The original sections (`.find-a-home`, `.renting-difference`, `.how-syntonia-works`, `.roommate-matching`, `.tenant-advocacy`) are **still in `index.html`**. `walkthrough.js` adds the class `walk-on` to `<html>`, and CSS then hides them with `display: none`. The Featured Homes eyebrow and heading are hidden the same way (their text now lives in room 6).

Why hide instead of delete:
- **Fallback.** If JavaScript fails, or the visitor has "reduce motion" turned on in their OS, `walkthrough.js` exits before adding `walk-on`. `#walk` stays `display: none` and the original page shows, untouched.
- **Safety.** The original copy stays in the file as the source of truth, so nothing is lost if the walkthrough is removed.

To remove the feature completely: delete the `<div id="walk">` block, the `<link>` and the `<script>` tag in `index.html`. Nothing else depends on it.

## 6. Other behaviour changes

- **Nav links.** `#roommates`, `#tenantAdvocacy` and `#howItWorks` point at sections that are now hidden, so `walkthrough.js` intercepts those clicks and scrolls to the matching room. `#homes` still works natively because the cards remain a normal section. Opening `index.html#roommates` directly also works.
- **Popups.** Buttons inside rooms use the existing `data-open="..."` attribute, so the existing `script.js` handles them with no new code.
- **Header.** The existing sticky header is kept. The stage sticks just below it, and `walkthrough.js` measures the header height and subtracts it from the stage height. Without this, the hero buttons were cut off at the bottom of the screen on first load.
- **Mobile (768px and below).** Text panels sit at the bottom over a white fade, and only the first two floating chips show. On phones the photo is cropped around the doorway. Rooms with several items also slide them sideways one at a time (section 10).
- **Floating chips.** The words on them are taken from text already on the site (the roommate form's preferences, the issue types in the tenant form, and "Lagos" and "Abuja" from the Get Started popup). No new marketing copy was invented.

## 7. How to change things

| I want to... | Do this |
|---|---|
| Swap a photo | Replace the file in `images/walkthrough/` and keep the same name. Keep the doorway near the same place, or update `data-door`. |
| Make the zoom land on the doorway | Edit `data-door="[x,y]"` (0 to 1 from the top-left of the photo) on that `.w-room`. |
| Shift the crop | Edit `data-pos` (0 = show the left of the photo, 1 = show the right). |
| Slow down or speed up | Change `H` (hold), `T_DESK` / `T_MOB` (travel) and `SLIDE` (scroll per sideways slide, phones only) at the top of `walkthrough.js`. |
| Put a new item in a sliding room | Add another `<li>` (or `.w-card`) inside that room's `.w-slides` list. The dots and scroll length update themselves. |
| Add a seventh room | Add a `.w-room` and a matching `.w-layer data-i="6"` in `index.html`. The JS reads the count automatically. Update `roomFor` if a nav link should point there. |
| Make another room slide sideways | Wrap its list in `<div class="w-view"><ul class="w-slides">...</ul></div><div class="w-dots"></div>`. Nothing else is needed. |
| Reorder rooms | Reorder both the `.w-room` elements and the `.w-layer` elements, and fix the `data-i` numbers and the `roomFor` map. |

## 10. Mobile: items slide sideways (added in the second round)

**Problem it solves.** On a phone, rooms 2, 3 and 5 held a heading, a paragraph and two or three items at once. The text panel filled the screen and covered the room photo, which defeated the purpose of the walkthrough.

**What it does now (768px and below only).**
- The heading and paragraph stay fixed. The items (the two cards in room 2, the three steps in rooms 3 and 5) sit in a horizontal row inside `.w-view` (a clipping window), and vertical scrolling moves that row sideways. Dots under the row show which item is showing.
- When the last item is reached, the next scroll zooms into the next room as before.
- Rooms with a single idea (outside, living room, bedroom) do not slide. They behave as before.
- **Desktop is unchanged.** The same markup shows all items at once, because the slide rules live inside a mobile-only media query.

**How it is built.**
- *Markup (`index.html`):* the three lists were wrapped as `<div class="w-view"><... class="w-slides">...</div><div class="w-dots"></div>`. Room 2's `.w-cards` became a `.w-slides` list. The `<ol>` lists in rooms 3 and 5 gained the `w-slides` class. No text changed.
- *Styling (`walkthrough.css`, end of file):* on phones `.w-slides` is a flex row. Each item is exactly the width of the window, and the row is moved with `transform: translateX(calc(var(--x) * -1 * (100% + .75rem)))`. `--x` is a number meaning "how many slides in" (0 = first, 1.5 = halfway to the third).
- *Logic (`walkthrough.js`):*
  - A phone room with `k` items holds for `k * SLIDE` screen-heights (`SLIDE = .7`) instead of 1. That is the whole reason the hold length is now per room.
  - Inside a hold, `--x` is computed from scroll position. Each slide rests for 60% of its scroll distance and glides for the last 40%, so the text is readable and the movement stays tied to the finger.
  - When leaving a room the row stays on its last item, and when entering it starts on the first, so the zoom between rooms never shows a half-slid row.
  - Travel between rooms is shortened from 1.1 to 0.9 screen-heights on phones to offset the added length.
  - A small swipe handler was added: swiping an item sideways scrolls the page by one slide. This is a fallback for people who try to swipe, and scrolling still drives everything.

**The cost.** On phones the walkthrough is about 14 screen-heights long, against about 12.5 before. Rooms 3 and 5 each take roughly three scroll steps. If that feels too long, lower `SLIDE` (for example to `.5`) or `T_MOB`.

**Tested** in headless Chromium at 390x780 at every slide of rooms 2, 3 and 5, plus a desktop regression check at 1280x720. No JavaScript errors. **Not tested:** the swipe handler on a real touch device, or iOS Safari's collapsing address bar, which can change the viewport height mid-scroll and slightly shift the slide positions.

## 8. Known limitations and things I did NOT change

- **The photos are about 820px wide.** They look soft on big screens. Regenerate them at 1920px wide in the same aspect ratio and drop them in under the same file names.
- **There is a thin strip of background** between the sticky header and the stage while scrolled. It is cosmetic and I did not chase it down.
- **This is an approximation of video.** It is a zoom and a cross-fade, not true camera movement. Real walking clips can replace it later at the cost of a much heavier download.
- **Not touched, but flagged:** the three home cards still say "Coming Soon", "1st HOUSE", "Location" and "Amount". That is placeholder content, and `images/item-1-demo-listings-changes.md` already describes how to replace it. The footer still says "verified" while nothing is verified yet.
- **Font Awesome icons** (shield, arrows) load from a CDN, as before. Offline, they do not show.

## 9. How it was tested

Loaded in headless Chromium at 1280x720 and 390x780. Checked every room at its hold position, the transitions, the nav-click jump to a room, and the page after the walkthrough. No JavaScript errors were reported. **Not tested:** real iPhone Safari, Android Chrome, or slow connections. Test on real phones before launch.
