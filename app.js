import { firebaseConfig, COUPLE_ID, ANNIVERSARY_MD } from './firebase-config.js';

export const STAGES = [
  { key: 'seed', name: 'Seed', min: 0, next: 20 },
  { key: 'sprout', name: 'Sprout', min: 20, next: 50 },
  { key: 'budding', name: 'Budding', min: 50, next: 100 },
  { key: 'blooming', name: 'Blooming', min: 100, next: 200 },
  { key: 'flourishing', name: 'Flourishing', min: 200, next: null }
];

// Regular challenge-unlocked decorations. The anniversary decoration (💍) is
// separate and tracked with its own flag so it can never be earned any other way.
export const DECOR_ICONS = ['🦋', '✨', '🌈', '🕯️', '🐝', '🌙', '☀️'];
export const ANNIVERSARY_ICON = '💍';

// Flower species — cycles each time you harvest a fully-bloomed plant into
// the bouquet, so the plant you're growing looks different each round.
// Each icon is a small flat SVG silhouette (viewBox 0 0 24 24). They use
// fill="currentColor" so the color is set per-species at render time from
// that species' "dark" shade — see applySpeciesColor() in index.html.
const ICON_STROKE = 'stroke="#2A1B12" stroke-opacity="0.22" stroke-width="0.6"';

export const SPECIES = [
  {
    name: 'Rose', light: '#F0A8AE', dark: '#C63D52',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" ${ICON_STROKE}><circle cx="12" cy="12" r="2.6"/><path d="M12 12C9.5 9.5 9.5 5.5 12 3c1.8 3 1.8 6.5 0 9z"/><path d="M12 12c2.5-2.5 6.5-2.5 9 0-3 1.8-6.5 1.8-9 0z"/><path d="M12 12c2.5 2.5 2.5 6.5 0 9-1.8-3-1.8-6.5 0-9z"/><path d="M12 12c-2.5 2.5-6.5 2.5-9 0 3-1.8 6.5-1.8 9 0z"/></svg>`
  },
  {
    name: 'Peony', light: '#F3C6D9', dark: '#D77FA1',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" ${ICON_STROKE}><circle cx="12" cy="6.5" r="4"/><circle cx="17" cy="9.5" r="4"/><circle cx="17" cy="15" r="4"/><circle cx="12" cy="18" r="4"/><circle cx="7" cy="15" r="4"/><circle cx="7" cy="9.5" r="4"/><circle cx="12" cy="12" r="3.2"/></svg>`
  },
  {
    name: 'Hydrangea', light: '#B9D3EA', dark: '#6E9BC2',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" ${ICON_STROKE}>
      <g transform="translate(7,7) scale(0.55)"><circle cx="0" cy="-4" r="3"/><circle cx="4" cy="0" r="3"/><circle cx="0" cy="4" r="3"/><circle cx="-4" cy="0" r="3"/><circle cx="0" cy="0" r="2"/></g>
      <g transform="translate(16,7) scale(0.55)"><circle cx="0" cy="-4" r="3"/><circle cx="4" cy="0" r="3"/><circle cx="0" cy="4" r="3"/><circle cx="-4" cy="0" r="3"/><circle cx="0" cy="0" r="2"/></g>
      <g transform="translate(7,16) scale(0.55)"><circle cx="0" cy="-4" r="3"/><circle cx="4" cy="0" r="3"/><circle cx="0" cy="4" r="3"/><circle cx="-4" cy="0" r="3"/><circle cx="0" cy="0" r="2"/></g>
      <g transform="translate(16,16) scale(0.55)"><circle cx="0" cy="-4" r="3"/><circle cx="4" cy="0" r="3"/><circle cx="0" cy="4" r="3"/><circle cx="-4" cy="0" r="3"/><circle cx="0" cy="0" r="2"/></g>
    </svg>`
  },
  {
    name: 'Ranunculus', light: '#F6C9B0', dark: '#E8865A',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" ${ICON_STROKE}><ellipse cx="19" cy="12" rx="3" ry="2"/><ellipse cx="17" cy="17" rx="3" ry="2" transform="rotate(45 17 17)"/><ellipse cx="12" cy="19" rx="3" ry="2" transform="rotate(90 12 19)"/><ellipse cx="7" cy="17" rx="3" ry="2" transform="rotate(135 7 17)"/><ellipse cx="5" cy="12" rx="3" ry="2"/><ellipse cx="7" cy="7" rx="3" ry="2" transform="rotate(45 7 7)"/><ellipse cx="12" cy="5" rx="3" ry="2" transform="rotate(90 12 5)"/><ellipse cx="17" cy="7" rx="3" ry="2" transform="rotate(135 17 7)"/><circle cx="12" cy="12" r="3.4"/></svg>`
  },
  {
    name: 'Poppy', light: '#E37B5D', dark: '#C1432E',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" ${ICON_STROKE}><ellipse cx="12" cy="6" rx="5.5" ry="6"/><ellipse cx="18" cy="12" rx="6" ry="5.5" transform="rotate(90 18 12)"/><ellipse cx="12" cy="18" rx="5.5" ry="6" transform="rotate(180 12 18)"/><ellipse cx="6" cy="12" rx="6" ry="5.5" transform="rotate(270 6 12)"/><circle cx="12" cy="12" r="2.6" fill="#2A1B12" fill-opacity="0.55" stroke="none"/></svg>`
  },
  {
    name: 'Snapdragon', light: '#F2D488', dark: '#E3A93E',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" ${ICON_STROKE}><ellipse cx="12" cy="18" rx="5" ry="3.6"/><ellipse cx="12" cy="12" rx="4.2" ry="3"/><ellipse cx="12" cy="7" rx="3.4" ry="2.4"/><ellipse cx="12" cy="3.2" rx="2.4" ry="1.7"/></svg>`
  },
  {
    name: "Baby's Breath", light: '#FBF6E8', dark: '#B7AD8E',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" ${ICON_STROKE}><circle cx="6" cy="7" r="2"/><circle cx="13" cy="5" r="2.2"/><circle cx="19" cy="8" r="1.8"/><circle cx="9" cy="12" r="2.4"/><circle cx="16" cy="13" r="2"/><circle cx="6" cy="16" r="1.8"/><circle cx="12" cy="18" r="2.2"/><circle cx="18" cy="18" r="1.8"/></svg>`
  },
  {
    name: 'Lily', light: '#FBF3D9', dark: '#D4A537',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" ${ICON_STROKE}><path d="M12 12 L12 2 L14.5 8 Z"/><path d="M12 12 L20.8 6.2 L16.5 11.3 Z"/><path d="M12 12 L21.8 17.8 L15.2 15 Z"/><path d="M12 12 L12 22 L9.5 16 Z"/><path d="M12 12 L3.2 17.8 L7.5 12.7 Z"/><path d="M12 12 L2.2 6.2 L8.8 9 Z"/><circle cx="12" cy="12" r="2" fill="#E8C468" stroke="none"/></svg>`
  }
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
    arrayUnion, increment, query, orderBy, limit, writeBatch;

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
     arrayUnion, increment, query, orderBy, limit, writeBatch } = fsMod);
  return true;
}

