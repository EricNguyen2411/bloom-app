// ------------------------------------------------------------------
// Fill this in with YOUR Firebase project's config (see README.md).
// It's safe for this to be public in a client-side app — Firebase's
// security rules (firestore.rules) are what actually protect the data,
// not this config being secret.
// ------------------------------------------------------------------
export const firebaseConfig = {
  apiKey: "AIzaSyCa7LlrpFb6zb1dbEkYWHFJ3gO3CtjTuSY",
  authDomain: "bloom-app-33f28.firebaseapp.com",
  projectId: "bloom-app-33f28",
  storageBucket: "bloom-app-33f28.firebasestorage.app",
  messagingSenderId: "835797740100",
  appId: "1:835797740100:web:b31f183a35102901efea11"
};

// A shared, made-up "room code" only you and her will use — this is what
// keeps your data separate from anyone else who might use this same app.
export const COUPLE_ID = "24112000";

// Optional: your anniversary (or any date you want celebrated every year),
// as "MM-DD" — e.g. "08-09" for August 9th. On that date each year, a
// special ring decoration unlocks automatically plus a points bonus.
// Leave as null to skip this feature entirely.
export const ANNIVERSARY_MD = "12-12"; // e.g. "08-09"


// Optional: the actual date you two got together, full year included —
// e.g. "2023-08-09". Powers the "days together" number in Fun Stats and the
// garden sign. Leave as null to hide both.
// IMPORTANT: it must be in quotes, like a piece of text — "2025-12-12", not
// 2025-12-12. Without quotes, JavaScript reads it as a subtraction (2025-12-12
// = 2001) instead of a date, which produces a nonsense day count.
export const RELATIONSHIP_START_DATE = "2025-12-12"; // e.g. "2023-08-09"

// Optional: your birthdays, as "MM-DD" (same quoting rule as above applies —
// keep the quotes). Any flower logged on one of these dates, or on Valentine's
// Day, or on your anniversary, gets a small icon marking the occasion in the
// garden. Leave either as null to skip it.
export const BIRTHDAY_1_MD = null; // e.g. "12-27"
export const BIRTHDAY_2_MD = null; // e.g. "11-24"
