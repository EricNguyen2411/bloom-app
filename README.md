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

## ⚠️ Security update — read this if you set this up before

The app used to use Firebase's **Anonymous** sign-in, with `COUPLE_ID` as the only
thing keeping your data separate from anyone else's. That doesn't actually work:
`firebase-config.js` (including `COUPLE_ID`) is public — it's plain JavaScript
served from your public GitHub Pages site, downloadable by anyone who visits the
URL. Combined with anonymous auth (which requires zero credentials — anyone who
opens the link gets signed in automatically), that meant **anyone with your URL
could read and write your data**, not just the two of you.

This has been replaced with real email/password accounts, checked by Firebase
itself, restricted to two specific email addresses in `firestore.rules`. If
you set this app up before this change, you need to redo Step 1 below (parts
3, 6, and 7 specifically) before deploying the updated files — otherwise your
`firestore.rules` will still be the old, wide-open version.

## Step 1 — Create a Firebase project (~5 min)

1. Go to https://console.firebase.google.com → **Add project** → name it anything → skip Google Analytics.
2. **Build → Firestore Database → Create database** → production mode → any region.
3. **Build → Authentication → Get started** → enable the **Email/Password** sign-in method (not Anonymous).
4. Still in **Authentication → Users** → **Add user** → do this twice, once for each of you. In the "Email" field, don't use a real email — pick a plain username each (lowercase, no spaces) and enter it as `yourusername@bloom.local`, e.g. `amy@bloom.local` and `eric@bloom.local`. Set a password each of you picks. These are the only two accounts that will ever be able to open the app — when you actually log into the app, you'll just type `amy` (not the `@bloom.local` part), the app adds that automatically.
5. **Project settings** (gear icon) → "Your apps" → **</> (Web)** icon → register an app → copy the `firebaseConfig` object.
6. Paste those values into `firebase-config.js`, replacing the `REPLACE_ME` placeholders.
7. In `firebase-config.js`, set `COUPLE_ID` to any made-up code — it no longer needs to be kept secret (that was never real protection to begin with), it's now just an internal label.
8. Open `firestore.rules` and replace the two placeholders with your two usernames from step 4, in the form `yourusername@bloom.local`.
9. Firestore → **Rules** tab → paste in the edited `firestore.rules` → **Publish**.

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

- **Correction to the entry just below, found by actually checking the shipped code instead of trusting this changelog**: despite what the next entry says, the meadow's `filter:drop-shadow` had *not* actually been removed — it was still live on `.meadow-bloom`, applied to every flower in both the Garden and Path views (which render every entry at once, with no pagination). Confirmed by reading the CSS directly. It's now actually removed. Separately, Hydrangea had been reverted back to its full 30-floret / 180-element version (confirmed by running `hydrangeaCluster()` and counting the real output) after the "flower detail restored" entry further down undid the earlier trim, based on a hunch that the service worker fix was "more likely" the real cause — that hunch was never confirmed against an actual device test. Hydrangea is back to 16 florets / 96 elements now (rendered and visually checked — still reads clearly as a dense cluster, just slightly less tightly packed). A `withTimeout()` guard was also added around every Firestore write triggered from a button (logging an entry, completing a challenge, editing/deleting, bucket list, habits) — Firestore's write promises don't resolve until the server acknowledges them, so on a bad or offline connection they can hang forever with no error, which is the direct cause of "I press Water it and it freezes and does nothing." If the reload/crash keeps happening after this, the honest next step is testing against a real device with an *empty* garden — that isolates whether rendering cost is really the cause at all, rather than reaching for another rendering-cost guess.

