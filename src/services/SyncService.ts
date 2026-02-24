import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import { DiaryEntry } from '../types';

export const SyncService = {
  async syncEntry(dateKey: string, entry: DiaryEntry) {
    const user = auth().currentUser;
    if (!user) return;

    try {
      let imageUrl = entry.image;

      // If image is local, upload it
      if (entry.image && entry.image.startsWith('file://')) {
        const ref = storage().ref(`users/${user.uid}/images/${dateKey}.jpg`);
        await ref.putFile(entry.image);
        imageUrl = await ref.getDownloadURL();
      }

      // Save to Firestore
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('entries')
        .doc(dateKey)
        .set({
          text: entry.text,
          imageUrl: imageUrl, // Save the cloud URL or local path if failed?
          // We usually save cloud URL. But the app uses local path for display.
          // We might need a separate field for cloudUrl or just update logic.
          updatedAt: firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

      console.log(`Synced entry for ${dateKey}`);
    } catch (e) {
      console.error("Sync failed", e);
    }
  },

  subscribeToEntries(onUpdate: (entries: Record<string, DiaryEntry>) => void) {
    const user = auth().currentUser;
    if (!user) return () => { };

    return firestore()
      .collection('users')
      .doc(user.uid)
      .collection('entries')
      .onSnapshot(snapshot => {
        const newEntries: Record<string, DiaryEntry> = {};
        snapshot.forEach(doc => {
          const data = doc.data();
          newEntries[doc.id] = {
            text: data.text,
            image: data.imageUrl || data.image, // Handle both just in case
          };
        });
        onUpdate(newEntries);
      }, error => {
        console.error("Firestore subscription error", error);
      });
  }
};
