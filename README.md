# bloom. — setup guide

A private, installable web app (PWA). No App Store, no Xcode, no cable. Open a link
once, add it to the home screen, and it behaves like a real app from then on —
including live syncing between both your phones.

## What's in here

- `index.html` / `app.js` — the app itself (growth points, streak, daily challenge, decorations)
- `manifest.json`, `service-worker.js`, `icons/` — what makes it installable + offline-capable
- `firebase-config.js` — plug in your own backend here so it syncs between phones
- `firestore.rules` — security rules for your Firebase project

Open `index.html` right now and it already works in **demo mode** with local state —
just doesn't save or sync anything yet. Follow the steps below to wire up real syncing.

---

## Step 1 — Create a Firebase project (~5 min)

1. Go to https://console.firebase.google.com → **Add project** → name it anything → skip Google Analytics.
2. **Build → Firestore Database → Create database** → production mode → any region.
3. **Build → Authentication → Get started** → enable the **Anonymous** sign-in method.
4. **Project settings** (gear icon) → "Your apps" → **</> (Web)** icon → register an app → copy the `firebaseConfig` object.
5. Paste those values into `firebase-config.js`, replacing the `REPLACE_ME` placeholders.
6. In `firebase-config.js`, set `COUPLE_ID` to a private made-up code only the two of you know.
7. Firestore → **Rules** tab → paste in `firestore.rules` → **Publish**.

## Step 2 — Deploy to GitHub Pages (free hosting)

1. Create a new **public** GitHub repo (e.g. `bloom-app`).
2. From inside this folder:
   ```
   git init
   git add .
   git commit -m "bloom app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/bloom-app.git
   git push -u origin main
   ```
3. GitHub repo → **Settings → Pages** → Source: **Deploy from a branch** → `main`, `/ (root)` → Save.
4. After a minute or two: `https://YOUR_USERNAME.github.io/bloom-app/`

## Step 3 — Install it on both phones

In **Safari** on each iPhone (must be Safari, not Chrome):
1. Open the GitHub Pages link.
2. Tap **Share** → **Add to Home Screen** → Add.

It now sits on the home screen with its own icon, opens full-screen, and both of you
see the same plant grow in real time — no refresh needed, updates appear live.

---

## How the mechanics work (for reference / tuning)

- **Growth stages**: seed (0) → sprout (20) → budding (50) → blooming (100) → flourishing (200+) points.
- **Logging time**: 4–12 points depending on hours logged (0.5 hr ≈ 4 pts, 2+ hrs ≈ 12 pts, capped).
- **Streak**: increments if you log again the next calendar day; resets if you skip a day. Stored per-couple, not per-person, since either of you logging keeps it alive. Backfilled (past-dated) entries never affect the streak — only today's entries do.
- **Backfilling**: the Log Time sheet has a date field (defaults to today, capped so you can't pick the future). Logging an earlier date still grows the plant, since it really happened — it just can't be used to fake a longer streak.
- **Photos**: compressed client-side to a small JPEG and stored directly in Firestore (no Firebase Storage / no billing card needed). Shows as thumbnails in the Memories gallery and as small floating dots around the plant.
- **Memories gallery**: the 📷 button — every logged moment and completed challenge, newest first, each with an optional note either of you can add after the fact.
- **"On this day" flashback**: a small card above the action bar that surfaces a memory from exactly a week, a month, or a year ago, whichever is furthest back and available.
- **Daily challenge**: deterministic by date (`day-of-month % challenge list length`), so you both see the *same* prompt automatically. Completing it once per day adds 15 points, unlocks the next decoration, and logs itself into the Memories feed. Edit the `DEFAULT_CHALLENGES` array in `app.js` to swap in your own.
- **Decorations**: 7 emoji placeholders (🦋✨🌈🕯️🐝🌙☀️) unlocked in order as challenges are completed, visible in the Garden menu.
- **Anniversary decoration**: optional — set `ANNIVERSARY_MD` in `firebase-config.js` to a date like `"08-09"`. On that date each year, a special 💍 decoration unlocks automatically plus a 50-point bonus, shown in the Garden menu.
- **Weekly recap**: in the Garden menu — logged entries, total hours, and challenges completed in the last 7 days.
- **Bouquet & species**: once the plant reaches Flourishing (200+ points), a "Add to bouquet 💐" button appears. Harvesting it adds that flower to your permanent bouquet (shown in the Garden menu), keeps any leftover points, and starts a *new* plant growing — cycling through 5 flower species (Rose, Violet, Marigold, Aster, Poppy) so each round looks different.
- **Date ideas / bucket list**: the 💡 button — a shared running list you both add to and check off, separate from the logged-past-dates gallery.
- **Memory search**: a search box at the top of the Memories gallery filters by activity text or notes.
- **Export as PDF**: in the Garden menu, "Export memories as PDF" builds a downloadable keepsake booklet from everything logged (dates, activities, notes, and photos), oldest first.
- **Sound & haptics**: a small synthesized chime plays on logging time, completing a challenge, and harvesting a bouquet (with a subtle vibration on Android — iOS Safari doesn't support vibration, so it's silent-but-fine there).

### A note on photo storage
Photos live inside Firestore documents as compressed JPEGs (roughly 40–150 KB each depending on the photo), not in a separate file storage service. That keeps everything on Firestore's free tier with zero billing setup. At that size you could log several thousand photos before approaching Firestore's 1 GB free storage limit — more than enough for a project like this. If you ever want full-resolution photos instead, that would mean switching to Firebase Storage, which requires linking a billing card (Google's free allowance still applies, but the card is mandatory to enable it) — worth asking for if you want to go that route later.

### A note on security
Uses a private "room code" rather than individual logins, to keep setup simple. Private
enough for a personal gift app, not bank-grade — don't put anything in there you'd be
devastated to have exposed if someone guessed the code.

### If you get stuck
Bring the error message or a screenshot back here and I'll debug it with you.
