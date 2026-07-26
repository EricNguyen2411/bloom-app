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

**Core concept:** every logged entry immediately becomes a flower. There's no accumulation gate — one date, one flower, permanently planted in the garden. Points earned from logging are spendable currency for the Garden Shop, not a growth requirement.

- **Logging time**: just an activity description and a date — no duration to fill in. Blooms a flower on the spot: the dashboard plant animates all the way from a bare pot of soil through every stage (sprout → budding → blooming → flourishing) over a few seconds, then settles back to just the pot, ready for next time. Also earns a flat 8 points (spendable currency). That flower is permanently planted in the garden meadow the moment it saves.
- **Species**: cycles through 8 flower types (Rose, Peony, Hydrangea, Ranunculus, Poppy, Snapdragon, Baby's Breath, Lily) in order, by how many flowers have been grown total — so the dashboard always previews which species is coming next, and the meadow naturally alternates. Each is a hand-built layered-petal SVG illustration (not emoji), colored from that species' own palette. Edit the `SPECIES` array in `app.js` to change the list, colors, or shapes.
- **Streak**: increments if you log again the next calendar day; resets if you skip a day. Stored per-couple, not per-person, since either of you logging keeps it alive. Backfilled (past-dated) entries never affect the streak — only today's entries do, though they still bloom a flower and earn points.
- **Backfilling**: the Log Time sheet has a date field (defaults to today, capped so you can't pick the future). Logging an earlier date still blooms and plants a flower, since it really happened — it just can't be used to fake a longer streak.
- **Photos**: up to 5 per entry, compressed client-side to small JPEGs and stored directly in Firestore (no Firebase Storage / no billing card needed). Entries with more than one photo show a "+N" badge on the primary thumbnail everywhere they appear, and a full gallery strip in the memory detail card. Total combined size per entry is capped (~900KB) to stay safely under Firestore's 1MB document limit.
- **Garden page**: the 🌷 button opens a genuine full-screen page (not a popup). A fixed illustrated scene up top — sky, sun, clouds, rolling hills, a little tree — sits above a continuous green meadow that scrolls with the content. Below "Your decorations" (whatever you've bought so far) sits the garden bed itself: every logged moment (and completed challenge), planted as its own flower across rows of grass, oldest to newest. Tap a flower to see that memory's date, photo, and note. The **Garden Shop** lives at the bottom of the same page.
- **Garden Shop**: spend points on decorations — butterflies, a lantern, a bench, fairy lights, a birdbath, a rainbow, a wind chime, a sundial — purely cosmetic, purely because you want them there. Edit the `DECOR_SHOP` array in `app.js` to change the list, costs, or icons.
- **Day/night sky**: opening the garden between 7pm–6am swaps the sun for a moon and stars, and dims the sky.
- **Seasonal colors**: hills, tree, and grass shift palette with the real calendar month.
- **Long-press to peek**: hold down on any flower with a photo (~⅓ second) to preview it full-size without leaving the garden.
- **Share your garden**: the 📤 button in the garden header renders the whole page as an image and opens your phone's share sheet, or downloads a PNG.
- **Memories list**: the 📷 button — the same logged moments as a plain searchable list.
- **"On this day" flashback**: surfaces a memory from exactly a week, a month, or a year ago on the dashboard.
- **Daily challenge**: deterministic by date, so you both see the same prompt automatically. Completing it once per day also blooms a flower and adds 15 points. Edit `DEFAULT_CHALLENGES` in `app.js` to swap in your own.
- **Anniversary bonus**: optional — set `ANNIVERSARY_MD` in `firebase-config.js` to a date like `"08-09"`. On that date each year, a 50-point bonus lands automatically, shown in the Stats sheet.
- **Floating photo dots**: up to 8 recent memory photos float around the dashboard plant. Which ones show and where changes once per day (same arrangement all day, different tomorrow) rather than reshuffling every time you open the app. Tap one to jump straight to that day's entry in the Garden.
- **Weekly recap**: in Settings (⚙️, top-right of the dashboard) — logged entries, points earned, and challenges completed in the last 7 days.
- **Settings**: moved to a gear icon in the top-right corner instead of a bottom button, to keep the action bar from getting crowded. Contains stats, the app icon toggle for the Challenge feature (in case you're not using it yet — hides it from the action bar for both of you), PDF export, and the data backup.
- **Little gardener animation**: the plant's grow animation now includes a small character who appears and waters the sprout partway through, then steps back for the bloom.
- **Date ideas / bucket list**: the 💡 button — a shared running list you both add to and check off.
- **Memory search**: filters the Memories list by activity text or notes.
- **Export as PDF**: in the Stats sheet, builds a downloadable keepsake booklet from everything logged.
- **Data backup**: also in Stats — "Backup (JSON)" downloads a complete, unlimited snapshot of everything, unlike the capped live views used elsewhere in the app. "Restore" merges a backup file back in by original ID, so re-importing never duplicates. This is the real safety net; the PDF above is a pretty keepsake, this JSON is what you'd actually use to recover data.
- **Sound & haptics**: a small chime plays on logging, completing a challenge, and buying a decoration (with a subtle vibration on Android; iOS Safari doesn't support vibration, so it's silent-but-fine there).
- **Edit / delete a memory**: each entry in the Memories list has Edit and Delete. Deleting doesn't subtract the points it already earned — it just removes the record.
- **Welcome screen**: shows once per device on first open, explaining the concept. Stored in the browser's local storage, not synced.

### A note on photo storage
Photos live inside Firestore documents as compressed JPEGs (roughly 40–150 KB each depending on the photo), not in a separate file storage service. That keeps everything on Firestore's free tier with zero billing setup. At that size you could log several thousand photos before approaching Firestore's 1 GB free storage limit — more than enough for a project like this. If you ever want full-resolution photos instead, that would mean switching to Firebase Storage, which requires linking a billing card (Google's free allowance still applies, but the card is mandatory to enable it) — worth asking for if you want to go that route later.

### A note on security
Uses a private "room code" rather than individual logins, to keep setup simple. Private
enough for a personal gift app, not bank-grade — don't put anything in there you'd be
devastated to have exposed if someone guessed the code.

### If you get stuck
Bring the error message or a screenshot back here and I'll debug it with you.
