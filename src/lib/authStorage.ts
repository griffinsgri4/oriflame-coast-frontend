import { Capacitor } from '@capacitor/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user';

const isNative = () => Capacitor.getPlatform() !== 'web';

const getFromLocalStorage = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setToLocalStorage = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
  }
};

const removeFromLocalStorage = (key: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
  }
};

const secureGet = async (key: string): Promise<string | null> => {
  try {
    const res = await SecureStoragePlugin.get({ key });
    return typeof res?.value === 'string' ? res.value : null;
  } catch {
    return null;
  }
};

const secureSet = async (key: string, value: string): Promise<void> => {
  try {
    await SecureStoragePlugin.set({ key, value });
  } catch {
  }
};

const secureRemove = async (key: string): Promise<void> => {
  try {
    await SecureStoragePlugin.remove({ key });
  } catch {
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  if (isNative()) {
    const v = await secureGet(TOKEN_KEY);
    if (v) return v;
  }
  return getFromLocalStorage(TOKEN_KEY);
};

export const setAuthToken = async (token: string): Promise<void> => {
  if (isNative()) {
    await secureSet(TOKEN_KEY, token);
  }
  setToLocalStorage(TOKEN_KEY, token);
};

export const removeAuthToken = async (): Promise<void> => {
  if (isNative()) {
    await secureRemove(TOKEN_KEY);
  }
  removeFromLocalStorage(TOKEN_KEY);
};

export const getStoredUserRaw = async (): Promise<string | null> => {
  if (isNative()) {
    const v = await secureGet(USER_KEY);
    if (v) return v;
  }
  return getFromLocalStorage(USER_KEY);
};

export const setStoredUserRaw = async (raw: string): Promise<void> => {
  if (isNative()) {
    await secureSet(USER_KEY, raw);
  }
  setToLocalStorage(USER_KEY, raw);
};

export const removeStoredUser = async (): Promise<void> => {
  if (isNative()) {
    await secureRemove(USER_KEY);
  }
  removeFromLocalStorage(USER_KEY);
};
