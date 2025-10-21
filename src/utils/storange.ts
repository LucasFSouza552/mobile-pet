import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveStorage(key: string, token: string): Promise<void> {
    AsyncStorage.setItem(key, token);
}

export async function getStorage(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
}

export async function removeStorage(key: string): Promise<void> {
    AsyncStorage.removeItem(key);
}