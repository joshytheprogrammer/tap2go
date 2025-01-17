import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Parse the service account JSON from the environment variable
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error("GOOGLE_APPLICATION_CREDENTIALS environment variable is not defined.");
}

let firebaseServerAccounts;
try {
  firebaseServerAccounts = process.env.GOOGLE_APPLICATION_CREDENTIALS;
} catch (error) {
  throw new Error("Failed to parse GOOGLE_APPLICATION_CREDENTIALS. Ensure it is valid JSON.");
}


let app;
if (getApps().length === 0) {
  app = initializeApp({
    credential: cert(firebaseServerAccounts)
  });
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

export default function useFirebaseServer() {
  return {
    db,
    getAuth
  };
}