function todayStr() { return new Date().toISOString().slice(0, 10); }
function mmdd(dateStr) { return dateStr.slice(5); }
function daysBetween(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); }

export function currentStage(points) {
  return [...STAGES].reverse().find((s) => points >= s.min);
}
export function currentSpecies(totalHarvests) {
  return SPECIES[(totalHarvests || 0) % SPECIES.length];
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
  unlockedDecorations: [0], todayChallengeCompletedDate: null,
  anniversaryUnlockedYear: null, totalHarvests: 0, bouquet: []
};
const DEMO_LOGS = [
  { id: 'demo-1', activity: 'Coffee and a walk (demo entry)', hours: 0.7, points: 4, date: todayStr(), photo: null, note: '' }
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

// Harvests a fully-bloomed plant into the bouquet, then starts a new plant
// (a different species) growing from any leftover points above 200.
export async function harvestFlower() {
  if (!isConfigured) {
    if (DEMO_STATE.points < 200) return;
    const speciesIdx = DEMO_STATE.totalHarvests % SPECIES.length;
    DEMO_STATE.bouquet.push({ speciesIndex: speciesIdx, date: todayStr() });
    DEMO_STATE.totalHarvests += 1;
    DEMO_STATE.points = Math.max(0, DEMO_STATE.points - 200);
    return DEMO_STATE;
  }
  try {
    const ref = doc(db, `couples/${COUPLE_ID}/state/current`);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : DEMO_STATE;
    if ((data.points || 0) < 200) return;
    const speciesIdx = (data.totalHarvests || 0) % SPECIES.length;
    const newPoints = Math.max(0, data.points - 200);
    await setDoc(ref, {
      points: newPoints,
      totalHarvests: increment(1),
      bouquet: arrayUnion({ speciesIndex: speciesIdx, date: todayStr() })
    }, { merge: true });
  } catch (err) {
    console.error('harvestFlower failed:', err);
    alert('Could not harvest that flower: ' + err.message);
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
export function getPhotos(log) {
  if (log.photos && log.photos.length) return log.photos;
  if (log.photo) return [log.photo];
  return [];
}

export async function logTime(hours, activity = '', dateStr = null, photos = []) {
  const entryDate = dateStr || todayStr();
  const gained = Math.max(4, Math.min(12, Math.round(hours * 6)));

  const totalSize = photos.reduce((sum, p) => sum + p.length, 0);
  if (totalSize > 900000) {
    throw new Error('Those photos are too large together even after compression — try removing one or two.');
  }

  if (!isConfigured) {
    DEMO_STATE.points += gained;
    if (entryDate === todayStr()) DEMO_STATE.lastActiveDate = entryDate;
    DEMO_LOGS.unshift({ id: 'demo-' + Date.now(), activity, hours, points: gained, date: entryDate, photos, note: '' });
    return DEMO_STATE;
  }

  try {
    const ref = doc(db, `couples/${COUPLE_ID}/state/current`);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : DEMO_STATE;
    const today = todayStr();

    const update = { points: increment(gained) };
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
      type: 'log', hours, activity, points: gained,
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
      DEMO_STATE.unlockedDecorations.push(DEMO_STATE.unlockedDecorations.length % DECOR_ICONS.length);
      DEMO_STATE.todayChallengeCompletedDate = todayStr();
      DEMO_LOGS.unshift({ id: 'demo-c-' + Date.now(), type: 'challenge', activity: 'Challenge: ' + challengeText, hours: 0, points: 15, date: todayStr(), photo: null, note: '' });
    }
    return DEMO_STATE;
  }
  try {
    const ref = doc(db, `couples/${COUPLE_ID}/state/current`);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : DEMO_STATE;
    const today = todayStr();
    if (data.todayChallengeCompletedDate === today) return;
    const nextDecorIdx = (data.unlockedDecorations?.length || 0) % DECOR_ICONS.length;
    await setDoc(ref, {
      points: increment(15),
      todayChallengeCompletedDate: today,
      unlockedDecorations: arrayUnion(nextDecorIdx)
    }, { merge: true });

    await addDoc(collection(db, `couples/${COUPLE_ID}/logs`), {
      type: 'challenge', activity: 'Challenge: ' + challengeText, hours: 0, points: 15,
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

// Edits the activity description of an existing memory entry (hours/points
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
