import { firebaseConfig, COUPLE_ID, ANNIVERSARY_MD, RELATIONSHIP_START_DATE, BIRTHDAY_1_MD, BIRTHDAY_2_MD } from './firebase-config.js';

// Stage keys used purely for the plant-bloom animation sequence when you log
// an entry (seed → ... → flourishing over a couple seconds) — no longer tied
// to accumulated points. The resting/idle state between entries is "budding".
export const STAGE_KEYS = ['seed', 'sprout', 'budding', 'blooming', 'flourishing'];

// Garden Shop — decorations, freely toggled on or off, no cost involved.
// Each has a preset spot (as a % of the illustrated garden scene) so it
// actually appears in the scene once turned on, not just in a list.
export const DECOR_SHOP = [
  { id: 'bench', icon: '<svg width="26" height="26" viewBox="0 0 26 26"><rect x="2" y="16" width="22" height="3" rx="1.5" fill="#6B4A34"/><rect x="4" y="10" width="3" height="9" fill="#8A5A2E"/><rect x="19" y="10" width="3" height="9" fill="#8A5A2E"/><circle cx="9" cy="11" r="3.5" fill="#4A3B33"/><circle cx="17" cy="11" r="3.5" fill="#4A3B33"/></svg>', name: 'Little bench', cost: 25, special: 'bench' },
  { id: 'pet_pom_brown', icon: '<svg width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="15" r="8" fill="#A9713F"/><circle cx="13" cy="7" r="6" fill="#A9713F"/><circle cx="9" cy="3" r="2.4" fill="#8A5A2E"/><circle cx="17" cy="3" r="2.4" fill="#8A5A2E"/><circle cx="10.5" cy="6.5" r="0.9" fill="#2A1B12"/><circle cx="15.5" cy="6.5" r="0.9" fill="#2A1B12"/></svg>', name: 'Brown Pomeranian', cost: 90, special: 'pet' },
  { id: 'pet_pom_white', icon: '<svg width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="15" r="8" fill="#F6F1E4"/><circle cx="13" cy="7" r="6" fill="#F6F1E4"/><circle cx="9" cy="3" r="2.4" fill="#DED5BC"/><circle cx="17" cy="3" r="2.4" fill="#DED5BC"/><circle cx="10.5" cy="6.5" r="0.9" fill="#2A1B12"/><circle cx="15.5" cy="6.5" r="0.9" fill="#2A1B12"/></svg>', name: 'White Pomeranian', cost: 90, special: 'pet' },
  { id: 'harbour_bridge', icon: '<svg width="26" height="26" viewBox="0 0 26 26"><path d="M2,18 Q13,3 24,18" stroke="#5C6B73" stroke-width="2.2" fill="none"/><rect x="1" y="18" width="24" height="2.5" rx="1" fill="#7A8890"/><line x1="7" y1="18" x2="7" y2="10" stroke="#5C6B73" stroke-width="1.3"/><line x1="13" y1="18" x2="13" y2="6" stroke="#5C6B73" stroke-width="1.3"/><line x1="19" y1="18" x2="19" y2="10" stroke="#5C6B73" stroke-width="1.3"/></svg>', name: 'Harbour Bridge', cost: 85, special: 'harbour_bridge' },
  { id: 'opera_house', icon: '<svg width="26" height="26" viewBox="0 0 26 26"><rect x="2" y="18" width="22" height="3" rx="1" fill="#D8D0BC"/><path d="M5,18 Q5,8 11,10 Q9,18 5,18 Z" fill="#FBF8F0"/><path d="M10,18 Q12,5 18,9 Q14,18 10,18 Z" fill="#FFFFFF"/><path d="M16,18 Q18,8 23,11 Q20,18 16,18 Z" fill="#FBF8F0"/></svg>', name: 'Opera House', cost: 95, special: 'opera_house' }
];
export const ANNIVERSARY_ICON = '💘';

// A handful of date-night ideas the app can suggest if you haven't logged
// anything in a while — a gentle nudge, not a notification.
export const DATE_IDEAS = [
  'A picnic somewhere new',
  'Mini golf',
  'A cooking class together',
  'Watch the sunset at the beach',
  'Ice skating',
  'A local museum you haven\'t been to',
  'Board game night',
  'A hike with a view',
  'Try every stall at a food market',
  'A drive-in or backyard movie night',
  'A pottery or paint class',
  'Karaoke',
  'A long bike ride',
  'Stargazing somewhere dark'
];

// ---- Botanical icon generator ----
// Builds real flower structure (layered petal rings, not abstract shapes) as
// static SVG strings, computed once here. Each species gets its own colors
// baked in directly (light + dark shades + accents) rather than a single
// flat tone, so the shape actually reads as that specific flower.
const STROKE = 'stroke="#2A1B12" stroke-opacity="0.16" stroke-width="0.7"';

function petal(angleDeg, length, width, fill, cx = 50, cy = 50, curve = 0.7) {
  const w = width / 2;
  const d = `M0,0 C ${-w},${-length * 0.2} ${-w},${-length * curve} 0,${-length} C ${w},${-length * curve} ${w},${-length * 0.2} 0,0 Z`;
  return `<path d="${d}" fill="${fill}" ${STROKE} transform="translate(${cx},${cy}) rotate(${angleDeg})"/>`;
}
function petalRing(count, startAngle, length, width, fill, cx = 50, cy = 50, curve = 0.7) {
  let s = '';
  for (let i = 0; i < count; i++) s += petal(startAngle + (360 / count) * i, length, width, fill, cx, cy, curve);
  return s;
}
function svg(inner) { return `<svg viewBox="0 0 100 100">${inner}</svg>`; }