- **A likely fix for crashing specifically on "Water it" and first launch**: these both center on the single dashboard flower — one during its bloom animation, the other showing it at rest. That flower still had a `drop-shadow` filter, which (unlike a plain shadow) has to be recalculated on every single frame while the flower scales up during the bloom animation, not just once — a real, meaningfully different cost than a static image, and much more expensive for a complex multi-path SVG like Hydrangea than for simpler ones. This lines up with the crash being intermittent ("only sometimes") — worse specifically when the next flower due to bloom happens to be one of the more detailed species. Removed the filter from the dashboard flower entirely (already removed from the meadow's flowers earlier).

- **Save to Photos button**: each photo you pick or take in Log Time now has a small 💾 button — opens iOS's native share sheet with "Save Image" one tap away, using the original full-quality photo (not the compressed version stored in the app). A real limitation worth knowing: no web app, installed or not, can silently save straight to the Camera Roll — that's a deliberate iOS restriction, so this two-tap flow is the best a web app can actually offer. Currently just the Log Time flow; Edit Entry's photo picker doesn't have it yet.

- **Automatic sync nudge on foreground**: whenever the app comes back to the foreground — reopened after being backgrounded for a while, or switched back to from another app — it now automatically nudges Firestore to reconnect right away, the same thing the manual "Sync now" button does. This is the most common cause of "it didn't sync": the connection silently dropped while the app sat in the background, and nothing was actively prompting it to retry until you happened to do something that needed fresh data. Throttled to once per 20 seconds so quickly switching apps back and forth doesn't spam reconnects. The manual button still exists in Settings for anytime this isn't enough on its own.

- **Flower detail restored**: the element-count trimming from the crash investigation (Hydrangea, Sunflower, Marigold, Dahlia, Ranunculus, Daisy, Baby's Breath, plus the meadow's drop-shadow) has been undone now that the service worker fix looks like the more likely actual cause. Flowers are back to their full detail level.

- **Likely the real fix, based on the actual crash pattern**: crashing specifically after being idle for hours or right after an update, but never on an immediate force-close-and-reopen, doesn't fit a pure memory/rendering problem (that would crash every time equally) — it fits a service worker update race condition. The service worker was written to take over immediately, mid-session, the moment a new version was detected (`skipWaiting()` + `clients.claim()`) — including possibly hijacking a page that's already in the middle of loading, which lines up exactly with "only when Safari checks for an update on reopen." Removed both — a new version now waits until the app is fully closed and reopened fresh before taking over, never interrupting a page already in motion.

- **A likely real fix for the crashing, found by actually counting elements**: since the photo optimization didn't resolve it, counted the actual SVG element complexity of every flower and found Hydrangea was rendering 180 individual elements — wildly disproportionate to everything else (next highest was 55). With 100+ entries in the meadow, all flowers render simultaneously (nothing is paginated), so this added up to roughly 4,000+ SVG elements in the DOM at once, each with an expensive `drop-shadow` filter applied — a much more GPU-intensive operation than a simple shadow, especially multiplied across that many complex vector shapes. Hydrangea rebuilt with fewer, larger, still-tightly-packed florets (96 elements instead of 180), several other dense flowers (Sunflower, Marigold, Dahlia, Ranunculus, Daisy, Baby's Breath) trimmed similarly, and the drop-shadow filter removed from the meadow's flowers entirely (kept only on the single dashboard flower, where it costs nothing). Total estimated element count for a 113-entry garden dropped from ~4,000+ to ~2,900, with no visible loss in how detailed the flowers look.

- **Previous/next arrows in the Garden detail view**: tapping into an entry now shows ‹ › arrows next to "Back to garden" — browse straight through your entries in order without bouncing back to the meadow each time. Grayed out at the very first or very last entry. Uses the same chronological ordering as everything else, so "next" always means what you'd expect. This is currently just the Garden — the Path doesn't have it yet.

- **Thumbnail quality fixed**: the first version compressed thumbnails aggressively (72px) — fine for the tiny 20px meadow badge, but visibly blurry once reused for the larger 56px detail-view thumbnail. Bumped up to 140px at higher quality (~3KB instead of ~0.8KB per thumbnail — still about 23x smaller than a full photo, so the crash-prevention benefit barely changes, but now sharp enough to hold up at both sizes). The "Speed up older entries" button now always regenerates every thumbnail rather than only filling in missing ones, specifically so it can be run again to replace the earlier, blurrier batch.

- **A real spot I missed in the thumbnail fix**: the dashboard's floating photo dots (scattered around the plant) were still loading full-size photos to display at just 34px — the exact same wasteful pattern already fixed everywhere else, but sitting right on the main screen that loads on every single cold start. Now uses the small thumbnail like everything else does.

