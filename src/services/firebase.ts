/**
 * Firebase 初期化・設定
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  signInAnonymously,
  onAuthStateChanged,
  type User,
  type Auth,
} from 'firebase/auth';
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
  type Firestore,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase 設定
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

// シングルトンパターンでFirebaseを初期化
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

function initializeFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    db = getFirestore(app);
  } else {
    app = getApp();
    // 既に初期化されている場合は、既存のインスタンスを使用
    // @ts-ignore - Firebase内部のauth取得
    auth = (app as any)._container?.getProvider('auth')?.getImmediate() ||
      initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    db = getFirestore(app);
  }
}

// 初期化を実行
initializeFirebase();

// 匿名認証でサインイン
export const signInAnonymouslyUser = async (): Promise<User | null> => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Anonymous sign in error:', error);
    return null;
  }
};

// 認証状態の監視
export const subscribeToAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore ヘルパー関数
export const firestoreHelpers = {
  // ユーザードキュメントの取得・作成
  async getOrCreateUser(userId: string, data?: { prefecture?: string; city?: string }) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const newUser = {
        email: auth.currentUser?.email || null,
        prefecture: data?.prefecture || '東京都',
        city: data?.city || '千代田区',
        createdAt: Timestamp.now(),
      };
      await setDoc(userRef, newUser);
      return { id: userId, ...newUser };
    }

    return { id: userId, ...userSnap.data() };
  },

  // 体調記録の追加
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

  // 体調記録の取得
  async getHealthLogs(userId: string, limitCount: number = 50) {
    const logsRef = collection(db, 'users', userId, 'health_logs');
    const q = query(logsRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  },

  // 気象キャッシュの取得
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

    // 30分以上経過していたらキャッシュ無効
    if (fetchedAt && now.getTime() - fetchedAt.getTime() > 30 * 60 * 1000) {
      return null;
    }

    return data;
  },
};

export { auth, db, Timestamp };
export default app;