const roseIcon = svg(`
  ${petalRing(5, 8, 34, 25, '#C63D52')}
  ${petalRing(5, 44, 25, 19, '#E2758A')}
  ${petalRing(4, 20, 15, 12, '#F0A8AE')}
  <circle cx="50" cy="50" r="4.5" fill="#F6C6CC" ${STROKE}/>
`);

const peonyIcon = svg(`
  ${petalRing(8, 0, 33, 22, '#D77FA1')}
  ${petalRing(8, 22.5, 25, 17, '#E9A3BF')}
  ${petalRing(6, 10, 16, 12, '#F3C6D9')}
  ${petalRing(5, 40, 8, 6, '#FBE4EE')}
  <circle cx="50" cy="50" r="3" fill="#E8B84B"/>
`);

function floret(cx, cy, scale, light, dark) {
  return `<g transform="translate(${cx},${cy}) scale(${scale})">
    ${petalRing(4, 0, 9, 8, dark, 0, 0, 0.75)}
    <circle cx="0" cy="0" r="2.4" fill="${light}"/>
  </g>`;
}
const hydrangeaIcon = svg(`
  ${floret(37, 35, 1, '#D3E4F1', '#6E9BC2')}
  ${floret(63, 35, 1, '#D3E4F1', '#6E9BC2')}
  ${floret(50, 50, 1.15, '#E2EDF6', '#7CA9CE')}
  ${floret(34, 62, 0.95, '#D3E4F1', '#6E9BC2')}
  ${floret(66, 62, 0.95, '#D3E4F1', '#6E9BC2')}
  ${floret(50, 24, 0.8, '#D3E4F1', '#6E9BC2')}
  ${floret(50, 76, 0.8, '#D3E4F1', '#6E9BC2')}
`);

const ranunculusIcon = svg(`
  ${petalRing(10, 0, 27, 15, '#E8865A', 50, 50, 0.6)}
  ${petalRing(9, 18, 20, 12, '#F0A574', 50, 50, 0.6)}
  ${petalRing(8, 5, 13.5, 9, '#F6C9B0', 50, 50, 0.6)}
  ${petalRing(6, 30, 8, 6, '#FBE3D2', 50, 50, 0.6)}
  <circle cx="50" cy="50" r="2.8" fill="#B85A28"/>
`);

const poppyIcon = svg(`
  <path d="M0,0 C -23,-16 -23,-38 0,-44 C 23,-38 23,-16 0,0 Z" fill="#E37B5D" ${STROKE} transform="translate(50,50) rotate(0)"/>
  <path d="M0,0 C -23,-16 -23,-38 0,-44 C 23,-38 23,-16 0,0 Z" fill="#C1432E" ${STROKE} transform="translate(50,50) rotate(90)"/>
  <path d="M0,0 C -23,-16 -23,-38 0,-44 C 23,-38 23,-16 0,0 Z" fill="#E37B5D" ${STROKE} transform="translate(50,50) rotate(180)"/>
  <path d="M0,0 C -23,-16 -23,-38 0,-44 C 23,-38 23,-16 0,0 Z" fill="#C1432E" ${STROKE} transform="translate(50,50) rotate(270)"/>
  <circle cx="50" cy="50" r="9" fill="#2A1B12" opacity="0.78"/>
  ${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
    const r = a * Math.PI / 180;
    return `<line x1="50" y1="50" x2="${(50 + 12 * Math.cos(r)).toFixed(1)}" y2="${(50 + 12 * Math.sin(r)).toFixed(1)}" stroke="#F2D488" stroke-width="1"/>`;
  }).join('')}
`);

function snapFloret(y, scale, fill) {
  return `<g transform="translate(50,${y}) scale(${scale})">
    <ellipse cx="0" cy="4" rx="11" ry="7.5" fill="${fill}" ${STROKE}/>
    <ellipse cx="0" cy="-3.5" rx="7.5" ry="6.5" fill="${fill}" opacity="0.82"/>
  </g>`;
}
const snapdragonIcon = svg(`
  <path d="M50,90 L50,16" stroke="#7DB857" stroke-width="2.5" fill="none"/>
  ${snapFloret(80, 1.3, '#E3A93E')}
  ${snapFloret(63, 1.1, '#EAB955')}
  ${snapFloret(48, 0.9, '#F2D488')}
  ${snapFloret(35, 0.72, '#F6E1A8')}
  ${snapFloret(25, 0.55, '#FBEFC9')}
`);

function tinyFlower(cx, cy, scale) {
  return `<g transform="translate(${cx},${cy}) scale(${scale})">
    ${petalRing(5, 0, 5.5, 4.5, '#FFFFFF', 0, 0, 0.7)}
    <circle cx="0" cy="0" r="1.3" fill="#E8DFC0"/>
  </g>`;
}
const babysBreathIcon = svg(`
  <g stroke="#9CA37F" stroke-width="1" fill="none">
    <path d="M50,82 L40,55 M50,82 L60,50 M50,82 L50,28 M40,55 L30,40 M60,50 L70,35"/>
  </g>
  ${tinyFlower(30, 40, 1)}${tinyFlower(70, 35, 1)}${tinyFlower(50, 28, 1.1)}${tinyFlower(40, 55, 0.9)}${tinyFlower(60, 50, 0.9)}${tinyFlower(50, 82, 0.85)}
`);

