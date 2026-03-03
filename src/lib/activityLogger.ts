import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'

export async function logActivity(
  action: string,
  targetId?: string
) {
  if (!auth.currentUser) return

  await addDoc(collection(db, 'activity_logs'), {
    action,
    performedBy: auth.currentUser.uid,
    targetId: targetId ?? null,
    timestamp: serverTimestamp()
  })
}