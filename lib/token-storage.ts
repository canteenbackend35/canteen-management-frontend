import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "canteen-auth-token";
const USER_ID_KEY = "canteen-user-id";
let availabilityPromise: Promise<boolean> | null = null;

type FallbackStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
} | null;

function getFallbackStorage(): FallbackStorage {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

async function isSecureStoreAvailable() {
  if (!availabilityPromise) {
    availabilityPromise = SecureStore.isAvailableAsync();
  }

  try {
    return await availabilityPromise;
  } catch {
    return false;
  }
}

export async function saveAuthToken(token: string) {
  const canUseSecureStore = await isSecureStoreAvailable();

  if (canUseSecureStore) {
    await SecureStore.setItemAsync(TOKEN_KEY, token, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
    return;
  }

  getFallbackStorage()?.setItem(TOKEN_KEY, token);
}

export async function getAuthToken() {
  const canUseSecureStore = await isSecureStoreAvailable();

  if (canUseSecureStore) {
    return SecureStore.getItemAsync(TOKEN_KEY);
  }

  return getFallbackStorage()?.getItem(TOKEN_KEY) ?? null;
}

export async function clearAuthToken() {
  const canUseSecureStore = await isSecureStoreAvailable();

  if (canUseSecureStore) {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_ID_KEY);
  }

  getFallbackStorage()?.removeItem(TOKEN_KEY);
  getFallbackStorage()?.removeItem(USER_ID_KEY);
}

export async function saveUserId(userId: string | string) {
  const canUseSecureStore = await isSecureStoreAvailable();
  const userIdString = String(userId);

  if (canUseSecureStore) {
    await SecureStore.setItemAsync(USER_ID_KEY, userIdString, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
    return;
  }

  getFallbackStorage()?.setItem(USER_ID_KEY, userIdString);
}

export async function getUserId(): Promise<string | null> {
  const canUseSecureStore = await isSecureStoreAvailable();
  let userIdString: string | null = null;

  if (canUseSecureStore) {
    userIdString = await SecureStore.getItemAsync(USER_ID_KEY);
  } else {
    userIdString = getFallbackStorage()?.getItem(USER_ID_KEY) ?? null;
  }

  if (!userIdString) {
    return null;
  }

  // const userId = parseInt(userIdString, 10);
  return userIdString;
}