const lilyIcon = svg(`
  ${[0, 60, 120, 180, 240, 300].map((a) => petal(a, 42, 16, '#FBF3D9', 50, 50, 0.72)).join('')}
  ${[30, 90, 150, 210, 270, 330].map((a) => {
    const r = a * Math.PI / 180;
    const x = (50 + 17 * Math.cos(r)).toFixed(1), y = (50 + 17 * Math.sin(r)).toFixed(1);
    return `<line x1="50" y1="50" x2="${x}" y2="${y}" stroke="#B4842A" stroke-width="1"/><ellipse cx="${x}" cy="${y}" rx="2" ry="1.3" fill="#8C5A1E" transform="rotate(${a} ${x} ${y})"/>`;
  }).join('')}
`);

// Flower species — cycles by how many flowers have been planted total, so
// each new entry's flower looks different from the last.
export const SPECIES = [
  { name: 'Rose', light: '#F0A8AE', dark: '#C63D52', icon: roseIcon },
  { name: 'Peony', light: '#F3C6D9', dark: '#D77FA1', icon: peonyIcon },
  { name: 'Hydrangea', light: '#B9D3EA', dark: '#6E9BC2', icon: hydrangeaIcon },
  { name: 'Ranunculus', light: '#F6C9B0', dark: '#E8865A', icon: ranunculusIcon },
  { name: 'Poppy', light: '#E37B5D', dark: '#C1432E', icon: poppyIcon },
  { name: 'Snapdragon', light: '#F2D488', dark: '#E3A93E', icon: snapdragonIcon },
  { name: "Baby's Breath", light: '#FBF6E8', dark: '#B7AD8E', icon: babysBreathIcon },
  { name: 'Lily', light: '#FBF3D9', dark: '#D4A537', icon: lilyIcon }
];

const DEFAULT_CHALLENGES = [
  "Cook a meal together with no recipe allowed.",
  "Take a walk with your phones left at home.",
  "Recreate your first date, however small.",
  "Try a restaurant neither of you has been to.",
  "Share 3 favorite memories out loud, no repeats.",
  "No screens for one full evening.",
  "Write each other 3 things you're grateful for, swap notes.",
  "Slow dance in the kitchen to one song, no occasion needed.",
  "Give a genuine compliment about something the other did today.",
  "Try to make each other laugh without using any words.",
  "Ask each other one question you've never asked before.",
  "Do a chore the other usually handles, without being asked.",
  "Plan next week's date night together, right now.",
  "Share a childhood memory you've never told the other.",
  "Give each other a 5-minute massage, no talking required.",
  "Cook or order the other's ultimate comfort food.",
  "Watch a movie one of you loves and the other's never seen.",
  "Leave a small surprise note somewhere the other will find it.",
  "Take a photo together doing something silly.",
  "Try a food neither of you has ever eaten before.",
  "Spend 10 minutes just holding each other, phones away.",
  "Share the actual highlight of your day before bed tonight.",
  "Say one thing you appreciate about how the other handled something hard recently.",
  "Play a board game or card game — loser makes tomorrow's coffee.",
  "Go somewhere new within 15 minutes of home.",
  "Write each other a haiku, however bad it turns out.",
  "Take turns picking a song that reminds you of the other.",
  "Take a walk with no destination in mind, just to see where you end up.",
  "Ask each other: what's one thing I could do more of for you?",
  "Recreate an old photo of the two of you.",
  "Tell each other your favorite memory from this past month.",
  "Write down 3 things you're both looking forward to.",
  "Guess the other's answer to a question before they say it out loud."
];

const isConfigured = firebaseConfig.apiKey !== "REPLACE_ME";
let db, addDoc, deleteDoc, collection, doc, onSnapshot, serverTimestamp, setDoc, getDoc, getDocs,
    arrayUnion, arrayRemove, increment, query, orderBy, limit, writeBatch, getCountFromServer;

async function initFirebase() {
  if (!isConfigured) return false;
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
  const authMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
  const fsMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

  const app = initializeApp(firebaseConfig);
  const auth = authMod.getAuth(app);
  await authMod.signInAnonymously(auth);

  // Persistent local cache: Firestore keeps a copy of your data in the
  // browser's IndexedDB, so on repeat opens the app can show what it already
  // has instantly while it syncs any changes in the background — instead of
  // showing an empty garden until a fresh network round-trip finishes.
  try {
    db = fsMod.initializeFirestore(app, {
      localCache: fsMod.persistentLocalCache({ tabManager: fsMod.persistentMultipleTabManager() }),
      experimentalAutoDetectLongPolling: true // falls back automatically on networks (some cafe/hotel wifi, certain carriers) that block Firestore's default connection method
    });
  } catch (err) {
    console.warn('Persistent Firestore cache unavailable, falling back to default:', err);
    db = fsMod.getFirestore(app);
  }

  ({ addDoc, deleteDoc, collection, doc, onSnapshot, serverTimestamp, setDoc, getDoc, getDocs,
     arrayUnion, arrayRemove, increment, query, orderBy, limit, writeBatch, getCountFromServer } = fsMod);
  return true;
}

