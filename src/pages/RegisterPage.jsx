// ============================================================
// pages/RegisterPage.jsx — User Registration
// ============================================================
// FIX: Field component moved OUTSIDE RegisterPage so it doesn't
// get recreated on every keystroke (was causing focus loss bug)
// ============================================================

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── Field component — MUST be outside RegisterPage ───────────
// If defined inside the parent, React recreates it on every
// render, which destroys the input and loses focus.
// Defined outside = stable reference = no focus loss.
function Field({ label, name, value, onChange, type = 'text', placeholder, error, autoComplete }) {
  return (
    <div>
      <label style={{
        fontFamily: 'JetBrains Mono', fontSize: '10px',
        letterSpacing: '0.1em', color: '#c1c7d3',
        textTransform: 'uppercase', display: 'block', marginBottom: '8px',
      }}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete || name}
        className={`input-ghost ${error ? 'error' : ''}`}
      />
      {error && (
        <span style={{
          fontFamily: 'Inter', fontSize: '13px',
          color: '#ff8080', marginTop: '4px', display: 'block',
        }}>
          {error}
        </span>
      )}
    </div>
  )
}

// ── Main Register Page ────────────────────────────────────── 
export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate   = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })

  const [errors,   setErrors]   = useState({})
  const [apiError, setApiError] = useState('')
  const [success,  setSuccess]  = useState('')
  const [loading,  setLoading]  = useState(false)

  // One handler for ALL fields — e.target.name tells us which field
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  // Password strength indicator
  const getStrength = (pass) => {
    if (!pass) return { label: '', color: '', width: '0%' }
    if (pass.length < 6) return { label: 'TOO SHORT', color: '#ff6b6b', width: '20%' }
    let score = 0
    if (pass.length >= 8)          score++
    if (/[A-Z]/.test(pass))        score++
    if (/[0-9]/.test(pass))        score++
    if (/[^A-Za-z0-9]/.test(pass)) score++
    return [
      { label: 'WEAK',   color: '#ff9800', width: '35%' },
      { label: 'FAIR',   color: '#ffd740', width: '55%' },
      { label: 'GOOD',   color: '#69f0ae', width: '75%' },
      { label: 'STRONG', color: '#a1c9ff', width: '100%' },
    ][Math.min(score, 3)]
  }
  const strength = getStrength(form.password)

  // Validate all fields before submitting
  const validate = () => {
    const errs = {}
    if (!form.fullName.trim() || form.fullName.trim().length < 2)
      errs.fullName = 'Full name must be at least 2 characters'
    if (!form.email.trim())
      errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Enter a valid email address'
    if (!form.password)
      errs.password = 'Password is required'
    else if (form.password.length < 6)
      errs.password = 'Password must be at least 6 characters'
    if (!form.confirmPassword)
      errs.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match'
    if (form.phone && !/^\+?[\d\s\-()]{6,}$/.test(form.phone))
      errs.phone = 'Enter a valid phone number'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    setSuccess('')

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setLoading(true)

    try {
      await signUp({
        email:    form.email,
        password: form.password,
        fullName: form.fullName,
        phone:    form.phone,
      })
      setSuccess('Account created! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.')
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
        width: '100%', maxWidth: '480px',
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
            Create your account
          </p>
        </div>

        {/* Success */}
        {success && (
          <div style={{
            background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.3)',
            borderRadius: '4px', padding: '12px 16px',
            fontFamily: 'Inter', fontSize: '14px', color: '#69f0ae',
            marginBottom: '1.5rem',
          }}>
            ✓ {success}
          </div>
        )}

        {/* API Error */}
        {apiError && (
          <div style={{
            background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)',
            borderRadius: '4px', padding: '12px 16px',
            fontFamily: 'Inter', fontSize: '14px', color: '#ff8080',
            marginBottom: '1.5rem',
          }}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <Field
            label="Full Name"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            error={errors.fullName}
            autoComplete="name"
          />

          <Field
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="your@email.com"
            error={errors.email}
            autoComplete="email"
          />

          {/* Password with strength bar */}
          <div>
            <label style={{
              fontFamily: 'JetBrains Mono', fontSize: '10px',
              letterSpacing: '0.1em', color: '#c1c7d3',
              textTransform: 'uppercase', display: 'block', marginBottom: '8px',
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
              className={`input-ghost ${errors.password ? 'error' : ''}`}
            />
            {/* Strength bar */}
            {form.password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ height: '3px', background: '#2a2a2a', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '2px',
                    width: strength.width, background: strength.color,
                    transition: 'width 0.3s, background 0.3s',
                  }} />
                </div>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: strength.color, letterSpacing: '0.05em' }}>
                  {strength.label}
                </span>
              </div>
            )}
            {errors.password && (
              <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#ff8080', display: 'block', marginTop: '4px' }}>
                {errors.password}
              </span>
            )}
          </div>

          <Field
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <Field
            label="Phone (Optional)"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+961 70 000 000"
            error={errors.phone}
            autoComplete="tel"
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '16px', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontFamily: 'Inter', fontSize: '14px', color: '#c1c7d3', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#a1c9ff', textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
