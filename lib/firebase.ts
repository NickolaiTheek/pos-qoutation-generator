import { getApp, getApps, initializeApp } from "firebase/app";
import { DocumentSnapshot, QueryDocumentSnapshot, Timestamp, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAEE1rIQVJ25WjHp5zgAQb6sIIKYyYNR9g",
  authDomain: "pos-system-85d00.firebaseapp.com",
  projectId: "pos-system-85d00",
  storageBucket: "pos-system-85d00.firebasestorage.app",
  messagingSenderId: "576718179746",
  appId: "1:576718179746:web:e8a2eea983b37156f876fb",
  measurementId: "G-1QPSG9HC73",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

function serializeValue(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serializeValue);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, serializeValue(v)])
    );
  }
  return value;
}

export function docToJSON(
  snap: DocumentSnapshot | QueryDocumentSnapshot
): Record<string, unknown> | null {
  if (!snap.exists()) return null;
  const data = snap.data()!;
  const result: Record<string, unknown> = { id: snap.id };
  for (const [key, value] of Object.entries(data)) {
    result[key] = serializeValue(value);
  }
  return result;
}

export function docsToJSON(snaps: QueryDocumentSnapshot[]): Record<string, unknown>[] {
  return snaps.map((snap) => {
    const data = snap.data();
    const result: Record<string, unknown> = { id: snap.id };
    for (const [key, value] of Object.entries(data)) {
      result[key] = serializeValue(value);
    }
    return result;
  });
}