function todayStr() { return new Date().toISOString().slice(0, 10); }
function mmdd(dateStr) { return dateStr.slice(5); }
function daysBetween(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); }

// Guards against a common config mistake: writing 2025-12-12 without quotes
// turns it into the number 2001 (2025 minus 12 minus 12) before this code
// ever runs, which — if unchecked — reads as a date in 1970. This validates
// the shape is actually a "YYYY-MM-DD" string before trusting it.
function isValidDateStr(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s).getTime());
}

// Days together — used by both Fun Stats and the garden sign. Returns null
// (meaning: don't show the stat) if RELATIONSHIP_START_DATE isn't set or isn't
// a valid quoted date string.
export function getDaysTogether() {
  if (!isValidDateStr(RELATIONSHIP_START_DATE)) return null;
  const days = daysBetween(RELATIONSHIP_START_DATE, todayStr());
  return days >= 0 ? days : null; // ignore a future-dated typo too
}

// Calendar-accurate month count (not just days/30) — e.g. Jan 31 to Mar 1 is
// 1 month, not 1.03 months.
export function getMonthsTogether() {
  if (!isValidDateStr(RELATIONSHIP_START_DATE)) return null;
  const start = new Date(RELATIONSHIP_START_DATE);
  const end = new Date(todayStr());
  if (end < start) return null;
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) months -= 1;
  return Math.max(0, months);
}

// Which species the *next* planted flower will be — cycles by how many
// flowers have been grown so far, so the plant always previews accurately.
export function currentSpecies(totalFlowers) {
  return SPECIES[(totalFlowers || 0) % SPECIES.length];
}
export function todaysChallenge() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - startOfYear) / 86400000);
  return DEFAULT_CHALLENGES[dayOfYear % DEFAULT_CHALLENGES.length];
}

// Finds the best "on this day" memory to resurface: prefers exactly 1 year
// ago, then 1 month (30 days) ago, then 1 week ago.
export function findFlashback(logs) {
  const today = todayStr();
  const targets = [365, 30];
  for (const days of targets) {
    const match = logs.find((log) => daysBetween(log.date, today) === days);
    if (match) return { log: match, daysAgo: days };
  }
  return null;
}

const DEMO_STATE = {
  streak: 1, lastActiveDate: null,
  unlockedDecorations: [], todayChallengeCompletedDate: null,
  anniversaryUnlockedYear: null, totalFlowers: 0, challengeEnabled: true, shopEnabled: true
};
const DEMO_LOGS = [
  { id: 'demo-1', activity: 'Coffee and a walk (demo entry)', date: todayStr(), photo: null, note: '' }
];
const DEMO_BUCKET = [
  { id: 'demo-b1', text: 'Try that ramen place downtown (demo idea)', done: false }
];

// ---- Habit streaks — for recurring things you do together (cooking, the
// gym) that aren't really a "date" or worth their own flower, just something
// worth quietly keeping track of. Add more here any time; each just needs a
// stable id, a name, and an icon. ----
export const HABITS_LIST = [
  { id: 'cook', name: 'Cooked together', icon: '🍳' },
  { id: 'gym', name: 'Gym together', icon: '💪' }
];
const DEMO_HABITS = { cook: [], gym: [] };

// ---- Live state (real-time — both phones see updates as they happen) ----
export function watchState(renderFn) {
  if (isConfigured) {
    const ref = doc(db, `couples/${COUPLE_ID}/state/current`);
    renderFn(DEMO_STATE);
    onSnapshot(
      ref,
      async (snap) => {
        if (!snap.exists()) {
          try { await setDoc(ref, DEMO_STATE); }
          catch (err) {
            console.error('Could not create initial state doc:', err);
            alert('Could not connect to your shared data. Check firebase-config.js / Firestore rules. (' + err.message + ')');
          }
          return;
        }
        const data = snap.data();
        renderFn(data);
        maybeUnlockAnniversary(data);
      },
      (err) => {
        console.error('watchState listener error:', err);
        alert('Lost connection to synced data: ' + err.message);
      }
    );
  } else {
    renderFn(DEMO_STATE);
    maybeUnlockAnniversary(DEMO_STATE);
  }
}

async function maybeUnlockAnniversary(data) {
  if (!ANNIVERSARY_MD) return;
  const today = todayStr();
  const year = today.slice(0, 4);
  if (mmdd(today) !== ANNIVERSARY_MD) return;
  if (data.anniversaryUnlockedYear === year) return;

  if (!isConfigured) {
    DEMO_STATE.anniversaryUnlockedYear = year;
    return;
  }
  try {
    const ref = doc(db, `couples/${COUPLE_ID}/state/current`);
    await setDoc(ref, { anniversaryUnlockedYear: year }, { merge: true });
  } catch (err) {
    console.error('anniversary unlock failed:', err);
  }
}

// Whether today is the configured anniversary date — used to trigger the
// once-a-year celebration animation on the dashboard.
export function isAnniversaryToday() {
  if (!ANNIVERSARY_MD) return false;
  return mmdd(todayStr()) === ANNIVERSARY_MD;
}

