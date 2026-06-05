// ============================================================
// components/Navbar.jsx — ZEE-BMW Fully Responsive Navbar
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
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    await signOut()
    setUserMenuOpen(false)
    setMobileOpen(false)
    navigate('/')
  }

  return (
    <>
      {/* ── Header bar ───────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 100,
        background: 'rgba(19,19,19,0.95)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
              className="hamburger-btn"
              style={{
                background: 'none', border: 'none',
                color: '#a1c9ff', cursor: 'pointer',
                padding: '6px', display: 'none',
                borderRadius: '4px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px', display: 'block' }}>
                {mobileOpen ? 'close' : 'menu'}
              </span>
            </button>

            <Link to="/" style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 'clamp(18px, 3vw, 24px)',
              fontWeight: 800,
              color: '#a1c9ff',
              textDecoration: 'none',
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
            }}>
              ZEE-BMW
            </Link>
          </div>

          {/* Center: desktop nav links */}
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
            {/* Admin link — desktop only, admin users only */}
            {isAdmin && (
              <Link to="/admin" style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
                textDecoration: 'none', color: '#a1c9ff',
                padding: '5px 12px',
                border: '1px solid rgba(161,201,255,0.4)',
                borderRadius: '3px',
                background: isActive('/admin') ? 'rgba(161,201,255,0.12)' : 'transparent',
                transition: 'all 0.2s',
              }}>ADMIN</Link>
            )}
          </nav>

          {/* Right: auth area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
            {user ? (
              <>
                {/* My bookings — desktop only */}
                <Link to="/my-bookings"
                  className="desktop-nav"
                  style={{
                    fontFamily: 'JetBrains Mono', fontSize: '11px',
                    letterSpacing: '0.08em', color: '#c1c7d3',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#a1c9ff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#c1c7d3'}
                >MY BOOKINGS</Link>

                {/* Avatar button */}
                <button onClick={() => setUserMenuOpen(o => !o)} style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  border: '1px solid rgba(161,201,255,0.35)',
                  background: 'rgba(161,201,255,0.1)',
                  color: '#a1c9ff',
                  fontFamily: 'JetBrains Mono', fontSize: '14px', fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {displayName.charAt(0).toUpperCase()}
                </button>

                {/* Desktop dropdown */}
                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', top: '50px', right: 0,
                    background: '#1a1a1a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px', padding: '8px 0',
                    minWidth: '220px', zIndex: 200,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                  }}>
                    {/* User info */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>
                        {displayName}
                      </div>
                      <div style={{ color: '#888', fontSize: '11px', fontFamily: 'JetBrains Mono', letterSpacing: '0.04em' }}>
                        {user.email}
                      </div>
                      {isAdmin && (
                        <span style={{
                          display: 'inline-block', marginTop: '6px',
                          fontFamily: 'JetBrains Mono', fontSize: '9px',
                          background: 'rgba(161,201,255,0.15)', color: '#a1c9ff',
                          border: '1px solid rgba(161,201,255,0.3)',
                          padding: '2px 8px', borderRadius: '2px', letterSpacing: '0.08em',
                        }}>
                          ADMIN
                        </span>
                      )}
                    </div>

                    <Link to="/my-bookings" onClick={() => setUserMenuOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '11px 16px', fontFamily: 'JetBrains Mono',
                      fontSize: '12px', color: '#c1c7d3', textDecoration: 'none',
                      letterSpacing: '0.05em', transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#a1c9ff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#c1c7d3'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_today</span>
                      MY BOOKINGS
                    </Link>

                    {/* Admin link in dropdown — only for admins */}
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '11px 16px', fontFamily: 'JetBrains Mono',
                        fontSize: '12px', color: '#a1c9ff', textDecoration: 'none',
                        letterSpacing: '0.05em', transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(161,201,255,0.07)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>dashboard</span>
                        ADMIN DASHBOARD
                      </Link>
                    )}

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: '4px', paddingTop: '4px' }}>
                      <button onClick={handleLogout} style={{
                        width: '100%', padding: '11px 16px',
                        background: 'none', border: 'none',
                        color: '#ff8080', fontSize: '12px',
                        fontFamily: 'JetBrains Mono', letterSpacing: '0.05em',
                        cursor: 'pointer', textAlign: 'left', textTransform: 'uppercase',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,100,100,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
                        SIGN OUT
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="desktop-nav" style={{
                  fontFamily: 'JetBrains Mono', fontSize: '12px',
                  fontWeight: 500, letterSpacing: '0.1em',
                  color: '#c1c7d3', textDecoration: 'none',
                }}>LOGIN</Link>
                <Link to="/register" style={{
                  fontFamily: 'JetBrains Mono', fontSize: '12px',
                  fontWeight: 700, letterSpacing: '0.1em',
                  color: '#00325a', textDecoration: 'none',
                  background: '#a1c9ff', padding: '8px 16px', borderRadius: '3px',
                  whiteSpace: 'nowrap',
                }}>REGISTER</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile slide-down menu ────────────────────────── */}
      <div
        className="mobile-menu"
        style={{
          position: 'fixed', top: '72px', left: 0, right: 0,
          zIndex: 99,
          background: 'rgba(15,15,15,0.98)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          maxHeight: mobileOpen ? '600px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'none',
        }}
      >
        <div style={{ padding: '8px var(--page-pad) 28px' }}>

          {/* User info bar — shown when logged in */}
          {user && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '16px 0',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              marginBottom: '8px',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                background: 'rgba(161,201,255,0.15)',
                border: '1px solid rgba(161,201,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Montserrat', fontWeight: 700, fontSize: '16px', color: '#a1c9ff',
              }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '14px' }}>{displayName}</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#888', letterSpacing: '0.04em' }}>{user.email}</div>
              </div>
              {isAdmin && (
                <span style={{
                  marginLeft: 'auto', fontFamily: 'JetBrains Mono', fontSize: '9px',
                  background: 'rgba(161,201,255,0.12)', color: '#a1c9ff',
                  border: '1px solid rgba(161,201,255,0.3)',
                  padding: '3px 8px', borderRadius: '2px', letterSpacing: '0.08em',
                }}>ADMIN</span>
              )}
            </div>
          )}

          {/* Nav links */}
          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            {NAV_LINKS.map(({ path, label }) => (
              <Link key={label} to={path} style={{
                fontFamily: 'JetBrains Mono', fontSize: '14px',
                letterSpacing: '0.1em', fontWeight: 600,
                textDecoration: 'none',
                color: isActive(path) ? '#a1c9ff' : '#c1c7d3',
                padding: '15px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                {label}
                <span className="material-symbols-outlined" style={{ fontSize: '18px', opacity: 0.35 }}>chevron_right</span>
              </Link>
            ))}

            {/* Admin section in burger — ONLY for admin users */}
            {isAdmin && (
              <Link to="/admin" style={{
                fontFamily: 'JetBrains Mono', fontSize: '14px', letterSpacing: '0.1em',
                fontWeight: 700, textDecoration: 'none',
                color: '#a1c9ff',
                padding: '15px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="material-symbols-outlined icon-filled" style={{ fontSize: '18px' }}>dashboard</span>
                  ADMIN DASHBOARD
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', opacity: 0.35 }}>chevron_right</span>
              </Link>
            )}

            {/* Authenticated links */}
            {user ? (
              <>
                <Link to="/my-bookings" style={{
                  fontFamily: 'JetBrains Mono', fontSize: '14px', letterSpacing: '0.1em',
                  textDecoration: 'none', color: '#c1c7d3',
                  padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#a1c9ff' }}>calendar_today</span>
                    MY BOOKINGS
                  </span>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', opacity: 0.35 }}>chevron_right</span>
                </Link>
                <button onClick={handleLogout} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'JetBrains Mono', fontSize: '14px', letterSpacing: '0.1em',
                  color: '#ff8080', padding: '15px 0', textAlign: 'left',
                  textTransform: 'uppercase', width: '100%',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                  SIGN OUT
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '12px', paddingTop: '20px' }}>
                <Link to="/login" className="btn-ghost" style={{
                  flex: 1, textAlign: 'center', padding: '14px',
                  textDecoration: 'none', display: 'block',
                  fontFamily: 'JetBrains Mono', fontSize: '13px', letterSpacing: '0.08em',
                }}>LOGIN</Link>
                <Link to="/register" className="btn-primary" style={{
                  flex: 1, textAlign: 'center', padding: '14px',
                  textDecoration: 'none', display: 'block',
                  fontFamily: 'JetBrains Mono', fontSize: '13px', letterSpacing: '0.08em',
                }}>REGISTER</Link>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Backdrop — closes dropdowns when clicking outside */}
      {(userMenuOpen || mobileOpen) && (
        <div
          onClick={() => { setUserMenuOpen(false) }}
          style={{ position: 'fixed', inset: 0, zIndex: 98 }}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .hamburger-btn { display: block !important; }
          .desktop-nav   { display: none !important; }
          .mobile-menu   { display: block !important; }
        }
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
        }
      `}</style>
    </>
  )
}
