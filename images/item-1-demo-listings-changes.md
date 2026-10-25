# Item 1 (revised): Sample listings for a demo site

New fact: Syntonia is a showcase that advertises Wisdom Web Services.
That changes the answer. Sample listings are legitimate on a showcase, as long
as nobody can mistake them for real offers. So we keep the cards, make them
look real, and label them honestly.

IF YOU ALREADY APPLIED STEPS 1 AND 2 from the earlier file (the "coming soon"
block and the hero button change), undo them first:
- In the terminal run: `git restore index.html`
- ONLY do that if you made no other edits to index.html since your Git commit.
  If you did, stop and tell me.
If you did not apply them, skip this and go to Edit 1.

Edits: `index.html` (3 parts) and `script.js` (1 line). No CSS changes.

---

## DECISIONS (and why)

1. Badge text: "Verified" becomes "Sample".
   "Coming soon" promises that real listings are on their way. "Sample" says
   this card is an example. For a showcase, "Sample" is the more accurate word.
   Use "Coming soon" only if Syntonia will really launch.

2. Replace placeholder text with realistic sample content (a real-sounding
   title, an area, a price). Visitors judge your craft by how finished the
   demo feels. "1st HOUSE / Location / Amount" says unfinished. Realistic data
   says professional.

3. Do not use real property names or real prices you cannot back up.
   "Cyber Ville by Coastal Road" is a real-sounding development. Use
   an area name only.

4. "View Home" and "Explore all homes": open a popup. Not "coming soon".
   See below.

---

## WHAT THE POPUP SHOULD SAY (my recommendation)

A popup is the right idea. The wording is not "coming soon".

The people who click "View Home" are exactly the people judging your work. If
the click does nothing, or jumps to the top of the page, you fail the test.
If a clean popup appears, you show you thought about the flow. So say what
is going on, and sell yourself:

   DEMO PROJECT
   This is a sample listing
   Syntonia is a demo built by Wisdom Web Services. On a live site, this opens
   the full property page with photos, details and a contact button.
   [ Got it ]

It is one popup, reused by every dead button. You never need a second one.

---

## EDIT 1: `index.html`, the three cards

In the Featured Homes section, change these things inside each
`home-card`. Match by text. Do not delete anything else.

### Card 1
| Find | Change to |
|---|---|
| `alt="1st Image"` | a description of what the photo actually shows, e.g. `alt="Bright living room in a modern one-bedroom flat"` |
| `Verified` (inside `verified-badge`) | `Sample` |
| `<h4>1st HOUSE</h4>` | `<h4>Modern 1-bedroom flat</h4>` |
| `<p class="location">Location</p>` | `<p class="location">Yaba, Lagos</p>` |
| `Amount <span>/ YEAR</span>` | `₦1.8M<span> / year</span>` |

### Card 2
| Find | Change to |
|---|---|
| `alt="2nd Image"` | a real description of that photo |
| `Verified` | `Sample` |
| `<h4>2nd Home</h4>` | `<h4>Self-contained studio</h4>` |
| `<p class="location">Location</p>` | `<p class="location">Wuse 2, Abuja</p>` |
| `Amount <span>/ YEAR</span>` | `₦1.5M<span> / year</span>` |

### Card 3
| Find | Change to |
|---|---|
| `alt="3rd Image"` | a real description of that photo |
| `Verified` | `Sample` |
| `Spacious 2 bedroom apartment` | keep it |
| `Cyber Ville by Coastal Road Ikate Lekki` | `Lekki Phase 1, Lagos` |
| `₦8.0M<span> / year</span>` | `₦6.0M<span> / year</span>` |

Prices are sample figures. Adjust them to what feels realistic to you.

### All three cards: the "View Home" link
Find each `<a href="#">View Home →</a>` and change it to:

```html
<a href="#" data-open="demoNotice">View Home →</a>
```

### The "Explore all homes" button
Change `<button>Explore all homes →</button>` to:

```html
<button data-open="demoNotice">Explore all homes →</button>
```

WHY: `data-open` is the label system from Step 5. It tells the JavaScript
which popup to open. No new code is needed except one line (Edit 3).

PHOTO WARNINGS:
- Each card needs its own photo. Card 3 currently reuses the picture from
  your final section.
- Photos must be licensed. Unsplash or Pexels are fine. Do not copy photos from
  real property listings.
- The alt text is read by screen readers and Google. "1st Image" tells them
  nothing.

---

## EDIT 2: `index.html`, add the demo notice popup

Scroll to the bottom. Paste this AFTER the tenant support form's `</form>` and
BEFORE `</body>`:

```html
    <!-- Demo notice -->
    <div class="modal" id="demoNotice">
        <button type="button" class="close-btn">✕</button>

        <p class="eyebrow">Demo project</p>
        <h2>This is a sample listing</h2>
        <p class="subtitle">Syntonia is a demo built by Wisdom Web Services. On a live site, this opens the full property page with photos, details and a contact button.</p>

        <button type="button" class="submit-btn" data-close>Got it</button>
    </div>
```

WHY: it reuses the classes you already have (`modal`, `eyebrow`,
`subtitle`, `close-btn`, `submit-btn`). `data-close` makes the "Got it" button
close the popup using the Step 5 JavaScript.

---

## EDIT 3: `script.js`, one line

The "View Home" links are `<a href="#">`. Clicking a `#` link normally jumps
the page to the top. We have to cancel that.

Find this block in your click listener:

    const opener = e.target.closest('[data-open]');
    if (opener) {
        openModal(opener.dataset.open);
        return;
    }

Add ONE line before `openModal(...)`:

```js
    const opener = e.target.closest('[data-open]');
    if (opener) {
        e.preventDefault();
        openModal(opener.dataset.open);
        return;
    }
```

WHY: `e.preventDefault()` means "cancel the browser's default behavior for
this click". Without it, the popup opens AND the page flies to the top.

---

## HOW TO CHECK YOU PASSED
Save all, then hard refresh (Ctrl + Shift + R).

1. All three cards show "Sample", a real title, an area and a price. No "1st",
   "Location" or "Amount" anywhere.
2. Ctrl + F in the HTML and search `Verified`. Check that you understand every
   remaining result (the chooser and other copy still use the word; we deal
   with that in the copy pass).
3. Click each "View Home →". The popup opens, and the page does NOT jump to
   the top.
4. Click "Explore all homes →". Same popup.
5. Close with "Got it", the ✕, Esc, and by clicking outside.
6. Every card image has a unique photo and a meaningful `alt`.
7. Console (F12): no red errors and no "No popup with id" warning.
8. `document.querySelectorAll('[data-open]').length` in the Console should now
   read 13 (the earlier 9, plus 3 View Home links and Explore all homes).

---

## NEXT (the real purpose of this site)
A showcase site that never asks anyone to hire you has no job.
Right now there is no "Want a site like this? Contact Wisdom Web Services"
anywhere. Next step: a footer credit and a contact call-to-action. Have ready
the WhatsApp number or email you want to use.
