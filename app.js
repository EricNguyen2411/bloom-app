import { firebaseConfig, COUPLE_ID, ANNIVERSARY_MD } from './firebase-config.js';

// Stage keys used purely for the plant-bloom animation sequence when you log
// an entry (seed → ... → flourishing over a couple seconds) — no longer tied
// to accumulated points. The resting/idle state between entries is "budding".
export const STAGE_KEYS = ['seed', 'sprout', 'budding', 'blooming', 'flourishing'];

// Garden Shop — decorations you buy with points earned from logging time and
// completing challenges. Purely cosmetic, shown scattered in the garden once owned.
export const DECOR_SHOP = [
  { id: 'butterfly', icon: '🦋', name: 'Butterflies', cost: 15 },
  { id: 'lantern', icon: '🕯️', name: 'Garden lantern', cost: 20 },
  { id: 'bench', icon: '🪑', name: 'Little bench', cost: 30 },
  { id: 'lights', icon: '✨', name: 'Fairy lights', cost: 35 },
  { id: 'birdbath', icon: '⛲', name: 'Birdbath', cost: 40 },
  { id: 'rainbow', icon: '🌈', name: 'Rainbow', cost: 45 },
  { id: 'chime', icon: '🎐', name: 'Wind chime', cost: 50 },
  { id: 'sundial', icon: '☀️', name: 'Sundial', cost: 60 }
];
export const ANNIVERSARY_ICON = '💍';

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
  "Write each other 3 things you're grateful for, swap notes."
];

const isConfigured = firebaseConfig.apiKey !== "REPLACE_ME";
let db, addDoc, deleteDoc, collection, doc, onSnapshot, serverTimestamp, setDoc, getDoc, getDocs,
    arrayUnion, increment, query, orderBy, limit, writeBatch, getCountFromServer;

async function initFirebase() {
  if (!isConfigured) return false;
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
  const authMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
  const fsMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

  const app = initializeApp(firebaseConfig);
  const auth = authMod.getAuth(app);
  await authMod.signInAnonymously(auth);
  db = fsMod.getFirestore(app);
  ({ addDoc, deleteDoc, collection, doc, onSnapshot, serverTimestamp, setDoc, getDoc, getDocs,
     arrayUnion, increment, query, orderBy, limit, writeBatch, getCountFromServer } = fsMod);
  return true;
}

function todayStr() { return new Date().toISOString().slice(0, 10); }
function mmdd(dateStr) { return dateStr.slice(5); }
function daysBetween(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); }

// Which species the *next* planted flower will be — cycles by how many
// flowers have been grown so far, so the plant always previews accurately.
export function currentSpecies(totalFlowers) {
  return SPECIES[(totalFlowers || 0) % SPECIES.length];
}
export function todaysChallenge() {
  return DEFAULT_CHALLENGES[new Date().getDate() % DEFAULT_CHALLENGES.length];
}

// Finds the best "on this day" memory to resurface: prefers exactly 1 year
// ago, then 1 month (30 days) ago, then 1 week ago.
export function findFlashback(logs) {
  const today = todayStr();
  const targets = [365, 30, 7];
  for (const days of targets) {
    const match = logs.find((log) => daysBetween(log.date, today) === days);
    if (match) return { log: match, daysAgo: days };
  }
  return null;
}

const DEMO_STATE = {
  points: 0, streak: 1, lastActiveDate: null,
  unlockedDecorations: [], todayChallengeCompletedDate: null,
  anniversaryUnlockedYear: null, totalFlowers: 0, challengeEnabled: true, shopEnabled: true
};
const DEMO_LOGS = [
  { id: 'demo-1', activity: 'Coffee and a walk (demo entry)', points: 8, date: todayStr(), photo: null, note: '' }
];
const DEMO_BUCKET = [
  { id: 'demo-b1', text: 'Try that ramen place downtown (demo idea)', done: false }
];

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
    DEMO_STATE.points += 50;
    DEMO_STATE.anniversaryUnlockedYear = year;
    return;
  }
  try {
    const ref = doc(db, `couples/${COUPLE_ID}/state/current`);
    await setDoc(ref, { points: increment(50), anniversaryUnlockedYear: year }, { merge: true });
  } catch (err) {
    console.error('anniversary unlock failed:', err);
  }
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