- **Flower name shown in the detail view**: tapping any entry now shows which flower it is (e.g., "14 DEC 2025 · Hydrangea") right next to the date. Species isn't stored on the entry itself — it's always computed from that entry's position in the full timeline, the same way the meadow already determines which flower to draw — so this is guaranteed to always match whatever's actually shown for that entry in the garden, never out of sync.

- **All 16 flowers reviewed and improved, one by one**: rendered each one individually at large size and compared it against how the real flower actually looks. Found a systemic issue affecting Rose, Peony, Ranunculus, and Marigold — the petal shape always came to a sharp point at the tip, which works for genuinely pointed flowers (lily, daisy, sunflower) but made these four look like pointed lotus/star shapes instead of the soft, round, ruffled flowers they actually are. Built a proper rounded-petal-tip shape and rebuilt all four with it — Marigold in particular went from a spiky star to an actual dense, ruffled cluster. Also rebuilt Snapdragon's individual florets with a real pinched two-lipped "mouth" shape instead of plain overlapping circles, and added the characteristic fuzzy "beard" detail to Iris's drooping petals. Lily, Sunflower, Daisy, Tulip, Cherry Blossom, Baby's Breath, Orchid, and Dahlia were checked too and already held up well as-is.

- **Hydrangea and Poppy rebuilt, based on real feedback**: hydrangea only had 7 florets scattered loosely in a cross pattern, which read as random dots rather than a flower — real hydrangeas are dense, tightly packed clusters of dozens of tiny florets. Rebuilt using the same spiral-packing pattern real flower heads actually grow in (~30 florets, densely packed into a round cluster). Poppy had 4 petals spaced in a rigid, perfectly even cross — rebuilt as two overlapping rings of wider petals for the fuller, overlapping cup real poppies have, keeping the dark center and radiating stamens. Orchid was also noticeably smaller than its siblings — bumped up to match.

- **Photo thumbnails, a real fix for the crashing**: since you confirmed the crash still happens even on full battery, that ruled out iOS power-management as the main cause and pointed back at the app itself. The likely culprit: the meadow, the Path, and the Memories list were all decoding full-size ~640px photos just to display them at ~20-56px, for every single entry, every time those views render. New entries (and edited ones) now get a dedicated tiny thumbnail (~1KB instead of ~70KB) generated specifically for those small previews — tested against a realistic photo, this is roughly a 99% reduction in what needs to be decoded for those bulk-display views. A "🖼️ Speed up older entries" button in Settings does the same for everything already logged, one time — safe to run more than once, and it only touches entries that don't already have a thumbnail. This can't be fully confirmed as the actual cause of the crash without more testing, but it's a real, measured inefficiency that's now fixed either way.

- **Manual sync button**: "🔄 Sync now" in Settings — briefly disconnects and reconnects Firestore, which makes it retry immediately instead of waiting on its own internal backoff timer. Useful after a spotty connection or the day after hitting a usage quota, without needing to fully close and reopen the app. Genuine offline support (logging with no signal, syncing automatically once back online) was already working before this — this button is for nudging a stuck connection, not a replacement for that.

- **Real flowers, no more white circle**: every entry always shows its actual flower with the photo as a small round thumbnail tucked in the top corner (this was the first pass at removing the photo-fills-the-circle problem). Then went further: removed the white circular background/border entirely — each flower's own detailed petals (they were always genuinely layered, multi-ring illustrations — rose, peony, hydrangea, etc., not abstract shapes) now define its visible shape directly, rendered noticeably larger, with a soft shadow following the actual flower silhouette instead of a circular disc behind it. Applies to both the Garden meadow and the Path.
- **8 new flowers added**: Sunflower, Daisy, Tulip, Orchid, Cherry Blossom, Dahlia, Marigold, and Iris join the original 8, doubling the total to 16 — each genuinely shaped like the real flower (sunflower's dark seed-disc center, tulip's closed cup silhouette, iris's alternating upright and drooping petals, cherry blossom's notched petal tips), not palette swaps of the same shape.
- **The main screen now shows real flowers too**: the bloom animation used to end on a generic 5-petal CSS shape, just recolored per species — now it shows the actual detailed species illustration, the same art that ends up in the garden.

