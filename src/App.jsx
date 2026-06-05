// ============================================================
// App.jsx — Root Component & Router Configuration
// ============================================================
// This is the "skeleton" of the entire application.
// It sets up:
//   1. AuthProvider: wraps everything so all components have
//      access to the logged-in user's data
//   2. React Router: maps URL paths to page components
//      (like ASP.NET route attributes but on the frontend)
//   3. Navbar: shown on every page
//   4. ProtectedRoute: blocks pages that require login
//
// ROUTING ANALOGY (ASP.NET comparison):
//   ASP.NET:  [Route("/cars")]  on a Controller
//   React:    <Route path="/fleet" element={<FleetPage />} />
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Import all page components
import Navbar          from './components/Navbar'
import HomePage        from './pages/HomePage'
import FleetPage       from './pages/FleetPage'
import CarDetailPage   from './pages/CarDetailPage'
import BookingPage     from './pages/BookingPage'
import LoginPage       from './pages/LoginPage'
import RegisterPage    from './pages/RegisterPage'
import MyBookings      from './pages/MyBookings'
import AdminPage       from './pages/AdminPage'
import NotFoundPage    from './pages/NotFoundPage'
import ServicesPage    from './pages/ServicesPage'
import ExperiencePage  from './pages/ExperiencePage'

// ── Protected Route Component ─────────────────────────────── 
// This component acts like [Authorize] in ASP.NET.
// If the user is not logged in, redirect to /login.
// If adminOnly=true and user is not admin, redirect to home.
// Otherwise, render the protected page normally.
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin, loading } = useAuth()
  
  // While checking session, don't redirect yet
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#131313'
    }}>
      <div style={{ color: '#a1c9ff', fontFamily: 'JetBrains Mono', fontSize: 12, letterSpacing: '0.1em' }}>
        LOADING...
      </div>
    </div>
  )
  
  // Not logged in → redirect to login page
  if (!user) return <Navigate to="/login" replace />
  
  // Logged in but not admin, and page requires admin
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />
  
  // All checks passed → show the page
  return children
}

// ── Main App Component ────────────────────────────────────── 
export default function App() {
  return (
    // AuthProvider must wrap everything so all routes/pages
    // can access user state via useAuth()
    <AuthProvider>
      {/* BrowserRouter enables URL-based navigation */}
      {/* Without this, clicking links would reload the page */}
      <BrowserRouter>
        {/* Navbar is outside <Routes> so it renders on ALL pages */}
        <Navbar />
        
        {/* Routes: React looks at the current URL and renders
            the matching Route's element */}
        <Routes>
          {/* Public routes — anyone can access */}
          <Route path="/"            element={<HomePage />} />
          <Route path="/fleet"       element={<FleetPage />} />
          <Route path="/cars/:id"    element={<CarDetailPage />} />
          <Route path="/login"       element={<LoginPage />} />
          <Route path="/register"    element={<RegisterPage />} />
          <Route path="/services"    element={<ServicesPage />} />
          <Route path="/experience"  element={<ExperiencePage />} />
          
          {/* Protected routes — must be logged in */}
          <Route path="/book/:id" element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          } />
          
          <Route path="/my-bookings" element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          } />
          
          {/* Admin route — must be logged in AND have admin role */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AdminPage />
            </ProtectedRoute>
          } />
          
          {/* Catch-all: any unknown URL → 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