export async function purchaseDecoration(decorId, cost) {
  if (!isConfigured) {
    if (DEMO_STATE.unlockedDecorations.includes(decorId)) return false;
    if (DEMO_STATE.points < cost) return false;
    DEMO_STATE.points -= cost;
    DEMO_STATE.unlockedDecorations.push(decorId);
    return true;
  }
  try {
    const ref = doc(db, `couples/${COUPLE_ID}/state/current`);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : DEMO_STATE;
    const owned = data.unlockedDecorations || [];
    if (owned.includes(decorId)) return false;
    if ((data.points || 0) < cost) return false;
    await setDoc(ref, {
      points: increment(-cost),
      unlockedDecorations: arrayUnion(decorId)
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('purchaseDecoration failed:', err);
    alert('Could not buy that: ' + err.message);
    throw err;
  }
}

// ---- Live log/memory feed (for the photo gallery + weekly recap + flashback) ----
export function watchLogs(renderFn, max = 200) {
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

export function getPhotos(log) {
  if (log.photos && log.photos.length) return log.photos;
  if (log.photo) return [log.photo];
  return [];
}

export async function logTime(activity = '', dateStr = null, photos = []) {
  const entryDate = dateStr || todayStr();
  const gained = 8; // flat reward per logged memory — duration no longer factors in

  const totalSize = photos.reduce((sum, p) => sum + p.length, 0);
  if (totalSize > 900000) {
    throw new Error('Those photos are too large together even after compression — try removing one or two.');
  }

  if (!isConfigured) {
    DEMO_STATE.points += gained;
    DEMO_STATE.totalFlowers += 1;
    if (entryDate === todayStr()) DEMO_STATE.lastActiveDate = entryDate;
    DEMO_LOGS.unshift({ id: 'demo-' + Date.now(), activity, points: gained, date: entryDate, photos, note: '' });
    return DEMO_STATE;
  }

  try {
    const ref = doc(db, `couples/${COUPLE_ID}/state/current`);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : DEMO_STATE;
    const today = todayStr();

    const update = { points: increment(gained), totalFlowers: increment(1) };
    if (entryDate === today) {
      let streak = data.streak || 1;
      if (data.lastActiveDate) {
        const gap = daysBetween(data.lastActiveDate, today);
        if (gap === 1) streak += 1;
        else if (gap > 1) streak = 1;
      }
      update.streak = streak;
      update.lastActiveDate = today;
    }

    await setDoc(ref, update, { merge: true });

    await addDoc(collection(db, `couples/${COUPLE_ID}/logs`), {
      type: 'log', activity, points: gained,
      date: entryDate, backfilled: entryDate !== today,
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
      DEMO_STATE.points += 15;
      DEMO_STATE.totalFlowers += 1;
      DEMO_STATE.todayChallengeCompletedDate = todayStr();
      DEMO_LOGS.unshift({ id: 'demo-c-' + Date.now(), type: 'challenge', activity: 'Challenge: ' + challengeText, points: 15, date: todayStr(), photo: null, note: '' });
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
      points: increment(15),
      totalFlowers: increment(1),
      todayChallengeCompletedDate: today
    }, { merge: true });

    await addDoc(collection(db, `couples/${COUPLE_ID}/logs`), {
      type: 'challenge', activity: 'Challenge: ' + challengeText, points: 15,
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

// Deletes a memory entry. Note: this does NOT reverse the growth points it
// already earned — the plant keeps what it grew, this just removes the
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
export async function editLog(logId, activity) {
  if (!isConfigured) {
    const entry = DEMO_LOGS.find((l) => l.id === logId);
    if (entry) entry.activity = activity;
    return;
  }
  try {
    await setDoc(doc(db, `couples/${COUPLE_ID}/logs/${logId}`), { activity }, { merge: true });
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
