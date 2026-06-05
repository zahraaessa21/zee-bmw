// ============================================================
// pages/MyBookings.jsx — User's Booking History
// ============================================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const STATUS_STYLES = {
  confirmed: { bg: 'rgba(161,201,255,0.12)', color: '#a1c9ff', border: 'rgba(161,201,255,0.3)' },
  active:    { bg: 'rgba(0,200,83,0.12)',    color: '#69f0ae', border: 'rgba(0,200,83,0.3)' },
  completed: { bg: 'rgba(255,255,255,0.06)', color: '#c1c7d3', border: 'rgba(255,255,255,0.1)' },
  cancelled: { bg: 'rgba(255,100,100,0.1)',  color: '#ff8080', border: 'rgba(255,100,100,0.3)' },
  pending:   { bg: 'rgba(255,200,0,0.1)',    color: '#ffd740', border: 'rgba(255,200,0,0.3)' },
}

export default function MyBookings() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    if (!user) return
    fetchBookings()
  }, [user])

  const fetchBookings = async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          cars (
            id, model, series, type, year,
            image_url, horsepower, rent_price_daily
          )
        `)
        .eq('user_id', user.id)        // explicitly filter by user_id
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (err) {
      console.error('Bookings error:', err)
      setError(err.message)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  // ── Cancel booking — fixed RLS issue ──────────────────── 
  const cancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    
    setCancelling(bookingId)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('user_id', user.id)    // extra safety: only cancel YOUR booking

      if (error) throw error

      // Update UI without re-fetching
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ))
    } catch (err) {
      alert('Failed to cancel: ' + err.message)
    } finally {
      setCancelling(null)
    }
  }

  if (loading) return (
    <div style={{ paddingTop: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a1c9ff" strokeWidth="2" style={{ animation: 'spin 0.8s linear infinite' }}>
          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </svg>
        <span style={{ color: '#a1c9ff', fontFamily: 'JetBrains Mono', fontSize: '12px', letterSpacing: '0.1em' }}>LOADING BOOKINGS...</span>
      </div>
    </div>
  )

  return (
    <main style={{ paddingTop: '72px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--section-gap) var(--page-pad)' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{
            fontFamily: 'Montserrat', fontWeight: 700,
            fontSize: 'clamp(28px, 4vw, 48px)',
            textTransform: 'uppercase', marginBottom: '8px',
          }}>
            MY BOOKINGS
          </h1>
          <p style={{ fontFamily: 'Inter', color: '#c1c7d3', fontSize: '15px' }}>
            {bookings.length} reservation{bookings.length !== 1 ? 's' : ''} in your account
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div style={{
            background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)',
            borderRadius: '6px', padding: '16px 20px', marginBottom: '24px',
            fontFamily: 'Inter', fontSize: '14px', color: '#ff8080',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>error</span>
            {error}
            <button onClick={fetchBookings} style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono', fontSize: '11px', background: 'transparent', border: '1px solid rgba(255,100,100,0.3)', color: '#ff8080', padding: '6px 12px', cursor: 'pointer', borderRadius: '3px' }}>
              RETRY
            </button>
          </div>
        )}

        {/* Empty state */}
        {!error && bookings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#c1c7d3' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '56px', display: 'block', marginBottom: '1rem', opacity: 0.25, color: '#a1c9ff' }}>calendar_today</span>
            <h3 style={{ fontFamily: 'Montserrat', textTransform: 'uppercase', fontSize: '20px', marginBottom: '12px' }}>No bookings yet</h3>
            <p style={{ fontFamily: 'Inter', fontSize: '15px', marginBottom: '2rem', maxWidth: '360px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
              Browse our fleet and book your first vehicle experience.
            </p>
            <button onClick={() => navigate('/fleet')} className="btn-primary" style={{ padding: '14px 36px' }}>
              BROWSE FLEET
            </button>
          </div>
        )}

        {/* Bookings list */}
        {bookings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bookings.map(booking => {
              const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.confirmed
              const car         = booking.cars || {}
              const canCancel   = ['confirmed', 'pending'].includes(booking.status)
              const isCancelling = cancelling === booking.id

              return (
                <article
                  key={booking.id}
                  className="glass-card animate-fadeUp"
                  style={{ borderRadius: '8px', overflow: 'hidden', transition: 'border-color 0.2s' }}
                >
                  {/* Top: car image + main info */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr auto',
                    gap: '1.25rem',
                    padding: '1.25rem',
                    alignItems: 'center',
                  }} className="booking-card-grid">

                    {/* Car thumbnail */}
                    <div style={{
                      width: '100px', height: '68px',
                      background: '#1a1a1a', borderRadius: '4px', overflow: 'hidden', flexShrink: 0,
                    }}>
                      <img
                        src={car.image_url || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=300&q=60'}
                        alt={car.model || 'Vehicle'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    {/* Info */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                        <h3 style={{
                          fontFamily: 'Montserrat', fontSize: 'clamp(14px, 2vw, 18px)',
                          fontWeight: 700, textTransform: 'uppercase',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {car.model || 'Vehicle'}
                        </h3>
                        {/* Status badge */}
                        <span style={{
                          fontFamily: 'JetBrains Mono', fontSize: '10px',
                          letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700,
                          padding: '3px 10px', borderRadius: '2px', flexShrink: 0,
                          background: statusStyle.bg, color: statusStyle.color,
                          border: `1px solid ${statusStyle.border}`,
                        }}>
                          {booking.status}
                        </span>
                      </div>

                      {/* Meta row */}
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        {[
                          { icon: 'label',          value: booking.booking_type?.toUpperCase() },
                          booking.start_date && { icon: 'calendar_today', value: `${booking.start_date} → ${booking.end_date}` },
                          booking.pickup_location && { icon: 'location_on', value: booking.pickup_location },
                          booking.insurance_tier && { icon: 'verified_user', value: booking.insurance_tier },
                        ].filter(Boolean).map(({ icon, value }) => value && (
                          <span key={icon} style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            fontFamily: 'JetBrains Mono', fontSize: '11px',
                            color: '#888', letterSpacing: '0.04em',
                            whiteSpace: 'nowrap',
                          }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#a1c9ff' }}>{icon}</span>
                            {value}
                          </span>
                        ))}
                      </div>

                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#555', marginTop: '6px', letterSpacing: '0.04em' }}>
                        REF: ZEE-{String(booking.id).padStart(5, '0')} · {new Date(booking.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                      </p>
                    </div>

                    {/* Price + actions */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontFamily: 'Montserrat', fontSize: 'clamp(18px, 2.5vw, 24px)',
                        fontWeight: 700, color: '#a1c9ff', marginBottom: '10px',
                      }}>
                        ${Number(booking.total_price || 0).toLocaleString()}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {/* View car button */}
                        <button
                          onClick={() => navigate(`/cars/${car.id}`)}
                          style={{
                            fontFamily: 'JetBrains Mono', fontSize: '10px',
                            letterSpacing: '0.06em', textTransform: 'uppercase',
                            background: 'transparent',
                            border: '1px solid rgba(161,201,255,0.25)',
                            color: '#a1c9ff', padding: '7px 12px',
                            cursor: 'pointer', borderRadius: '3px',
                            transition: 'all 0.2s',
                          }}
                        >
                          VIEW CAR
                        </button>

                        {/* Cancel button */}
                        {canCancel && (
                          <button
                            onClick={() => cancelBooking(booking.id)}
                            disabled={isCancelling}
                            style={{
                              fontFamily: 'JetBrains Mono', fontSize: '10px',
                              letterSpacing: '0.06em', textTransform: 'uppercase',
                              background: isCancelling ? 'rgba(255,100,100,0.15)' : 'transparent',
                              border: '1px solid rgba(255,100,100,0.3)',
                              color: '#ff8080', padding: '7px 12px',
                              cursor: isCancelling ? 'wait' : 'pointer',
                              borderRadius: '3px', transition: 'all 0.2s',
                              opacity: isCancelling ? 0.7 : 1,
                            }}
                          >
                            {isCancelling ? 'CANCELLING...' : 'CANCEL'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {/* Responsive style for booking card */}
      <style>{`
        @media (max-width: 600px) {
          .booking-card-grid {
            grid-template-columns: 80px 1fr !important;
            grid-template-rows: auto auto !important;
          }
          .booking-card-grid > *:last-child {
            grid-column: 1 / -1;
            text-align: left !important;
            border-top: 1px solid rgba(255,255,255,0.05);
            padding-top: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
        }
      `}</style>
    </main>
  )
}
