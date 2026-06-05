// ============================================================
// pages/LoginPage.jsx — User Login
// ============================================================
// All JSX is written directly in the return — no sub-components
// defined inside this function, which prevents the focus loss bug.
// ============================================================

import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { signIn }  = useAuth()
  const navigate    = useNavigate()
  const location    = useLocation()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [errors,   setErrors]   = useState({})
  const [apiError, setApiError] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  const validate = () => {
    const errs = {}
    if (!email.trim())
      errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = 'Enter a valid email address'
    if (!password)
      errs.password = 'Password is required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setLoading(true)

    try {
      await signIn({ email, password })
      const from = location.state?.from || '/'
      navigate(from, { replace: true })
    } catch (err) {
      setApiError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{
      paddingTop: '72px', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div className="glass-card" style={{
        width: '100%', maxWidth: '440px',
        padding: '2.5rem', borderRadius: '8px',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontFamily: 'Montserrat', fontSize: '26px', fontWeight: 800,
            color: '#a1c9ff', textTransform: 'uppercase', letterSpacing: '-0.02em',
          }}>
            ULTRADRIVE
          </div>
          <p style={{ fontFamily: 'Inter', fontSize: '15px', color: '#c1c7d3', marginTop: '6px' }}>
            Sign in to your account
          </p>
        </div>

        {/* API Error */}
        {apiError && (
          <div style={{
            background: 'rgba(255,100,100,0.1)',
            border: '1px solid rgba(255,100,100,0.3)',
            borderRadius: '4px', padding: '12px 16px',
            fontFamily: 'Inter', fontSize: '14px', color: '#ff8080',
            marginBottom: '1.5rem',
          }}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Email */}
          <div>
            <label style={{
              fontFamily: 'JetBrains Mono', fontSize: '10px',
              letterSpacing: '0.1em', color: '#c1c7d3',
              textTransform: 'uppercase', display: 'block', marginBottom: '8px',
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              className={`input-ghost ${errors.email ? 'error' : ''}`}
            />
            {errors.email && (
              <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#ff8080', marginTop: '4px', display: 'block' }}>
                {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div>
            <label style={{
              fontFamily: 'JetBrains Mono', fontSize: '10px',
              letterSpacing: '0.1em', color: '#c1c7d3',
              textTransform: 'uppercase', display: 'block', marginBottom: '8px',
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`input-ghost ${errors.password ? 'error' : ''}`}
                style={{ paddingRight: '48px' }}
              />
              {/* Show / hide toggle */}
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#888',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  {showPass ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {errors.password && (
              <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#ff8080', marginTop: '4px', display: 'block' }}>
                {errors.password}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%', padding: '16px', marginTop: '0.5rem',
              opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {loading && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }}>
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              </svg>
            )}
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontFamily: 'Inter', fontSize: '14px', color: '#c1c7d3', marginTop: '1.5rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#a1c9ff', textDecoration: 'none', fontWeight: 600 }}>
            Register here
          </Link>
        </p>
      </div>
    </main>
  )
}
