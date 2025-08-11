import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { signInAnonymously } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestUserPermissionAndToken(): Promise<string | null> {
  if (Platform.OS !== 'android') return null;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;

  // Ensure we are signed-in to allow token storage
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }

  // Get FCM device token
  const devicePush = await Notifications.getDevicePushTokenAsync();
  const token = devicePush.data;

  try {
    await addDoc(collection(db, 'device_tokens'), {
      uid: auth.currentUser?.uid || null,
      token,
      platform: Platform.OS,
      createdAt: serverTimestamp(),
    });
  } catch {}

  return token;
}