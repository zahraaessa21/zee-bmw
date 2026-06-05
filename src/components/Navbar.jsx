// ============================================================
// components/Navbar.jsx — Fully Responsive Navigation
// ============================================================
// Desktop: horizontal links across the top
// Mobile:  hamburger button → slide-down menu panel
//
// REACT CONCEPTS:
//   - useState: mobileOpen (menu open/closed), userMenuOpen (dropdown)
//   - useLocation: highlight the active nav link
//   - useEffect: close mobile menu when route changes
// ============================================================

import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = [
  { path: '/fleet',       label: 'FLEET' },
  { path: '/services',    label: 'SERVICES' },
  { path: '/experience',  label: 'EXPERIENCE' },
]

export default function Navbar() {
  const { user, isAdmin, displayName, signOut } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Close mobile menu whenever route changes
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    await signOut()
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <>
      {/* ── Main header bar ──────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 100,
        background: 'rgba(19,19,19,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        height: '72px',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 var(--page-pad)',
          height: '100%',
          maxWidth: '1440px', margin: '0 auto',
        }}>

          {/* Left: hamburger + logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Hamburger — only visible on mobile */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
              style={{
                background: 'none', border: 'none',
                color: '#a1c9ff', cursor: 'pointer',
                padding: '4px', display: 'none',
              }}
              className="hamburger-btn"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>
                {mobileOpen ? 'close' : 'menu'}
              </span>
            </button>

            <Link to="/" style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 'clamp(20px, 3vw, 26px)',
              fontWeight: 800,
              color: '#a1c9ff',
              textDecoration: 'none',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
            }}>
              ZEE-BMW
            </Link>
          </div>

          {/* Center nav — hidden on mobile */}
          <nav className="desktop-nav" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {NAV_LINKS.map(({ path, label }) => (
              <Link key={label} to={path} style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '12px',
                fontWeight: isActive(path) ? 700 : 500,
                letterSpacing: '0.1em',
                textDecoration: 'none',
                color: isActive(path) ? '#a1c9ff' : '#c1c7d3',
                transition: 'color 0.2s',
                paddingBottom: '2px',
                borderBottom: isActive(path) ? '1px solid #a1c9ff' : '1px solid transparent',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#a1c9ff'}
              onMouseLeave={e => e.currentTarget.style.color = isActive(path) ? '#a1c9ff' : '#c1c7d3'}
              >
                {label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
                textDecoration: 'none', color: '#a1c9ff',
                padding: '4px 12px',
                border: '1px solid rgba(161,201,255,0.35)',
                borderRadius: '2px',
              }}>ADMIN</Link>
            )}
          </nav>

          {/* Right: auth buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
            {user ? (
              <>
                <Link to="/my-bookings"
                  className="desktop-nav"
                  style={{
                    fontFamily: 'JetBrains Mono', fontSize: '11px',
                    letterSpacing: '0.08em', color: '#c1c7d3',
                    textDecoration: 'none', display: 'none',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#a1c9ff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#c1c7d3'}
                >MY BOOKINGS</Link>

                <button onClick={() => setUserMenuOpen(o => !o)} style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  border: '1px solid rgba(161,201,255,0.35)',
                  background: 'rgba(161,201,255,0.1)',
                  color: '#a1c9ff',
                  fontFamily: 'JetBrains Mono', fontSize: '14px', fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {displayName.charAt(0).toUpperCase()}
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', top: '50px', right: 0,
                    background: '#1f2020',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px', padding: '8px 0',
                    minWidth: '210px', zIndex: 200,
                    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{displayName}</div>
                      <div style={{ color: '#c1c7d3', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>{user.email}</div>
                    </div>
                    <Link to="/my-bookings" onClick={() => setUserMenuOpen(false)}
                      style={{ display: 'block', padding: '10px 16px', fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#c1c7d3', textDecoration: 'none', letterSpacing: '0.05em' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#a1c9ff'}
                      onMouseLeave={e => e.currentTarget.style.color = '#c1c7d3'}
                    >MY BOOKINGS</Link>
                    <button onClick={handleLogout} style={{
                      width: '100%', padding: '10px 16px',
                      background: 'none', border: 'none',
                      color: '#ffb4ab', fontSize: '12px',
                      fontFamily: 'JetBrains Mono', letterSpacing: '0.05em',
                      cursor: 'pointer', textAlign: 'left', textTransform: 'uppercase',
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '15px', marginRight: '8px' }}>logout</span>
                      SIGN OUT
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <Link to="/login" style={{
                  fontFamily: 'JetBrains Mono', fontSize: '12px',
                  fontWeight: 500, letterSpacing: '0.1em',
                  color: '#c1c7d3', textDecoration: 'none',
                }}>LOGIN</Link>
                <Link to="/register" style={{
                  fontFamily: 'JetBrains Mono', fontSize: '12px',
                  fontWeight: 700, letterSpacing: '0.1em',
                  color: '#00325a', textDecoration: 'none',
                  background: '#a1c9ff', padding: '8px 18px', borderRadius: '2px',
                }}>REGISTER</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile slide-down menu ────────────────────────── */}
      <div style={{
        position: 'fixed', top: '72px', left: 0, right: 0,
        zIndex: 99,
        background: 'rgba(19,19,19,0.97)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: mobileOpen ? '24px var(--page-pad) 32px' : '0 var(--page-pad)',
        maxHeight: mobileOpen ? '400px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.35s ease, padding 0.3s ease',
        display: 'none',
      }} className="mobile-menu">
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV_LINKS.map(({ path, label }) => (
            <Link key={label} to={path} style={{
              fontFamily: 'JetBrains Mono', fontSize: '14px',
              letterSpacing: '0.1em', fontWeight: 600,
              textDecoration: 'none',
              color: isActive(path) ? '#a1c9ff' : '#c1c7d3',
              padding: '14px 0',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              {label}
              <span className="material-symbols-outlined" style={{ fontSize: '18px', opacity: 0.4 }}>chevron_right</span>
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" style={{
              fontFamily: 'JetBrains Mono', fontSize: '14px', letterSpacing: '0.1em',
              fontWeight: 600, textDecoration: 'none', color: '#a1c9ff',
              padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              ADMIN PANEL
              <span className="material-symbols-outlined" style={{ fontSize: '18px', opacity: 0.4 }}>chevron_right</span>
            </Link>
          )}
          {user ? (
            <>
              <Link to="/my-bookings" style={{
                fontFamily: 'JetBrains Mono', fontSize: '14px', letterSpacing: '0.1em',
                textDecoration: 'none', color: '#c1c7d3',
                padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                MY BOOKINGS
                <span className="material-symbols-outlined" style={{ fontSize: '18px', opacity: 0.4 }}>chevron_right</span>
              </Link>
              <button onClick={handleLogout} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'JetBrains Mono', fontSize: '14px', letterSpacing: '0.1em',
                color: '#ffb4ab', padding: '14px 0', textAlign: 'left', textTransform: 'uppercase',
              }}>SIGN OUT</button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '12px', paddingTop: '20px' }}>
              <Link to="/login" className="btn-ghost" style={{ flex: 1, textAlign: 'center', padding: '14px', textDecoration: 'none', display: 'block' }}>LOGIN</Link>
              <Link to="/register" className="btn-primary" style={{ flex: 1, textAlign: 'center', padding: '14px', textDecoration: 'none', display: 'block' }}>REGISTER</Link>
            </div>
          )}
        </nav>
      </div>

      {/* Backdrop to close user menu */}
      {userMenuOpen && (
        <div onClick={() => setUserMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
      )}

      <style>{`
        @media (max-width: 768px) {
          .hamburger-btn  { display: block !important; }
          .desktop-nav    { display: none !important; }
          .mobile-menu    { display: block !important; }
        }
        @media (min-width: 769px) {
          .desktop-nav    { display: flex !important; }
        }
      `}</style>
    </>
  )
}