- **International Girlfriend Day welcome message**: a personal note now sits at the top of the one-time first-launch welcome screen — easy to edit directly in `index.html` (search for "Happy International Girlfriend Day") if you want to change the wording to something more specifically "you two." It only ever shows once, the same as the rest of the welcome screen always has (tracked via a flag on the device, not tied to today's date specifically — so it says the same thing whenever it's first opened, not just on August 1st).
- **Stale "points" reference removed**: the welcome screen still mentioned spending points on decorations, left over from before points were removed entirely. Fixed.

- **Habit photos**: each habit entry can now optionally hold a photo — attach one from the Habits sheet (a small 📷/🖼️ button appears once you've logged today), or just log without one, no obligation either way. Under the hood this meant restructuring habits from one shared document into one small document per day (the date itself is the ID), the same pattern the main memories collection already uses — a single array field holding photos would have eventually hit Firestore's per-document size limit; this way it can't.
- **Habit toggle added, garden pots removed**: the two potted plants that used to sit in the scene for cooking/gym progress are gone — pulled back out. There's now a "Habit streaks" toggle in Settings (next to the Path one) to hide the whole feature — the Habit tab in Log Time — if it doesn't end up getting used.
- **Habits folded into Log Time**: the separate "Habits" button is gone — one button too many. Pressing "Log time" now shows a small "📅 Date / 🔁 Habit" toggle at the top; switching to Habit shows the same streak cards, log button, and photo option as before, just inside the same sheet instead of a whole extra entry point.
- **Backdating a habit**: each habit card now has a "Forgot a day? Log it for an earlier date →" link that expands a small date picker — for logging a cook/gym session from a day or two ago instead of only today.

- **Habit streaks**: a new "🔁 Habits" button, separate from logging a memory — starts with "Cooked together" and "Gym together," each with its own one-tap "Log today," current streak, and total count. Deliberately lighter than the flower system: no photo, no note, no date picker, since these are recurring things rather than individual moments worth their own memory. Add more habits any time by editing `HABITS_LIST` in `app.js` — each just needs an id, a name, and an icon.

- **Daily Challenge, expanded**: 33 challenges now instead of 7 — a mix pulled together with a look at what actually works for couples online (gratitude, small gestures, real conversation, trying something new, a bit of playfulness), rewritten to match the app's existing tone. Also fixed a real bug found while doing this: the rotation used to cycle by day-of-month (1–31), which meant any challenge beyond the 31st in the list could almost never come up. It now cycles by day-of-year instead, so every challenge gets fair, even rotation across a full year.

- **The Path (experimental)**: a second, separate way of browsing the garden — accessed via its own "Path" button, entirely independent from the Garden button so both can be compared side by side, with its own on/off toggle in Settings if you want to hide it while deciding. The couple's bench sits at the very start of the path, and every entry alternates cleanly left and right down a winding trail, each showing its activity name and date underneath. Trees and bushes are scattered along the route for visual variety, and it ends with a small "…and more to come" marker instead of just stopping. Jump-to-date and the scroll scrubber both work here too now, same as the Garden. Built in the same flat, hand-coded illustration style as the rest of the app (not a photorealistic scene — see note below), and works for any number of entries since the curve and its length are computed fresh each time, not a fixed background image. Tapping a flower opens the same memory detail as the regular Garden. Year fences are the one thing intentionally still missing — the strict left-right alternation makes a full-width fence look odd breaking the zigzag, so that would need its own redesign rather than a straight port if this layout is kept.
- **Settings reordered**: "Your decorations" and "Garden Shop" now sit below the App settings toggles, instead of above them.
- **Path now shares the Garden's real header scene**: the same live illustrated scene — sky, sun/moon, hills, tree, months sign, the bench, pets, everything — now sits at the top of the Path too, not a copy but the *actual same element*, moved between the two pages depending on which one's open. This means they can never visually drift apart from each other over time; every future tweak to the Garden's scene automatically applies to the Path too. The hand-drawn placeholder bench that used to sit at the top of the winding path itself is gone now that the real one is there instead, and the path starts with extra breathing room below the scene so it's never cramped.
- **Year signposts on the Path**: a small sign planted right on the path itself marks each year, including one at the very start for the first entry's year. Designed as its own thing rather than a straight port of the meadow's picket fence, since a full-width fence doesn't suit this winding, alternating layout.

- **In-app loading screen**: instead of a blank fade, the little gardener now appears watering a fresh pot while the app connects, with "Growing your garden…" underneath — shown until real data has actually arrived (or after 2.5 seconds regardless, so a slow connection never leaves it stuck).

- **Choose the cover photo**: when an entry has more than one photo (while logging, or later in Edit), each thumbnail gets a small star — tap the star on any photo to make it the cover (a gold border marks the current one). The cover photo is what shows on the flower in the garden and as the thumbnail in the Memories list.

- **"On this day" intervals**: now just a month ago and a year ago — the week-ago option was removed.


- **Rubber-band bounce fix, corrected**: an earlier attempt to lock the whole page from scrolling (`overflow:hidden` + a hard `height:100%`) turned out to cause a worse problem — a white gap at the very bottom of the screen, exactly where the iOS home indicator sits, on every page. That's now fully reverted back to the original `min-height` approach. The only thing that stayed is `overscroll-behavior:none`, a much smaller, targeted change that prevents the rubber-band bounce without touching how the page sizes itself.
- **Fluid scaling**: header spacing, the title, and the plant scene's minimum height now scale with the actual screen height (using CSS `clamp()`) rather than fixed pixel values. Most noticeably, the plant area's floor shrinks from a fixed 300px down to as little as 190px on shorter screens — real headroom that reduces the chance of anything getting clipped now that the main screen no longer scrolls. On both an iPhone 13 mini and 14 Pro this comfortably fits without visible difference in normal use; it mainly protects against edge cases like landscape orientation or accessibility text size increases.

- **Real sunrise/sunset**: the garden's sky color, sun/moon, and the morning/afternoon/sunset/night cycle follow the actual sun for Sydney (computed with a standard astronomical formula — no paid API or key involved, and no location permission prompt), instead of fixed clock hours. Sunset in June looks different from sunset in December, the way it actually would.
- **Meadow scrubber**: hold and drag along the right edge of the garden bed to jump around quickly — a floating "Dec 2025"-style label follows your finger. No visible track line, just the invisible drag zone and the label.

- **Lazy-loaded photos**: meadow flowers and the Memories list now use `loading="lazy"` so photos only load as they scroll into view — keeps things smooth as the garden grows into the hundreds of entries.
- **Live feed cap raised**: the garden bed, jump-to-date, and flower count used to be fed by a 200-entry live listener. Raised to 1000 — Fun Stats and the reviews below always did a full unlimited count regardless, but the meadow itself would have started dropping older entries as you approached 200.
- **Month in Review / Year in Review**: in Settings — pick a month or year (navigate with the arrows, not locked to the current one) and see dates logged, photos saved, challenges completed, the longest streak within just that period, and — for Year in Review — your busiest month. Shows a featured photo from that period if one exists.

- **Garden scroll position preserved**: opening an entry from the meadow and tapping "back to garden" now returns you to exactly where you were scrolled, instead of resetting to the top.
- **Tap outside any sheet to close it**: applies everywhere in the app — Settings, Memories, Log Time, Edit, Jump to date, all of it — one rule, not sheet-by-sheet.
- **Scroll-bleed bug fixed**: background page scrolling instead of the sheet in front of it (most noticeable in Settings) was because the page behind an open sheet was never locked from scrolling. Fixed globally.
- **Jump to date, rebuilt as a real calendar**: month-by-month grid (Mon–Sun), only days you've actually logged something are circled and tappable. Tapping one scrolls to that flower and opens it directly — and going "back" afterward lands you right at that flower thanks to the scroll-preservation fix above.
- **Points removed entirely**: not just hidden from the dashboard anymore — the whole point system is gone. Logging and challenges no longer earn anything to spend; the Garden Shop is now a free picker where everything's available to add or remove at will, no cost, no confirmation dialog needed since there's nothing to lose by removing something. The weekly recap's "Points" box is now "Photos" instead, a more meaningful number now that points don't exist. Streak, flower count, and the daily challenge all work exactly as before — none of that was tied to points.
- **Shop trimmed to custom-illustrated items only**: the generic emoji decorations (lantern, fairy lights, fountain, wind chime, rainbow, pond, statue, gazebo) are gone. What's left all has real custom art in the scene: the bench, both Pomeranians, and two new ones — the **Harbour Bridge** and the **Opera House**.

- **"On this day" improved**: tapping the flashback banner now jumps straight to that exact flower in the garden instead of just opening the general Memories list, and it shows a preview of the note if there is one.
- **Private love notes**: a separate, tucked-away note on any entry (add one via Edit → 💌 Private note) that stays hidden until tapped — shown with its own soft, romantic reveal rather than sitting openly on the card like a regular note.

- **Year dividers**: a little picket fence with a hanging "🌱 2026" sign appears in the garden bed wherever the year changes between entries — including right at the very start of the garden, showing the year of your first entry. Spacing is tuned so flowers sit just as close to the fence on both sides.

- **Location (stored, not shown yet)**: when you attach a photo to a new entry, the app quietly reads GPS coordinates from the photo's own metadata (the same way it already reads the date) and stores it — but doesn't display anything about it right now (no map, no notice, no edit option). This is deliberately paused for now while the display gets refined; the data itself keeps accumulating in the background so nothing needs to be redone later. Note: photos that have already been compressed and saved in the app (or ones re-shared/downloaded rather than the original) have had their metadata stripped already, so this only works from an original, unprocessed photo at the moment it's first uploaded.

- **Photo-count badge**: back to a number (not the icon), sized much smaller so it actually fits within the small meadow flower circle instead of overflowing it.
- **Photo viewer**: tapping anywhere outside the photo itself now closes it too, not just the ✕ button.
- **"Back to garden" button**: now a visible pill button, so it's not confused with the header's "← Back" (which exits to the dashboard).
- **No butterflies or rabbit at night**: they only make sense in daylight, so they're hidden once night falls.
- **Shooting stars**: two, appearing every now and then in the night sky, alongside the moon and stars.
- **Jump-to-date z-index bug**: same stacking issue as the Edit sheet — it was opening behind the Garden page. Fixed the same way.
- **Settings can scroll**: sheets (Settings, Memories, Log Time, etc.) now cap their height and scroll if content is taller than the screen — this became a real bug once the Shop and Decorations moved into Settings and made it much taller.
- **Jump to date, fixed**: native date pickers can't restrict which dates are selectable, so this is now a simple list of only the dates you've actually logged something on — tap one to jump straight there.
- **Bench pose on tap**: now cycles through the poses in a fixed order when you tap the couple, rather than picking randomly (random selection still happens once each time the garden opens).
- **Edit sheet z-index bug**: Edit was opening *behind* the Garden page and behind the Memories list — a real stacking bug, not something you were doing wrong. It now always appears on top regardless of what else is open.

- **Photo viewer, rebuilt**: tapping a photo on a memory (the main thumbnail or any photo in the gallery strip) now opens a proper full-screen viewer that stays open until you tap the ✕ to close it — the previous version had a leftover 1.8-second auto-close timer from an earlier design, which is why it felt like it was closing itself. Swipe left/right to move between all the photos on that entry, with small dots showing your position.
- **Garden always opens to the meadow**: previously, if you'd left an entry's detail view open and then tapped the Garden button again later, it would show that same old entry instead of the garden itself. Now the Garden button always resets to the meadow view.
- **Photo-count indicator, redesigned**: the "+N" dark rectangle on multi-photo entries is now a small soft circular badge with a stacked-photos icon instead of text — same idea, quieter design.

- **Faster loading**: two changes address the "shows empty, then loads" delay on opening the app. First, Firestore now keeps a persistent local cache (in the browser's IndexedDB), so on repeat opens the garden shows what it already has *instantly* while syncing any changes in the background, instead of waiting on a network round-trip first. Second, the service worker now caches the Firebase SDK's own JavaScript files, so they don't get re-downloaded from Google's CDN on every single visit. Actual Firestore *data* still always comes from the network/cache as normal — only the SDK code and the local data cache are affected. This won't speed up the very first time you ever open the app on a given device (nothing to cache yet), but every visit after that should be noticeably quicker. A side benefit of the same change: logging something while offline now queues locally and syncs automatically once you're back online, instead of just failing.
- **Double-submit protection**: a fast double-tap on "Water it," a challenge, or an edit save could previously fire the save twice before the sheet closed, creating a duplicate entry. Those buttons now disable themselves for the moment they're actually saving.
- **Network resilience**: Firestore now auto-detects when a network (some cafe/hotel wifi, certain mobile carriers) blocks its normal connection method and falls back automatically, rather than just failing to sync.

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
- **Living garden**: two butterflies flutter, a bee circles, a rabbit hops across occasionally, and there's a gentle chance of rain each visit — small ambient touches that make opening the garden feel alive rather than static.
- **Bigger Garden Shop**: 10 decorations now (lantern, bench, fairy lights, fountain, wind chime, rainbow, bridge, pond, statue, gazebo) — and buying one now actually places it in the illustrated scene, not just in a list.
- **Date idea suggestions**: if it's been 5+ days since the last entry, a quiet banner on the dashboard suggests something to do — a picnic, mini golf, a cooking class, and more — never a notification, just there if you open the app.
- **Fun Stats**: a real "We've..." screen in Settings — dates logged, flowers grown, photos saved, challenges completed, longest streak, and days together (if you set `RELATIONSHIP_START_DATE` in `firebase-config.js` — **must be in quotes**, e.g. `"2025-12-12"`, not `2025-12-12`; without quotes JavaScript reads it as subtraction instead of a date). If the value isn't a valid quoted date, the app now safely treats it as unset rather than showing a garbage number.
- **Days-together sign**: a little chalkboard-on-a-post in the garden scene showing the same day count, if `RELATIONSHIP_START_DATE` is set.
- **Anniversary celebration**: on the date set in `ANNIVERSARY_MD`, opening the app triggers a full-screen fireworks celebration once for the year, on top of the existing points bonus.
- **Couple bench**: once you buy the bench from the Shop, two small silhouette figures — no faces, just a quiet little scene — appear sitting on it together whenever the garden's open.
- **Full time of day**: the garden now has four real states instead of two — morning (soft light, a gentle dew shimmer over the meadow), afternoon (bees out and about), sunset (warm golden sky and light), and night (moon, stars, and shooting stars) — all based on the real clock.
- **Adopt a pet**: two Pomeranians (brown and white) in the Shop. Once adopted, each wanders back and forth across the garden on its own gentle loop — buy one or both.
- **Remove a decoration**: tap any item in "Your decorations" (now below the garden bed) to remove it, with a full point refund — trying something out and changing your mind costs nothing.
- **Garden page, garden-only**: the Garden page now shows just the illustrated scene and the garden bed (meadow) — nothing else. "Your decorations" and the Garden Shop moved into Settings (⚙️), since they're really account/spending management, not part of looking at the garden itself. Buying something still makes it appear visually in the garden scene, same as before — only *where you manage it from* changed.
- **Months together**: shown on the garden sign — simplified back down to just this one number, calendar-accurate (not days ÷ 30).
- **Pomeranians, sitting**: no longer wandering — both now sit still next to the bench, facing away from the screen (just their back, ears, and curled tail visible), matching the direction the bench silhouettes face.
- **Bench, three poses**: leaning head on shoulder with an arm around, holding hands, and leaning in together — picked at random each time the garden opens, or tap the couple for a new one anytime.
- **Pomeranians**: sit beside the bench (not overlapping it), sized to match the rest of the scene, with rounded ears.
- **Jump to a date**: a small date picker above the garden bed — pick any date and the meadow smoothly scrolls to that entry (or the closest one, if nothing was logged that exact day) and gives it a brief golden pulse so it's easy to spot.
- **Accurate flower count**: the "🌸 grown" number is queried live from Firestore (a real count of every logged entry, backfilled included) rather than a separately-tracked counter — so it can't drift out of sync with what's actually in the garden.
- **Little gardener, two poses**: waits with arms on hips on the idle pot between entries, then appears with a watering can during the bloom animation (now slower — about 4.5 seconds total — so it's actually visible) before stepping back for the flower to open.
- **Settings** (⚙️, top-right of the dashboard): stats, weekly recap, PDF export, data backup, and two toggles — one for the Challenge button, one for the Garden Shop & decorations — in case either isn't being used yet. Both are shared settings, synced to both phones.
- **Memories list**: the 📷 button — the same logged moments as a plain searchable list.
- **"On this day" flashback**: surfaces a memory from exactly a week, a month, or a year ago on the dashboard.
- **Daily challenge**: deterministic by date, so you both see the same prompt automatically. Completing it once per day also blooms a flower and adds 15 points. Edit `DEFAULT_CHALLENGES` in `app.js` to swap in your own.
- **Anniversary bonus**: optional — set `ANNIVERSARY_MD` in `firebase-config.js` to a date like `"08-09"`. On that date each year, a 50-point bonus lands automatically, shown in the Stats sheet.
- **Floating photo dots**: up to 8 recent memory photos float around the dashboard plant, in a fresh random arrangement each time you open the app (stable during that visit, not reshuffling on every screen). Tap one to jump straight to that day's entry in the Garden — which now also scrolls to the top automatically so the entry is immediately visible instead of landing wherever the page happened to be scrolled.
- **Jump-to-date, now visible**: the date picker above the garden bed is a clearly labeled green pill ("📅 Jump to date") instead of a blank white control that was easy to miss.
- **Weekly recap**: in Settings (⚙️, top-right of the dashboard) — logged entries, points earned, and challenges completed in the last 7 days.
- **Settings**: moved to a gear icon in the top-right corner instead of a bottom button, to keep the action bar from getting crowded. Contains stats, the app icon toggle for the Challenge feature (in case you're not using it yet — hides it from the action bar for both of you), PDF export, and the data backup.
- **Little gardener animation**: the plant's grow animation now includes a small character who appears and waters the sprout partway through, then steps back for the bloom.
- **Date ideas / bucket list**: the 💡 button — a shared running list you both add to and check off.
- **Memory search**: filters the Memories list by activity text or notes.
- **Export as PDF**: in the Stats sheet, builds a downloadable keepsake booklet from everything logged.
- **Data backup**: also in Stats — "Backup (JSON)" downloads a complete, unlimited snapshot of everything, unlike the capped live views used elsewhere in the app. "Restore" merges a backup file back in by original ID, so re-importing never duplicates. This is the real safety net; the PDF above is a pretty keepsake, this JSON is what you'd actually use to recover data.
- **Sound & haptics**: a small chime plays on logging, completing a challenge, and buying a decoration (with a subtle vibration on Android; iOS Safari doesn't support vibration, so it's silent-but-fine there).
- **Edit / delete a memory**: each entry in the Memories list has Edit and Delete. Edit now opens a full form — fix the description, adjust the date, or add/remove photos, all without deleting and redoing the entry. Note: changing the date updates the "backfilled" status for consistency, but does *not* retroactively recalculate the streak — streak is only ever computed at the moment something is originally logged. Deleting doesn't subtract the points it already earned — it just removes the record.
- **Welcome screen**: shows once per device on first open, explaining the concept. Stored in the browser's local storage, not synced.

### A note on photo storage
Photos live inside Firestore documents as compressed JPEGs (roughly 40–150 KB each depending on the photo), not in a separate file storage service. That keeps everything on Firestore's free tier with zero billing setup. At that size you could log several thousand photos before approaching Firestore's 1 GB free storage limit — more than enough for a project like this. If you ever want full-resolution photos instead, that would mean switching to Firebase Storage, which requires linking a billing card (Google's free allowance still applies, but the card is mandatory to enable it) — worth asking for if you want to go that route later.

### A note on security
Uses a private "room code" rather than individual logins, to keep setup simple. Private
enough for a personal gift app, not bank-grade — don't put anything in there you'd be
devastated to have exposed if someone guessed the code.

### If you get stuck
Bring the error message or a screenshot back here and I'll debug it with you.
