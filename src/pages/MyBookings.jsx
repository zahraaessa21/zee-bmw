// ============================================================
// pages/MyBookings.jsx — User's Booking History
// ============================================================
// Shows all bookings for the logged-in user.
// This is a READ (GET) operation:
//   SELECT * FROM bookings WHERE user_id = current_user.id
//   JOIN with cars table to get car details
//
// ROW LEVEL SECURITY ensures users can ONLY see their own bookings.
// This is enforced at the DATABASE level, not just the frontend.
// ============================================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// Status colors for booking status badges
const STATUS_STYLES = {
  confirmed:  { bg: 'rgba(161,201,255,0.12)', color: '#a1c9ff',  border: 'rgba(161,201,255,0.3)' },
  active:     { bg: 'rgba(0,200,83,0.12)',    color: '#69f0ae',  border: 'rgba(0,200,83,0.3)' },
  completed:  { bg: 'rgba(255,255,255,0.06)', color: '#c1c7d3',  border: 'rgba(255,255,255,0.1)' },
  cancelled:  { bg: 'rgba(255,100,100,0.1)',  color: '#ff8080',  border: 'rgba(255,100,100,0.3)' },
  pending:    { bg: 'rgba(255,200,0,0.1)',    color: '#ffd740',  border: 'rgba(255,200,0,0.3)' },
}

export default function MyBookings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)

  // ── Fetch User's Bookings ─────────────────────────────── 
  useEffect(() => {
    if (!user) return
    
    const fetchBookings = async () => {
      try {
        // JOIN with cars table to get car details in one query
        // Supabase supports foreign key joins with select syntax
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            cars (
              id, model, series, type, year,
              image_url, horsepower, rent_price_daily
            )
          `)
          // RLS automatically filters to current user's rows
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setBookings(data || [])
      } catch (err) {
        console.warn('Using sample bookings')
        setBookings(SAMPLE_BOOKINGS)
      } finally {
        setLoading(false)
      }
    }
    
    fetchBookings()
  }, [user])

  // ── Cancel Booking ────────────────────────────────────── 
  // This is a PATCH/UPDATE operation
  const cancelBooking = async (bookingId) => {
    if (!confirm('Cancel this booking?')) return
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })      // UPDATE SET status = 'cancelled'
        .eq('id', bookingId)                  // WHERE id = bookingId
      
      if (error) throw error
      
      // Update local state so UI refreshes without re-fetching
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ))
    } catch (err) {
      alert('Failed to cancel: ' + err.message)
    }
  }

  if (loading) return (
    <div style={{ paddingTop: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <span style={{ color: '#a1c9ff', fontFamily: 'JetBrains Mono', fontSize: '12px', letterSpacing: '0.1em' }}>LOADING BOOKINGS...</span>
    </div>
  )

  return (
    <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '6rem 80px' }}>
        
        <h1 style={{ fontFamily: 'Montserrat', fontSize: '48px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          MY BOOKINGS
        </h1>
        <p style={{ fontFamily: 'Inter', color: '#c1c7d3', marginBottom: '3rem' }}>
          {bookings.length} reservation{bookings.length !== 1 ? 's' : ''} in your account
        </p>
        
        {bookings.length === 0 ? (
          // Empty state
          <div style={{ textAlign: 'center', padding: '6rem 0', color: '#c1c7d3' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', display: 'block', marginBottom: '1rem', opacity: 0.4 }}>calendar_today</span>
            <h3 style={{ fontFamily: 'Montserrat', textTransform: 'uppercase', marginBottom: '1rem' }}>No bookings yet</h3>
            <p style={{ marginBottom: '2rem' }}>Browse our fleet and book your first vehicle.</p>
            <button onClick={() => navigate('/fleet')} className="btn-primary" style={{ padding: '14px 32px' }}>
              BROWSE FLEET
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {bookings.map(booking => {
              const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.confirmed
              const car = booking.cars || {}
              const canCancel = ['confirmed', 'pending'].includes(booking.status)
              
              return (
                <article
                  key={booking.id}
                  className="glass-card animate-fadeUp"
                  style={{
                    padding: '2rem', borderRadius: '4px',
                    display: 'grid', gridTemplateColumns: 'auto 1fr auto',
                    gap: '2rem', alignItems: 'center',
                  }}
                >
                  {/* Car thumbnail */}
                  <div style={{
                    width: '120px', height: '80px',
                    background: '#1f2020', borderRadius: '4px', overflow: 'hidden', flexShrink: 0,
                  }}>
                    <img
                      src={car.image_url || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=300&q=60'}
                      alt={car.model}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  
                  {/* Booking info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                      <h3 style={{ fontFamily: 'Montserrat', fontSize: '18px', fontWeight: 600, textTransform: 'uppercase' }}>
                        {car.model || 'Vehicle'}
                      </h3>
                      {/* Status badge */}
                      <span style={{
                        fontFamily: 'JetBrains Mono', fontSize: '10px',
                        letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700,
                        padding: '3px 10px', borderRadius: '2px',
                        background: statusStyle.bg, color: statusStyle.color,
                        border: `1px solid ${statusStyle.border}`,
                      }}>
                        {booking.status}
                      </span>
                    </div>
                    
                    {/* Meta details */}
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                      {[
                        { icon: 'label', value: booking.booking_type?.toUpperCase() },
                        booking.start_date && { icon: 'calendar_today', value: `${booking.start_date} → ${booking.end_date}` },
                        { icon: 'location_on', value: booking.pickup_location },
                        { icon: 'verified_user', value: booking.insurance_tier },
                      ].filter(Boolean).map(({ icon, value }) => (
                        <span key={icon} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#c1c7d3', letterSpacing: '0.05em' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#a1c9ff' }}>{icon}</span>
                          {value}
                        </span>
                      ))}
                    </div>
                    
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#888', marginTop: '8px', letterSpacing: '0.05em' }}>
                      REF: UDR-{String(booking.id).padStart(5, '0')} · BOOKED {new Date(booking.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                    </p>
                  </div>
                  
                  {/* Price + Actions */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Montserrat', fontSize: '24px', fontWeight: 700, color: '#a1c9ff', marginBottom: '12px' }}>
                      ${Number(booking.total_price || 0).toLocaleString()}
                    </div>
                    {canCancel && (
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        style={{
                          fontFamily: 'JetBrains Mono', fontSize: '11px',
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                          background: 'transparent',
                          border: '1px solid rgba(255,100,100,0.3)',
                          color: '#ff8080', padding: '8px 16px',
                          cursor: 'pointer', borderRadius: '2px',
                        }}
                      >
                        CANCEL
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

// Sample data for demo
const SAMPLE_BOOKINGS = [
  { id: 1001, booking_type: 'rent', status: 'confirmed', start_date: '2025-01-15', end_date: '2025-01-18', pickup_location: 'Beirut Airport', insurance_tier: 'platinum', total_price: 1475, created_at: new Date().toISOString(), cars: { model: 'BMW M4 Competition', series: 'M Series', type: 'Coupe', year: 2024 } },
  { id: 1002, booking_type: 'rent', status: 'completed', start_date: '2024-12-20', end_date: '2024-12-22', pickup_location: 'Downtown Beirut', insurance_tier: 'executive', total_price: 1450, created_at: new Date().toISOString(), cars: { model: 'BMW X5 M Competition', series: 'X Series', type: 'SUV', year: 2024 } },
]
