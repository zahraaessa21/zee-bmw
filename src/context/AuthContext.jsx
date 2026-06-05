// ============================================================
// context/AuthContext.jsx — Global Authentication State
// ============================================================
// React Context is like a "global variable" that any component
// can read without passing it through props manually.
//
// WHY WE NEED THIS:
// The user's login status is needed in EVERY page (navbar,
// protected routes, bookings page, admin panel).
// Instead of passing user={user} as a prop 10 levels deep,
// we "provide" it at the top level and any component can
// "consume" it directly with useAuth().
//
// HOW IT WORKS:
// 1. AuthProvider wraps the whole app in App.jsx
// 2. When the app loads, we check Supabase for a saved session
// 3. We listen for auth changes (login, logout, token refresh)
// 4. Any component calls useAuth() to get { user, signOut, etc. }
// ============================================================

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// 1. Create the Context — like creating an empty container
const AuthContext = createContext(null)

// ── AuthProvider Component ────────────────────────────────── 
// This wraps the whole app. It PROVIDES the auth state.
// Think of it as the "store manager" that holds all auth data.
export function AuthProvider({ children }) {
  // useState: holds the current logged-in user (or null)
  // user is either: null (logged out) or { id, email, ...metadata }
  const [user, setUser] = useState(null)
  
  // profile: extra data from our profiles table (name, phone, role)
  const [profile, setProfile] = useState(null)
  
  // loading: true while we're checking if a saved session exists
  // We show a loading screen until this is false
  const [loading, setLoading] = useState(true)

  // ── Fetch Profile from Database ──────────────────────────
  // After we get the user from auth, we fetch their profile row
  // from our custom profiles table to get name, phone, role
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')           // Table name
        .select('*')                // Get all columns
        .eq('id', userId)           // WHERE id = userId
        .single()                   // Expect exactly 1 row

      if (error) throw error
      setProfile(data)             // Save to state
    } catch (err) {
      console.warn('Profile fetch failed:', err.message)
      setProfile(null)
    }
  }

  // ── Check Existing Session on App Load ───────────────────
  // useEffect with empty [] runs ONCE when the component mounts.
  // This checks localStorage for a saved JWT token.
  useEffect(() => {
    // Get current session (returns null if not logged in)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)       // Set the user from saved session
        fetchProfile(session.user.id)
      }
      setLoading(false)             // Done checking, hide loading screen
    })

    // ── Listen for Auth Events ────────────────────────────
    // This is a "subscription" — it fires whenever auth state changes:
    // SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    // ── Cleanup Function ──────────────────────────────────
    // When the AuthProvider unmounts, cancel the subscription
    // to prevent memory leaks. React calls this automatically.
    return () => subscription.unsubscribe()
  }, []) // Empty array = run only once on mount

  // ── Auth Functions ────────────────────────────────────── 
  
  // REGISTER: Creates account + saves extra profile data
  const signUp = async ({ email, password, fullName, phone }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // This data gets stored in auth.users metadata
        // Our trigger automatically copies it to profiles table
        data: { full_name: fullName, phone }
      }
    })
    if (error) throw error
    return data
  }

  // LOGIN: Authenticates user and stores JWT in localStorage
  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  }

  // LOGOUT: Clears JWT from localStorage and resets state
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  // ── Computed Values ───────────────────────────────────── 
  // isAdmin: true only if the profile has role = 'admin'
  const isAdmin = profile?.role === 'admin'
  
  // displayName: best available name for showing in navbar
  const displayName = profile?.full_name || 
                      user?.user_metadata?.full_name || 
                      user?.email?.split('@')[0] || 
                      'User'

  // ── Context Value ─────────────────────────────────────── 
  // Everything we want to share with the rest of the app
  const value = {
    user,           // Supabase auth user object
    profile,        // Our custom profile (name, phone, role)
    loading,        // True while checking session
    isAdmin,        // Boolean: is user an admin?
    displayName,    // Best display name for UI
    signUp,         // Registration function
    signIn,         // Login function
    signOut,        // Logout function
    refreshProfile: () => user && fetchProfile(user.id)  // Refresh profile data
  }

  // Render children (the whole app) wrapped in the Provider
  // The Provider makes 'value' accessible to ALL descendants
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Custom Hook: useAuth() ────────────────────────────────── 
// This is the "consumer" — any component imports and calls this.
// Example: const { user, signOut, isAdmin } = useAuth()
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}
