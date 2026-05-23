import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  RecaptchaVerifier,
  ConfirmationResult,
} from 'firebase/auth';
import { firebaseConfig } from '@/config/firebase.config';
import api from './api';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ─── Google Sign-In ─────────────────────────────────────────────────────────
export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return exchangeTokenWithBackend(idToken);
};

// ─── Phone OTP ───────────────────────────────────────────────────────────────
export const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {},
  });
};

export const sendOTP = async (
  phone: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> => {
  return signInWithPhoneNumber(auth, phone, recaptchaVerifier);
};

export const verifyOTP = async (
  confirmationResult: ConfirmationResult,
  otp: string
) => {
  const result = await confirmationResult.confirm(otp);
  const idToken = await result.user.getIdToken();
  return exchangeTokenWithBackend(idToken);
};

// ─── Exchange Firebase token for JWT ─────────────────────────────────────────
const exchangeTokenWithBackend = async (firebaseToken: string) => {
  const response = await api.post('/auth/login', { firebaseToken });
  const { token, ...user } = response.data;
  localStorage.setItem('sharpshadow_token', token);
  localStorage.setItem('sharpshadow_user', JSON.stringify(user));
  return { token, user };
};

// ─── Sign Out ────────────────────────────────────────────────────────────────
export const logout = async () => {
  await signOut(auth);
  localStorage.removeItem('sharpshadow_token');
  localStorage.removeItem('sharpshadow_user');
};

export default { loginWithGoogle, sendOTP, verifyOTP, logout };
