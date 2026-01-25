/**
 * Firebase 初期化・設定
 * Expo + Firebase Web SDK 互換
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  query,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
// Firebase 設定
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

// Firebase アプリの初期化
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// 開発用の仮ユーザーID（Expo Go互換性のため、Auth無しで動作）
const DEV_USER_ID = 'dev-user-001';

// 匿名認証でサインイン（開発中は仮ユーザーを返す）
export const signInAnonymouslyUser = async () => {
  // Expo Go環境ではFirebase Authが動作しないため、仮ユーザーを返す
  console.log('Using development user (Firebase Auth not available in Expo Go)');
  return { uid: DEV_USER_ID } as { uid: string };
};

// 認証状態の監視（開発中は仮ユーザーを即座に返す）
export const subscribeToAuthState = (callback: (user: any) => void) => {
  // 即座に仮ユーザーを返す
  setTimeout(() => {
    callback({ uid: DEV_USER_ID, email: null, isAnonymous: true });
  }, 100);

  return () => {};
};

// Firestore ヘルパー関数
export const firestoreHelpers = {
  async getOrCreateUser(userId: string, data?: { prefecture?: string; city?: string }) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const newUser = {
        email: null,
        prefecture: data?.prefecture || '東京都',
        city: data?.city || '千代田区',
        createdAt: Timestamp.now(),
      };
      await setDoc(userRef, newUser);
      return { id: userId, ...newUser };
    }

    return { id: userId, ...userSnap.data() };
  },

  async addHealthLog(
    userId: string,
    log: {
      severity: 0 | 1 | 2 | 3;
      pressureHpa?: number | null;
      memo?: string | null;
      locationPrefecture?: string | null;
      locationCity?: string | null;
    }
  ) {
    const logsRef = collection(db, 'users', userId, 'health_logs');
    const docRef = await addDoc(logsRef, {
      ...log,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getHealthLogs(userId: string, limitCount: number = 50) {
    const logsRef = collection(db, 'users', userId, 'health_logs');
    const q = query(logsRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  },

  async getWeatherCache(prefecture: string, city: string) {
    const cacheId = `${prefecture}_${city}`;
    const cacheRef = doc(db, 'weather_cache', cacheId);
    const cacheSnap = await getDoc(cacheRef);

    if (!cacheSnap.exists()) {
      return null;
    }

    const data = cacheSnap.data();
    const fetchedAt = data.fetchedAt?.toDate();
    const now = new Date();

    if (fetchedAt && now.getTime() - fetchedAt.getTime() > 30 * 60 * 1000) {
      return null;
    }

    return data;
  },
};

export { db, Timestamp };
export default app;
