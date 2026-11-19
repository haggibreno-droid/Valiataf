import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
} from 'firebase/auth'
import { firebaseAuth } from './firebase'

function requireAuth() {
  if (!firebaseAuth) throw new Error('Firebase ainda não foi configurado neste ambiente.')
  return firebaseAuth
}

export async function registerWithEmail(email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(requireAuth(), email.trim().toLowerCase(), password)
}

export async function loginWithEmail(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(requireAuth(), email.trim().toLowerCase(), password)
}

export async function requestPasswordReset(email: string): Promise<void> {
  const auth = requireAuth()
  auth.languageCode = 'pt-BR'
  await sendPasswordResetEmail(auth, email.trim().toLowerCase())
}

export async function logout(): Promise<void> {
  await signOut(requireAuth())
}
