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
- **Logging time**: 4–12 points depending on minutes logged (10 min ≈ 4 pts, 100+ min ≈ 12 pts, capped).
- **Streak**: increments if you log again the next calendar day; resets if you skip a day. Stored per-couple, not per-person, since either of you logging keeps it alive.
- **Daily challenge**: deterministic by date (`day-of-month % challenge list length`), so you both see the *same* prompt without needing to sync which one was picked. Completing it once per day adds 15 points and unlocks the next decoration. Edit the `DEFAULT_CHALLENGES` array in `app.js` to swap in your own.
- **Decorations**: currently 7 emoji placeholders (🦋✨🌈🕯️🐝🌙☀️) unlocked in order as challenges are completed. Easy to swap for custom icons later.

### A note on security
Uses a private "room code" rather than individual logins, to keep setup simple. Private
enough for a personal gift app, not bank-grade — don't put anything in there you'd be
devastated to have exposed if someone guessed the code.

### If you get stuck
Bring the error message or a screenshot back here and I'll debug it with you.
