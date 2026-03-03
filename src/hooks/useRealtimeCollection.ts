import { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  query,
  QueryConstraint
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface RealtimeReturn<T> {
  data: T[]
  loading: boolean
  error: string | null
}

export function useRealtimeCollection<T extends { id: string }>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): RealtimeReturn<T> {

  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {

    setLoading(true)

    const colRef = collection(db, collectionName)

    const q = constraints.length > 0
      ? query(colRef, ...constraints)
      : colRef

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {

        const result = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[]

        setData(result)
        setLoading(false)
      },
      (err) => {
        console.error('Realtime Error:', err)
        setError('Gagal mengambil data realtime')
        setLoading(false)
      }
    )

    return () => unsubscribe()

  }, [collectionName, JSON.stringify(constraints)])

  return { data, loading, error }
}