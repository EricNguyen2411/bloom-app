// ------------------------------------------------------------------
// Fill this in with YOUR Firebase project's config (see README.md).
// It's safe for this to be public in a client-side app — Firebase's
// security rules (firestore.rules) are what actually protect the data,
// not this config being secret.
// ------------------------------------------------------------------
export const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

// A shared, made-up "room code" only you and her will use — this is what
// keeps your data separate from anyone else who might use this same app.
export const COUPLE_ID = "REPLACE_ME_WITH_A_PRIVATE_CODE";

// Optional: your anniversary (or any date you want celebrated every year),
// as "MM-DD" — e.g. "08-09" for August 9th. On that date each year, a
// full-screen fireworks celebration shows once on the dashboard.
// Leave as null to skip this feature entirely.
export const ANNIVERSARY_MD = null; // e.g. "08-09"

// Optional: the actual date you two got together, full year included —
// e.g. "2023-08-09". Powers the "days together" number in Fun Stats and the
// garden sign. Leave as null to hide both.
// IMPORTANT: it must be in quotes, like a piece of text — "2025-12-12", not
// 2025-12-12. Without quotes, JavaScript reads it as a subtraction (2025-12-12
// = 2001) instead of a date, which produces a nonsense day count.
export const RELATIONSHIP_START_DATE = null; // e.g. "2023-08-09"

// Optional: your birthdays, as "MM-DD" (same quoting rule as above applies —
// keep the quotes). Any flower logged on one of these dates, or on Valentine's
// Day, or on your anniversary, gets a small icon marking the occasion in the
// garden. Leave either as null to skip it.
export const BIRTHDAY_1_MD = null; // e.g. "03-22"
export const BIRTHDAY_2_MD = null; // e.g. "09-04"
