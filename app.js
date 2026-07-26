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
export const SPECIES = [
  { name: 'Rose Blush', light: '#EFAF95', dark: '#E2896A', emoji: '🌹' },
  { name: 'Violet Bloom', light: '#B487A3', dark: '#8C5A78', emoji: '💜' },
  { name: 'Golden Marigold', light: '#F2D488', dark: '#E3B94F', emoji: '🌼' },
  { name: 'Sky Aster', light: '#8FB3CC', dark: '#5C8BAA', emoji: '🪻' },
  { name: 'Wild Poppy', light: '#E37B5D', dark: '#C1432E', emoji: '🌺' }
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
let db, addDoc, deleteDoc, collection, doc, onSnapshot, serverTimestamp, setDoc, getDoc,
    arrayUnion, increment, query, orderBy, limit;

async function initFirebase() {
  if (!isConfigured) return false;
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
  const authMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
  const fsMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

  const app = initializeApp(firebaseConfig);
  const auth = authMod.getAuth(app);
  await authMod.signInAnonymously(auth);
  db = fsMod.getFirestore(app);
  ({ addDoc, deleteDoc, collection, doc, onSnapshot, serverTimestamp, setDoc, getDoc,
     arrayUnion, increment, query, orderBy, limit } = fsMod);
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

export async function logTime(hours, activity = '', dateStr = null, photo = null) {
  const entryDate = dateStr || todayStr();
  const gained = Math.max(4, Math.min(12, Math.round(hours * 6)));

  if (photo && photo.length > 900000) {
    throw new Error('That photo is too large even after compression — try a different one.');
  }

  if (!isConfigured) {
    DEMO_STATE.points += gained;
    if (entryDate === todayStr()) DEMO_STATE.lastActiveDate = entryDate;
    DEMO_LOGS.unshift({ id: 'demo-' + Date.now(), activity, hours, points: gained, date: entryDate, photo: photo || null, note: '' });
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
      photo: photo || null, note: '',
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
