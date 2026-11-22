import { requireSupabase } from './supabase'

export async function registerWithEmail(email: string, password: string, displayName: string) {
  const client = requireSupabase()
  return client.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { display_name: displayName.trim() } },
  })
}

export async function loginWithEmail(email: string, password: string) {
  return requireSupabase().auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
}

export async function requestPasswordReset(email: string) {
  const client = requireSupabase()
  const redirectTo = window.location.origin + window.location.pathname
  return client.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo })
}

export async function logout() {
  return requireSupabase().auth.signOut()
}