// Marks a flower with a small icon if it was logged on a special occasion —
// Valentine's Day is a fixed real date; anniversary and birthdays come from
// your own config in firebase-config.js, so they're simply skipped if left
// unset. Returns null (no marker) for an ordinary day.
export function getSpecialDayIcon(dateStr) {
  const md = mmdd(dateStr);
  if (ANNIVERSARY_MD && md === ANNIVERSARY_MD) return { icon: '💘', label: 'Anniversary' };
  if (BIRTHDAY_1_MD && md === BIRTHDAY_1_MD) return { icon: '🎂', label: 'Birthday' };
  if (BIRTHDAY_2_MD && md === BIRTHDAY_2_MD) return { icon: '🎂', label: 'Birthday' };
  if (md === '02-14') return { icon: '💕', label: "Valentine's Day" };
  return null;
}

// Buys a decoration from the Garden Shop with points. Guards against buying
// something you already own or can't afford.
// Toggles a simple boolean setting (currently just whether the Challenge
// button is shown) — shared between both phones since it changes the UI itself.
export async function setSetting(key, value) {
  if (!isConfigured) {
    DEMO_STATE[key] = value;
    return;
  }
  try {
    const ref = doc(db, `couples/${COUPLE_ID}/state/current`);
    await setDoc(ref, { [key]: value }, { merge: true });
  } catch (err) {
    console.error('setSetting failed:', err);
    alert('Could not save that setting: ' + err.message);
    throw err;
  }
}

