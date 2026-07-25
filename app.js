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
let db, addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc, getDoc,
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
  ({ addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc, getDoc,
     arrayUnion, increment, query, orderBy, limit } = fsMod);
  return true;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function mmdd(dateStr) {
  return dateStr.slice(5); // "YYYY-MM-DD" -> "MM-DD"
}
function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

export function currentStage(points) {
  return [...STAGES].reverse().find((s) => points >= s.min);
}

export function todaysChallenge() {
  return DEFAULT_CHALLENGES[new Date().getDate() % DEFAULT_CHALLENGES.length];
}

// Finds the best "on this day" memory to resurface: prefers exactly 1 year
// ago, then 1 month (30 days) ago, then 1 week ago — whichever is furthest
// back and matches, since older memories tend to be the more meaningful ones.
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
  anniversaryUnlockedYear: null
};
const DEMO_LOGS = [
  { id: 'demo-1', activity: 'Coffee and a walk (demo entry)', minutes: 40, points: 4, date: todayStr(), photo: null, note: '' }
];

// ---- Live state (real-time — both phones see updates as they happen) ----
export function watchState(renderFn) {
  if (isConfigured) {
    const ref = doc(db, `couples/${COUPLE_ID}/state/current`);
    renderFn(DEMO_STATE); // sane defaults immediately, no "stuck on loading"
    onSnapshot(
      ref,
      async (snap) => {
        if (!snap.exists()) {
          try {
            await setDoc(ref, DEMO_STATE);
          } catch (err) {
            console.error('Could not create initial state doc:', err);
            alert('Could not connect to your shared data. Check firebase-config.js / Firestore rules. (' + err.message + ')');
          }
          return; // the setDoc above will trigger this listener again
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

// If today matches your set anniversary date (MM-DD) and it hasn't already
// been unlocked this year, grant the special ring decoration + bonus points.
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

// ---- Live log/memory feed (for the photo gallery + weekly recap + flashback) ----
export function watchLogs(renderFn, max = 200) {
  if (!isConfigured) {
    renderFn(DEMO_LOGS);
    return;
  }
  const q = query(collection(db, `couples/${COUPLE_ID}/logs`), orderBy('date', 'desc'), limit(max));
  onSnapshot(
    q,
    (snap) => renderFn(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => console.error('watchLogs listener error:', err)
  );
}

// dateStr defaults to today. Pass an earlier date to backfill a memory you
// forgot to log — growth points still count (it really happened!), but the
// streak only updates for same-day entries, so backfilling can't be used to
// fake a longer streak than you actually have.
// photo (optional): a compressed base64 JPEG data-URL string.
export async function logTime(minutes, activity = '', dateStr = null, photo = null) {
  const entryDate = dateStr || todayStr();
  const gained = Math.max(4, Math.min(12, Math.round(minutes / 10)));

  if (photo && photo.length > 900000) {
    throw new Error('That photo is too large even after compression — try a different one.');
  }

  if (!isConfigured) {
    DEMO_STATE.points += gained;
    if (entryDate === todayStr()) DEMO_STATE.lastActiveDate = entryDate;
    DEMO_LOGS.unshift({ id: 'demo-' + Date.now(), activity, minutes, points: gained, date: entryDate, photo: photo || null, note: '' });
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
      type: 'log', minutes, activity, points: gained,
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
      DEMO_LOGS.unshift({ id: 'demo-c-' + Date.now(), type: 'challenge', activity: 'Challenge: ' + challengeText, minutes: 0, points: 15, date: todayStr(), photo: null, note: '' });
    }
    return DEMO_STATE;
  }
  try {
    const ref = doc(db, `couples/${COUPLE_ID}/state/current`);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : DEMO_STATE;
    const today = todayStr();
    if (data.todayChallengeCompletedDate === today) return; // already done today
    const nextDecorIdx = (data.unlockedDecorations?.length || 0) % DECOR_ICONS.length;
    await setDoc(ref, {
      points: increment(15),
      todayChallengeCompletedDate: today,
      unlockedDecorations: arrayUnion(nextDecorIdx)
    }, { merge: true });

    await addDoc(collection(db, `couples/${COUPLE_ID}/logs`), {
      type: 'challenge', activity: 'Challenge: ' + challengeText, minutes: 0, points: 15,
      date: today, backfilled: false, photo: null, note: '',
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error('completeChallenge failed:', err);
    alert('Could not save that: ' + err.message);
    throw err;
  }
}

// Appends/updates a short note on an existing memory entry.
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
