// ============================================================
// pages/NotFoundPage.jsx — 404 Page
// ============================================================
// React Router renders this when no route matches the URL.
// Configured as <Route path="*"> in App.jsx — the asterisk
// means "match anything that didn't match above".
// ============================================================

import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <main style={{
      paddingTop: '72px', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', textAlign: 'center', padding: '2rem',
    }}>
      {/* Big "404" in the ZEE-BMW primary color */}
      <div style={{
        fontFamily: 'Montserrat, sans-serif',
        fontSize: 'clamp(80px, 15vw, 160px)',
        fontWeight: 800,
        color: '#a1c9ff',
        lineHeight: 1,
        letterSpacing: '-0.04em',
        opacity: 0.15,
        userSelect: 'none',
        marginBottom: '-1rem',
      }}>
        404
      </div>

      <h1 style={{
        fontFamily: 'Montserrat, sans-serif',
        fontSize: '32px', fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '1rem',
      }}>
        Page Not Found
      </h1>

      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px', color: '#c1c7d3',
        maxWidth: '400px', lineHeight: 1.6,
        marginBottom: '2.5rem',
      }}>
        The page you're looking for doesn't exist or has been moved.
        Let's get you back on the road.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => navigate('/')}
          className="btn-primary"
          style={{ padding: '14px 32px' }}
        >
          GO HOME
        </button>
        <button
          onClick={() => navigate('/fleet')}
          className="btn-ghost"
          style={{ padding: '14px 32px' }}
        >
          BROWSE FLEET
        </button>
      </div>
    </main>
  )
}