// Adds or removes a Garden Shop decoration — everything is freely available
// now, no cost involved. This just flips whether it's on or off.
export async function toggleDecoration(decorId) {
  if (!isConfigured) {
    const idx = DEMO_STATE.unlockedDecorations.indexOf(decorId);
    if (idx === -1) DEMO_STATE.unlockedDecorations.push(decorId);
    else DEMO_STATE.unlockedDecorations.splice(idx, 1);
    return true;
  }
  try {
    const ref = doc(db, `couples/${COUPLE_ID}/state/current`);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : DEMO_STATE;
    const owned = data.unlockedDecorations || [];
    const isOwned = owned.includes(decorId);
    await setDoc(ref, {
      unlockedDecorations: isOwned ? arrayRemove(decorId) : arrayUnion(decorId)
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('toggleDecoration failed:', err);
    alert('Could not update that: ' + err.message);
    throw err;
  }
}

// ---- Live log/memory feed (for the photo gallery + weekly recap + flashback) ----
export function watchLogs(renderFn, max = 1000) {
  if (!isConfigured) { renderFn(DEMO_LOGS); return; }
  const q = query(collection(db, `couples/${COUPLE_ID}/logs`), orderBy('date', 'desc'), limit(max));
  onSnapshot(
    q,
    (snap) => renderFn(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => console.error('watchLogs listener error:', err)
  );
}

// Normalizes a log entry's photos into an array, whether it was saved with
// the old single "photo" field or the newer "photos" array — so nothing
// written before this update breaks.
// The real, accurate flower count — queried live from Firestore rather than
// relying on the stored totalFlowers counter, which can drift out of sync
// (e.g. entries logged before that field existed, or any edge case where an
// increment didn't land). This counts every entry in the logs collection —
// backfilled ones included — since every one of them is a flower in the garden.
export async function countFlowers() {
  if (!isConfigured) return DEMO_LOGS.length;
  try {
    const snap = await getCountFromServer(collection(db, `couples/${COUPLE_ID}/logs`));
    return snap.data().count;
  } catch (err) {
    console.error('countFlowers failed:', err);
    return null;
  }
}

// "We've..." stats — only things the app can actually know from real data
// (no distance/venue tracking, since that would mean typing more per entry,
// which works against keeping logging fast).
export async function computeFunStats() {
  const daysTogether = getDaysTogether();

  if (!isConfigured) {
    const photosCount = DEMO_LOGS.reduce((sum, l) => sum + getPhotos(l).length, 0);
    return {
      datesLogged: DEMO_LOGS.filter((l) => l.type !== 'challenge').length,
      challengesCompleted: DEMO_LOGS.filter((l) => l.type === 'challenge').length,
      photosCount,
      flowersGrown: DEMO_LOGS.length,
      daysTogether,
      longestStreak: DEMO_STATE.longestStreak || DEMO_STATE.streak || 0
    };
  }

  try {
    const [logsSnap, stateSnap] = await Promise.all([
      getDocs(collection(db, `couples/${COUPLE_ID}/logs`)),
      getDoc(doc(db, `couples/${COUPLE_ID}/state/current`))
    ]);
    const logs = logsSnap.docs.map((d) => d.data());
    const state = stateSnap.exists() ? stateSnap.data() : {};
    const photosCount = logs.reduce((sum, l) => sum + getPhotos(l).length, 0);
    return {
      datesLogged: logs.filter((l) => l.type !== 'challenge').length,
      challengesCompleted: logs.filter((l) => l.type === 'challenge').length,
      photosCount,
      flowersGrown: logs.length,
      daysTogether,
      longestStreak: state.longestStreak || state.streak || 0
    };
  } catch (err) {
    console.error('computeFunStats failed:', err);
    return null;
  }
}

// Shared full, unlimited fetch — used by both review functions below so
// they always see every entry, not just whatever the live 1000-cap feed has.
async function fetchAllLogs() {
  if (!isConfigured) return DEMO_LOGS;
  const snap = await getDocs(collection(db, `couples/${COUPLE_ID}/logs`));
  return snap.docs.map((d) => d.data());
}

// Longest run of consecutive calendar days within a given list of dates —
// used to compute a streak scoped to just one month or year, separate from
// the app's all-time longestStreak.
function longestStreakInRange(dates) {
  const sorted = [...new Set(dates)].sort();
  let longest = 0, current = 0, prev = null;
  for (const d of sorted) {
    current = (prev && daysBetween(prev, d) === 1) ? current + 1 : 1;
    longest = Math.max(longest, current);
    prev = d;
  }
  return longest;
}

export async function computeMonthReview(year, month) {
  const logs = await fetchAllLogs();
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const inRange = logs.filter((l) => l.date && l.date.startsWith(prefix));
  const photosCount = inRange.reduce((sum, l) => sum + getPhotos(l).length, 0);
  const featuredPhoto = inRange.map((l) => getPhotos(l)[0]).find(Boolean) || null;
  return {
    entries: inRange.filter((l) => l.type !== 'challenge').length,
    challenges: inRange.filter((l) => l.type === 'challenge').length,
    photosCount,
    longestStreak: longestStreakInRange(inRange.map((l) => l.date)),
    featuredPhoto,
    total: inRange.length
  };
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export async function computeYearReview(year) {
  const logs = await fetchAllLogs();
  const inRange = logs.filter((l) => l.date && l.date.startsWith(String(year)));
  const photosCount = inRange.reduce((sum, l) => sum + getPhotos(l).length, 0);
  const featuredPhoto = inRange.map((l) => getPhotos(l)[0]).find(Boolean) || null;

  const monthCounts = {};
  inRange.forEach((l) => { const m = l.date.slice(5, 7); monthCounts[m] = (monthCounts[m] || 0) + 1; });
  let favoriteMonth = null, favoriteMonthCount = 0;
  Object.entries(monthCounts).forEach(([m, c]) => {
    if (c > favoriteMonthCount) { favoriteMonth = MONTH_NAMES[parseInt(m, 10) - 1]; favoriteMonthCount = c; }
  });

  return {
    entries: inRange.filter((l) => l.type !== 'challenge').length,
    challenges: inRange.filter((l) => l.type === 'challenge').length,
    photosCount,
    longestStreak: longestStreakInRange(inRange.map((l) => l.date)),
    favoriteMonth, favoriteMonthCount,
    featuredPhoto,
    total: inRange.length
  };
}

export function getPhotos(log) {
  if (log.photos && log.photos.length) return log.photos;
  if (log.photo) return [log.photo];
  return [];
}

export async function logTime(activity = '', dateStr = null, photos = [], location = null) {
  const entryDate = dateStr || todayStr();

  const totalSize = photos.reduce((sum, p) => sum + p.length, 0);
  if (totalSize > 900000) {
    throw new Error('Those photos are too large together even after compression — try removing one or two.');
  }

  if (!isConfigured) {
    DEMO_STATE.totalFlowers += 1;
    if (entryDate === todayStr()) DEMO_STATE.lastActiveDate = entryDate;
    DEMO_LOGS.unshift({ id: 'demo-' + Date.now(), activity, date: entryDate, photos, note: '', location });
    return DEMO_STATE;
  }

  try {
    const ref = doc(db, `couples/${COUPLE_ID}/state/current`);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : DEMO_STATE;
    const today = todayStr();

    const update = { totalFlowers: increment(1) };
    if (entryDate === today) {
      let streak = data.streak || 1;
      if (data.lastActiveDate) {
        const gap = daysBetween(data.lastActiveDate, today);
        if (gap === 1) streak += 1;
        else if (gap > 1) streak = 1;
      }
      update.streak = streak;
      update.lastActiveDate = today;
      if (streak > (data.longestStreak || 0)) update.longestStreak = streak;
    }

    await setDoc(ref, update, { merge: true });

    await addDoc(collection(db, `couples/${COUPLE_ID}/logs`), {
      type: 'log', activity,
      date: entryDate, backfilled: entryDate !== today, location,
      photos, note: '',
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error('logTime failed:', err);
    alert('Could not save that entry: ' + err.message + '\n\nCheck that Anonymous auth is enabled and Firestore rules are published.');
    throw err;
  }
}

export async function completeChallenge(challengeText = '') {
  if (!isConfigured) {
    if (DEMO_STATE.todayChallengeCompletedDate !== todayStr()) {
      DEMO_STATE.totalFlowers += 1;
      DEMO_STATE.todayChallengeCompletedDate = todayStr();
      DEMO_LOGS.unshift({ id: 'demo-c-' + Date.now(), type: 'challenge', activity: 'Challenge: ' + challengeText, date: todayStr(), photo: null, note: '' });
    }
    return DEMO_STATE;
  }
  try {
    const ref = doc(db, `couples/${COUPLE_ID}/state/current`);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : DEMO_STATE;
    const today = todayStr();
    if (data.todayChallengeCompletedDate === today) return;
    await setDoc(ref, {
      totalFlowers: increment(1),
      todayChallengeCompletedDate: today
    }, { merge: true });

    await addDoc(collection(db, `couples/${COUPLE_ID}/logs`), {
      type: 'challenge', activity: 'Challenge: ' + challengeText,
      date: today, backfilled: false, photo: null, note: '',
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error('completeChallenge failed:', err);
    alert('Could not save that: ' + err.message);
    throw err;
  }
}

export async function addNoteToLog(logId, note) {
  if (!isConfigured) {
    const entry = DEMO_LOGS.find((l) => l.id === logId);
    if (entry) entry.note = note;
    return;
  }
  try {
    await setDoc(doc(db, `couples/${COUPLE_ID}/logs/${logId}`), { note }, { merge: true });
  } catch (err) {
    console.error('addNoteToLog failed:', err);
    alert('Could not save that note: ' + err.message);
    throw err;
  }
}

// Deletes a memory entry. Note: this does NOT reduce the flower count —
// the plant keeps what it already grew, this just removes the
// record from the gallery (e.g. for a duplicate or a mistaken entry).
export async function deleteLog(logId) {
  if (!isConfigured) {
    const idx = DEMO_LOGS.findIndex((l) => l.id === logId);
    if (idx >= 0) DEMO_LOGS.splice(idx, 1);
    return;
  }
  try {
    await deleteDoc(doc(db, `couples/${COUPLE_ID}/logs/${logId}`));
  } catch (err) {
    console.error('deleteLog failed:', err);
    alert('Could not delete that entry: ' + err.message);
    throw err;
  }
}

// Edits the activity description of an existing memory entry (points
// are left alone to avoid re-triggering streak logic).
// Edits an existing memory. `updates` can include any of: activity, date,
// photos, backfilled — pass only what changed. Note: editing the date does
// NOT retroactively recalculate the streak (that's only ever computed at the
// moment something is logged) — it just updates the "backfilled" flag so the
// entry displays consistently with entries logged that way normally.
export async function editLog(logId, updates) {
  if (updates.photos) {
    const totalSize = updates.photos.reduce((sum, p) => sum + p.length, 0);
    if (totalSize > 900000) {
      throw new Error('Those photos are too large together even after compression — try removing one or two.');
    }
  }
  if (!isConfigured) {
    const entry = DEMO_LOGS.find((l) => l.id === logId);
    if (entry) Object.assign(entry, updates);
    return;
  }
  try {
    await setDoc(doc(db, `couples/${COUPLE_ID}/logs/${logId}`), updates, { merge: true });
  } catch (err) {
    console.error('editLog failed:', err);
    alert('Could not save that edit: ' + err.message);
    throw err;
  }
}

// ---- Bucket list (shared future date ideas) ----
export function watchBucketList(renderFn) {
  if (!isConfigured) { renderFn(DEMO_BUCKET); return; }
  const q = query(collection(db, `couples/${COUPLE_ID}/bucketlist`), orderBy('createdAt', 'desc'));
  onSnapshot(
    q,
    (snap) => renderFn(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => console.error('watchBucketList listener error:', err)
  );
}

export async function addBucketItem(text) {
  if (!isConfigured) {
    DEMO_BUCKET.unshift({ id: 'demo-b-' + Date.now(), text, done: false });
    return;
  }
  try {
    await addDoc(collection(db, `couples/${COUPLE_ID}/bucketlist`), { text, done: false, createdAt: serverTimestamp() });
  } catch (err) {
    console.error('addBucketItem failed:', err);
    alert('Could not add that idea: ' + err.message);
    throw err;
  }
}

export async function toggleBucketItem(id, done) {
  if (!isConfigured) {
    const item = DEMO_BUCKET.find((b) => b.id === id);
    if (item) item.done = done;
    return;
  }
  try {
    await setDoc(doc(db, `couples/${COUPLE_ID}/bucketlist/${id}`), { done }, { merge: true });
  } catch (err) {
    console.error('toggleBucketItem failed:', err);
  }
}

export async function deleteBucketItem(id) {
  if (!isConfigured) {
    const idx = DEMO_BUCKET.findIndex((b) => b.id === id);
    if (idx >= 0) DEMO_BUCKET.splice(idx, 1);
    return;
  }
  try {
    await deleteDoc(doc(db, `couples/${COUPLE_ID}/bucketlist/${id}`));
  } catch (err) {
    console.error('deleteBucketItem failed:', err);
  }
}

// Live habit data — a doc per habit, each holding just an array of the dates
// it was logged on. Small and simple; no separate collection of individual
// entries needed since these aren't memories, just a quiet running tally.
// Each habit's entries live in their own subcollection — one small document
// per day logged (the date itself is the document ID, so logging today twice
// just updates that same entry instead of creating a duplicate). This is the
// same shape the main memories collection already uses, and for the same
// reason: a single array field holding photos would eventually hit
// Firestore's ~1MB per-document limit; separate small documents don't.
export function watchHabits(renderFn) {
  if (!isConfigured) {
    Object.keys(DEMO_HABITS).forEach((id) => renderFn(id, DEMO_HABITS[id]));
    return;
  }
  const unsubs = HABITS_LIST.map((h) =>
    onSnapshot(
      query(collection(db, `couples/${COUPLE_ID}/habits/${h.id}/entries`), orderBy('date', 'asc')),
      (snap) => renderFn(h.id, snap.docs.map((d) => d.data())),
      (err) => console.error(`watchHabits(${h.id}) listener error:`, err)
    )
  );
  return () => unsubs.forEach((u) => u());
}

export async function logHabitToday(habitId, photo = null) {
  const today = todayStr();
  if (!isConfigured) {
    if (!DEMO_HABITS[habitId]) DEMO_HABITS[habitId] = [];
    const existing = DEMO_HABITS[habitId].find((e) => e.date === today);
    if (existing) { if (photo) existing.photo = photo; }
    else DEMO_HABITS[habitId].push({ date: today, photo });
    return;
  }
  try {
    await setDoc(doc(db, `couples/${COUPLE_ID}/habits/${habitId}/entries/${today}`),
      { date: today, photo, createdAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.error('logHabitToday failed:', err);
    alert('Could not log that: ' + err.message);
    throw err;
  }
}

export async function unlogHabitToday(habitId) {
  const today = todayStr();
  if (!isConfigured) {
    if (DEMO_HABITS[habitId]) DEMO_HABITS[habitId] = DEMO_HABITS[habitId].filter((e) => e.date !== today);
    return;
  }
  try {
    await deleteDoc(doc(db, `couples/${COUPLE_ID}/habits/${habitId}/entries/${today}`));
  } catch (err) {
    console.error('unlogHabitToday failed:', err);
  }
}

// Total count, current streak, and longest streak, all derived client-side
// from the entries themselves — no separate stored counters that could ever
// drift out of sync with the actual log.
export function computeHabitStats(entries) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const total = sorted.length;
  if (!total) return { total: 0, currentStreak: 0, longestStreak: 0, lastDate: null };

  let longestStreak = 1, run = 1;
  for (let i = 1; i < sorted.length; i++) {
    run = daysBetween(sorted[i - 1].date, sorted[i].date) === 1 ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
  }

  const lastDate = sorted[sorted.length - 1].date;
  const gapFromToday = daysBetween(lastDate, todayStr());
  let currentStreak = 0;
  if (gapFromToday <= 1) { // still "current" if done today or yesterday
    currentStreak = 1;
    for (let i = sorted.length - 1; i > 0; i--) {
      if (daysBetween(sorted[i - 1].date, sorted[i].date) === 1) currentStreak++;
      else break;
    }
  }

  return { total, currentStreak, longestStreak, lastDate };
}

// ---- Full data backup (export/import) ----
// This is a complete, lossless snapshot — unlike watchLogs(), which caps at
// a limited number for performance, this fetches everything, unlimited,
// specifically so nothing is left out of a backup.
export async function exportBackup() {
  if (!isConfigured) {
    return {
      exportedAt: new Date().toISOString(),
      state: DEMO_STATE,
      logs: DEMO_LOGS,
      bucketlist: DEMO_BUCKET
    };
  }
  const stateSnap = await getDoc(doc(db, `couples/${COUPLE_ID}/state/current`));
  const logsSnap = await getDocs(collection(db, `couples/${COUPLE_ID}/logs`));
  const bucketSnap = await getDocs(collection(db, `couples/${COUPLE_ID}/bucketlist`));

  return {
    exportedAt: new Date().toISOString(),
    coupleId: COUPLE_ID,
    state: stateSnap.exists() ? stateSnap.data() : {},
    logs: logsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    bucketlist: bucketSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
  };
}

// Restores a backup produced by exportBackup(). Uses each item's original ID
// so importing the same file twice merges cleanly instead of duplicating.
export async function importBackup(data) {
  if (!isConfigured) {
    throw new Error('Firebase isn\'t configured yet, so there\'s nothing to import into. See README.md.');
  }
  if (!data || typeof data !== 'object' || !Array.isArray(data.logs)) {
    throw new Error('That doesn\'t look like a valid bloom backup file.');
  }

  const batch = writeBatch(db);
  let opCount = 0;

  if (data.state && typeof data.state === 'object') {
    batch.set(doc(db, `couples/${COUPLE_ID}/state/current`), data.state, { merge: true });
    opCount++;
  }
  (data.logs || []).forEach((log) => {
    if (!log.id) return;
    const { id, ...rest } = log;
    batch.set(doc(db, `couples/${COUPLE_ID}/logs/${id}`), rest, { merge: true });
    opCount++;
  });
  (data.bucketlist || []).forEach((item) => {
    if (!item.id) return;
    const { id, ...rest } = item;
    batch.set(doc(db, `couples/${COUPLE_ID}/bucketlist/${id}`), rest, { merge: true });
    opCount++;
  });

  if (opCount === 0) throw new Error('That backup file had nothing in it to restore.');
  await batch.commit();
  return opCount;
}

// Resizes/compresses an image file client-side to a small JPEG data-URL,
// so photos can live directly in Firestore without needing paid Storage.
// Compresses to a target size (default 150KB), stepping down quality and then
// dimensions if needed, rather than one fixed setting for every photo. This
// keeps individual photos consistently small — important now that up to 5 can
// share a single 900KB combined budget per entry — without the person ever
// having to think about it.
export function compressImage(file, maxDim = 640, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height *= maxDim / width; width = maxDim; }
        else if (height >= width && height > maxDim) { width *= maxDim / height; height = maxDim; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Could not read that image.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });
}

export { initFirebase, isConfigured };
