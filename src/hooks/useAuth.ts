import { useState, useEffect, useCallback } from 'react'
import { auth, db } from '@/lib/firebase'
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore'
import type { User, UserRole } from '@/types'
import { toast } from 'sonner'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole>('publik')
  const [loading, setLoading] = useState(true)

  // ===============================
  // LISTEN AUTH STATE
  // ===============================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null)
          setUserRole('publik')
          setLoading(false)
          return
        }

        // Ambil data user berdasarkan UID
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid))

        if (!snap.exists()) {
          setUser(null)
          setUserRole('publik')
          setLoading(false)
          return
        }

        const data = snap.data() as User

        setUser({
          ...data,
          uid: firebaseUser.uid
        })

        setUserRole(data.role)
      } catch (err) {
        console.error(err)
        setUser(null)
        setUserRole('publik')
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  // ===============================
  // LOGIN DENGAN USERNAME
  // ===============================
  const login = useCallback(async (username: string, password: string) => {
    try {
      setLoading(true)

      const cleanUsername = username.trim().toLowerCase()

      // Cari user berdasarkan username
      const q = query(
        collection(db, 'users'),
        where('username', '==', cleanUsername)
      )

      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        toast.error('Username tidak ditemukan')
        return false
      }

      const userData = snapshot.docs[0].data()
      const email = userData.email

      // Login pakai email + password
      await signInWithEmailAndPassword(auth, email, password)

      toast.success('Login berhasil')
      return true

    } catch (error: any) {
      console.error('LOGIN ERROR:', error)
      toast.error(error.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // ===============================
  // LOGOUT
  // ===============================
  const logout = useCallback(async () => {
    await signOut(auth)
    setUser(null)
    setUserRole('publik')
    toast.success('Logout berhasil')
  }, [])

  return {
    user,
    userRole,
    loading,
    login,
    logout
  }
}