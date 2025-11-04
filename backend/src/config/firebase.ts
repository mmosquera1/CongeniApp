import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let firebaseApp: App;

export function initFirebase(): App {
  if (!getApps().length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
      throw new Error('Missing Firebase service account environment variables.');
    }

    firebaseApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
  } else {
    firebaseApp = getApps()[0];
  }

  return firebaseApp;
}

export const firebaseAuth = () => getAuth(initFirebase());
export const firestore = () => getFirestore(initFirebase());
export const storage = () => getStorage(initFirebase());
