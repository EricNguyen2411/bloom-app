import { firebaseConfig, COUPLE_ID } from './firebase-config.js';

export const STAGES = [
  { key: 'seed', name: 'Seed', min: 0, next: 20 },
  { key: 'sprout', name: 'Sprout', min: 20, next: 50 },
  { key: 'budding', name: 'Budding', min: 50, next: 100 },
  { key: 'blooming', name: 'Blooming', min: 100, next: 200 },
  { key: 'flourishing', name: 'Flourishing', min: 200, next: null }
];

export const DECOR_ICONS = ['🦋', '✨', '🌈', '🕯️', '🐝', '🌙', '☀️'];

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
let db, addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc, getDoc, updateDoc, arrayUnion, increment;

async function initFirebase() {
  if (!isConfigured) return false;
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
  const authMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
  const fsMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

  const app = initializeApp(firebaseConfig);
  const auth = authMod.getAuth(app);
  await authMod.signInAnonymously(auth);
  db = fsMod.getFirestore(app);
  ({ addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc, getDoc, updateDoc, arrayUnion, increment } = fsMod);
  return true;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
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

const DEMO_STATE = { points: 0, streak: 1, lastActiveDate: null, unlockedDecorations: [0], todayChallengeCompletedDate: null };

// ---- Live state (real-time — both phones see updates as they happen) ----
export function watchState(renderFn) {
  if (isConfigured) {
    const ref = doc(db, `couples/${COUPLE_ID}/state/current`);
    onSnapshot(ref, async (snap) => {
      if (!snap.exists()) {
        await setDoc(ref, DEMO_STATE);
        return;
      }
      renderFn(snap.data());
    });
  } else {
    renderFn(DEMO_STATE);
  }
}

export async function logTime(minutes) {
  const gained = Math.max(4, Math.min(12, Math.round(minutes / 10)));
  if (!isConfigured) {
    DEMO_STATE.points += gained;
    return DEMO_STATE;
  }
  const ref = doc(db, `couples/${COUPLE_ID}/state/current`);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : DEMO_STATE;
  const today = todayStr();
  let streak = data.streak || 1;
  if (data.lastActiveDate) {
    const gap = daysBetween(data.lastActiveDate, today);
    if (gap === 1) streak += 1;
    else if (gap > 1) streak = 1;
  }
  await updateDoc(ref, { points: increment(gained), streak, lastActiveDate: today });

  await addDoc(collection(db, `couples/${COUPLE_ID}/logs`), {
    minutes, points: gained, createdAt: serverTimestamp()
  });
}

export async function completeChallenge() {
  if (!isConfigured) {
    if (DEMO_STATE.todayChallengeCompletedDate !== todayStr()) {
      DEMO_STATE.points += 15;
      DEMO_STATE.unlockedDecorations.push(DEMO_STATE.unlockedDecorations.length % DECOR_ICONS.length);
      DEMO_STATE.todayChallengeCompletedDate = todayStr();
    }
    return DEMO_STATE;
  }
  const ref = doc(db, `couples/${COUPLE_ID}/state/current`);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : DEMO_STATE;
  const today = todayStr();
  if (data.todayChallengeCompletedDate === today) return; // already done today
  const nextDecorIdx = (data.unlockedDecorations?.length || 0) % DECOR_ICONS.length;
  await updateDoc(ref, {
    points: increment(15),
    todayChallengeCompletedDate: today,
    unlockedDecorations: arrayUnion(nextDecorIdx)
  });
}

export { initFirebase, isConfigured };
