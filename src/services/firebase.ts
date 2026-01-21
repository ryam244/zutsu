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

// Auth は遅延初期化（Expo Go互換性のため）
let authPromise: Promise<any> | null = null;

const getAuthLazy = async () => {
  if (!authPromise) {
    authPromise = (async () => {
      try {
        const authModule = await import('firebase/auth');
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;

        // 既に初期化済みかチェック
        try {
          return authModule.getAuth(app);
        } catch {
          // 初期化されていない場合は initializeAuth を使用
          return authModule.initializeAuth(app, {
            persistence: authModule.getReactNativePersistence(AsyncStorage),
          });
        }
      } catch (error) {
        console.error('Auth lazy init error:', error);
        return null;
      }
    })();
  }
  return authPromise;
};

// 匿名認証でサインイン
export const signInAnonymouslyUser = async () => {
  try {
    const auth = await getAuthLazy();
    if (!auth) {
      console.log('Auth not available, skipping sign in');
      return null;
    }

    const { signInAnonymously } = await import('firebase/auth');
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Anonymous sign in error:', error);
    return null;
  }
};

// 認証状態の監視
export const subscribeToAuthState = (callback: (user: any) => void) => {
  let unsubscribe = () => {};

  getAuthLazy().then(async (auth) => {
    if (!auth) {
      callback(null);
      return;
    }

    const { onAuthStateChanged } = await import('firebase/auth');
    unsubscribe = onAuthStateChanged(auth, callback);
  }).catch(() => {
    callback(null);
  });

  return () => unsubscribe();
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
