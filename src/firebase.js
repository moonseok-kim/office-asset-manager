import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// 아래 5개 값 중 apiKey, messagingSenderId, appId 는
// Firebase 콘솔 > 프로젝트 설정 > "내 앱" 에서 복사해서 넣어주세요.
const firebaseConfig = {
  apiKey: 'AIzaSyDzqEt8-4ROpH4oLUzOCATBXYXvdOPLVNc',
  authDomain: 'sk-gangnam-center-ms.firebaseapp.com',
  projectId: 'sk-gangnam-center-ms',
  storageBucket: 'sk-gangnam-center-ms.firebasestorage.app',
  messagingSenderId: '386425185528',
  appId: '1:386425185528:web:693542400ca731e7ffc70d',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
