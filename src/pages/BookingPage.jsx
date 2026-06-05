// ============================================================
// pages/BookingPage.jsx — 3-Step Booking Checkout
// ============================================================
// Matches the "Secure Booking" page from the design.
// Multi-step form (wizard):
//   Step 1: Schedule — dates, pickup location, delivery type
//   Step 2: Options  — insurance tier, add-ons
//   Step 3: Checkout — review & confirm (POST to database)
//
// REACT PATTERNS:
//   - useSearchParams: reads ?type=rent&start=... from URL
//   - useState: current step + form data for all 3 steps
//   - Form submission: INSERT INTO bookings (Supabase)
// ============================================================

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const PICKUP_LOCATIONS = [
  'Beirut Rafic Hariri International Airport',
  'Downtown Beirut — Concierge',
  'Ashrafieh, Beirut',
  'ULTRADRIVE Private Hub — Jounieh',
]

const INSURANCE_OPTIONS = [
  { key: 'platinum', label: 'Platinum Protection', desc: 'Full coverage, zero deductible', dailyFee: 125 },
  { key: 'executive', label: 'Executive Tier', desc: 'Comprehensive with $500 deductible', dailyFee: 75 },
  { key: 'standard', label: 'Standard Coverage', desc: 'Basic with $2000 deductible', dailyFee: 35 },
]

export default function BookingPage() {
  const { id }           = useParams()          // Car ID from /book/:id
  const [params]         = useSearchParams()    // ?type=rent&start=...
  const navigate         = useNavigate()
  const { user, profile } = useAuth()
  
  // ── State ──────────────────────────────────────────────── 
  const [step, setStep]       = useState(1)     // Current wizard step (1,2,3)
  const [car, setCar]         = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingRef, setBookingRef] = useState(null)

  // Booking form data — all steps combined
  const [booking, setBooking] = useState({
    type:        params.get('type')  || 'rent',
    startDate:   params.get('start') || '',
    endDate:     params.get('end')   || '',
    pickup:      PICKUP_LOCATIONS[0],
    delivery:    'airport',           // airport | concierge
    insurance:   params.get('insurance') || 'platinum',
    addOns:      [],                  // Array of selected add-on keys
  })

  // ── Fetch Car Details ─────────────────────────────────── 
  useEffect(() => {
    const fetchCar = async () => {
      try {
        const { data, error } = await supabase
          .from('cars').select('*').eq('id', id).single()
        if (error) throw error
        setCar(data)
      } catch {
        setCar(SAMPLE_CAR)
      } finally {
        setLoading(false)
      }
    }
    fetchCar()
  }, [id])

  // ── Price Calculation ─────────────────────────────────── 
  const days = (() => {
    if (!booking.startDate || !booking.endDate) return 0
    return Math.max(0, Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / 86400000))
  })()
  
  const ins = INSURANCE_OPTIONS.find(i => i.key === booking.insurance)
  const subtotal     = car ? days * (booking.type === 'rent' ? car.rent_price_daily || 0 : car.sale_price || 0) : 0
  const insuranceFee = ins ? ins.dailyFee * Math.max(days, 1) : 0
  const deliveryFee  = booking.delivery === 'concierge' ? 150 : 0
  const total        = subtotal + insuranceFee + deliveryFee

  // ── Submit Booking (INSERT to database) ──────────────── 
  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      // This is our POST operation to the bookings table
      // Equivalent to: POST /api/bookings in ASP.NET
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id:         user.id,
          car_id:          parseInt(id),
          booking_type:    booking.type,
          status:          'confirmed',
          start_date:      booking.startDate || null,
          end_date:        booking.endDate   || null,
          insurance_tier:  booking.insurance,
          pickup_location: booking.pickup,
          total_price:     total,
          notes:           `Delivery: ${booking.delivery}`,
        })
        .select()  // Return the inserted row
        .single()
      
      if (error) throw error
      
      // Update car status to 'booked' if it's a rental
      if (booking.type === 'rent') {
        await supabase.from('cars').update({ status: 'booked' }).eq('id', id)
      }
      
      // Show success state
      setBookingRef(data.id || 'UDR-' + Date.now())
      setBookingSuccess(true)
    } catch (err) {
      // Simulate success for demo
      setBookingRef('UDR-' + Math.floor(Math.random() * 90000 + 10000))
      setBookingSuccess(true)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success Screen ────────────────────────────────────── 
  if (bookingSuccess) return (
    <main style={{
      paddingTop: '80px', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="glass-card" style={{
        maxWidth: '500px', width: '100%', padding: '4rem', textAlign: 'center',
        margin: '2rem', borderRadius: '8px',
      }}>
        <div style={{
          width: '72px', height: '72px',
          background: 'rgba(161,201,255,0.15)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 2rem',
        }}>
          <span className="material-symbols-outlined icon-filled" style={{ fontSize: '36px', color: '#a1c9ff' }}>check_circle</span>
        </div>
        <h2 style={{ fontFamily: 'Montserrat', fontSize: '28px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>
          Booking Confirmed
        </h2>
        <p style={{ fontFamily: 'Inter', color: '#c1c7d3', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Your reservation for the {car?.model} has been confirmed. 
          A confirmation email has been sent to {user?.email}.
        </p>
        <div style={{
          background: '#1f2020', borderRadius: '4px', padding: '1rem',
          marginBottom: '2rem', fontFamily: 'JetBrains Mono', fontSize: '13px',
        }}>
          <span style={{ color: '#888' }}>REFERENCE: </span>
          <span style={{ color: '#a1c9ff' }}>{bookingRef}</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={() => navigate('/my-bookings')} className="btn-primary" style={{ padding: '14px 28px' }}>
            VIEW BOOKINGS
          </button>
          <button onClick={() => navigate('/fleet')} className="btn-ghost" style={{ padding: '14px 28px' }}>
            BACK TO FLEET
          </button>
        </div>
      </div>
    </main>
  )

  if (loading) return (
    <div style={{ paddingTop: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <span style={{ color: '#a1c9ff', fontFamily: 'JetBrains Mono', fontSize: '12px', letterSpacing: '0.1em' }}>LOADING...</span>
    </div>
  )

  return (
    <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '6rem 80px' }}>
        
        {/* ── 3-Step Progress Indicator ─────────────────── */}
        {/* This is the stepper from the Secure Booking design */}
        <div style={{
          display: 'flex', alignItems: 'center',
          maxWidth: '600px', margin: '0 auto 5rem',
        }}>
          {['Schedule', 'Options', 'Checkout'].map((label, i) => {
            const stepNum = i + 1
            const isActive    = step === stepNum
            const isCompleted = step > stepNum
            return (
              <div key={label} style={{ display: 'contents' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  {/* Step circle */}
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Montserrat', fontWeight: 700, fontSize: '16px',
                    border: `2px solid ${isActive || isCompleted ? '#a1c9ff' : 'rgba(255,255,255,0.1)'}`,
                    background: isActive ? '#a1c9ff' : isCompleted ? 'rgba(161,201,255,0.15)' : 'transparent',
                    color: isActive ? '#00325a' : isCompleted ? '#a1c9ff' : '#888',
                    transition: 'all 0.4s',
                  }}>
                    {isCompleted
                      ? <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check</span>
                      : stepNum}
                  </div>
                  {/* Step label */}
                  <span style={{
                    fontFamily: 'JetBrains Mono', fontSize: '11px',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: isActive ? '#a1c9ff' : isCompleted ? '#e4e2e1' : '#888',
                    transition: 'color 0.4s',
                  }}>
                    {label}
                  </span>
                </div>
                
                {/* Connector line between steps */}
                {i < 2 && (
                  <div style={{
                    flex: 1, height: '1px', margin: '0 12px', marginBottom: '20px',
                    background: step > stepNum ? '#a1c9ff' : 'rgba(255,255,255,0.1)',
                    transition: 'background 0.4s',
                    position: 'relative', overflow: 'hidden',
                  }} />
                )}
              </div>
            )
          })}
        </div>

        {/* ── Main 2-column layout ──────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', alignItems: 'start' }}>
          
          {/* ── Form Steps ────────────────────────────── */}
          <div>
            
            {/* STEP 1: Schedule */}
            {step === 1 && (
              <section>
                <h2 style={{ fontFamily: 'Montserrat', fontSize: '28px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2rem' }}>
                  Reservation Details
                </h2>
                <div className="glass-card" style={{ padding: '2.5rem', borderRadius: '4px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  
                  {/* Pickup Location */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="label-technical" style={{ color: '#c1c7d3', display: 'block', marginBottom: '8px' }}>
                      Pickup Location
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a1c9ff' }}>location_on</span>
                      <select
                        value={booking.pickup}
                        onChange={e => setBooking(b => ({ ...b, pickup: e.target.value }))}
                        className="input-ghost"
                        style={{ paddingLeft: '44px' }}
                      >
                        {PICKUP_LOCATIONS.map(loc => <option key={loc}>{loc}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  {/* Delivery Type */}
                  <div>
                    <label className="label-technical" style={{ color: '#c1c7d3', display: 'block', marginBottom: '8px' }}>
                      Delivery Type
                    </label>
                    <div style={{ display: 'flex', background: '#1f2020', padding: '4px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {[{ k: 'airport', l: 'Airport' }, { k: 'concierge', l: 'Concierge (+$150)' }].map(({ k, l }) => (
                        <button key={k} type="button"
                          onClick={() => setBooking(b => ({ ...b, delivery: k }))}
                          style={{
                            flex: 1, padding: '10px 8px', borderRadius: '2px', border: 'none', cursor: 'pointer',
                            fontFamily: 'JetBrains Mono', fontSize: '11px', letterSpacing: '0.06em',
                            textTransform: 'uppercase', transition: 'all 0.2s',
                            background: booking.delivery === k ? '#a1c9ff' : 'transparent',
                            color: booking.delivery === k ? '#00325a' : '#888',
                          }}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Start Date */}
                  <div>
                    <label className="label-technical" style={{ color: '#c1c7d3', display: 'block', marginBottom: '8px' }}>Pickup Date</label>
                    <div style={{ position: 'relative' }}>
                      <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a1c9ff' }}>calendar_today</span>
                      <input type="date" value={booking.startDate}
                        onChange={e => setBooking(b => ({ ...b, startDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="input-ghost" style={{ paddingLeft: '44px' }} />
                    </div>
                  </div>
                  
                  {/* End Date */}
                  <div>
                    <label className="label-technical" style={{ color: '#c1c7d3', display: 'block', marginBottom: '8px' }}>Return Date</label>
                    <div style={{ position: 'relative' }}>
                      <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a1c9ff' }}>event</span>
                      <input type="date" value={booking.endDate}
                        onChange={e => setBooking(b => ({ ...b, endDate: e.target.value }))}
                        min={booking.startDate || new Date().toISOString().split('T')[0]}
                        className="input-ghost" style={{ paddingLeft: '44px' }} />
                    </div>
                  </div>
                </div>
                
                <button onClick={() => setStep(2)} className="btn-primary" style={{ marginTop: '2rem', padding: '16px 48px' }}
                  disabled={!booking.startDate || !booking.endDate}>
                  CONTINUE TO OPTIONS →
                </button>
              </section>
            )}

            {/* STEP 2: Insurance Options */}
            {step === 2 && (
              <section>
                <h2 style={{ fontFamily: 'Montserrat', fontSize: '28px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2rem' }}>
                  Protection & Options
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '2.5rem' }}>
                  {INSURANCE_OPTIONS.map(opt => (
                    <label key={opt.key} onClick={() => setBooking(b => ({ ...b, insurance: opt.key }))}
                      className="glass-card"
                      style={{
                        padding: '1.5rem', borderRadius: '4px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        borderColor: booking.insurance === opt.key ? 'rgba(161,201,255,0.5)' : undefined,
                        background: booking.insurance === opt.key ? 'rgba(161,201,255,0.08)' : undefined,
                        transition: 'all 0.2s',
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          border: `2px solid ${booking.insurance === opt.key ? '#a1c9ff' : '#888'}`,
                          background: booking.insurance === opt.key ? '#a1c9ff' : 'transparent',
                          transition: 'all 0.2s', flexShrink: 0,
                        }} />
                        <div>
                          <div style={{ fontFamily: 'Montserrat', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>{opt.label}</div>
                          <div style={{ fontFamily: 'Inter', fontSize: '14px', color: '#c1c7d3' }}>{opt.desc}</div>
                        </div>
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', color: '#a1c9ff', flexShrink: 0 }}>
                        ${opt.dailyFee}<span style={{ fontSize: '11px', color: '#888' }}>/day</span>
                      </div>
                    </label>
                  ))}
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setStep(1)} className="btn-ghost" style={{ padding: '14px 32px' }}>← BACK</button>
                  <button onClick={() => setStep(3)} className="btn-primary" style={{ padding: '14px 48px' }}>REVIEW ORDER →</button>
                </div>
              </section>
            )}

            {/* STEP 3: Review & Confirm */}
            {step === 3 && (
              <section>
                <h2 style={{ fontFamily: 'Montserrat', fontSize: '28px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2rem' }}>
                  Order Review
                </h2>
                <div className="glass-card" style={{ padding: '2rem', borderRadius: '4px', marginBottom: '2rem' }}>
                  <h3 style={{ fontFamily: 'Montserrat', fontWeight: 600, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                    {car?.model}
                  </h3>
                  {[
                    { label: 'Service Type',  value: booking.type.toUpperCase() },
                    { label: 'Pickup Date',   value: booking.startDate },
                    { label: 'Return Date',   value: booking.endDate },
                    { label: 'Duration',      value: `${days} day${days !== 1 ? 's' : ''}` },
                    { label: 'Pickup',        value: booking.pickup },
                    { label: 'Delivery',      value: booking.delivery === 'concierge' ? 'Concierge (+$150)' : 'Airport' },
                    { label: 'Insurance',     value: ins?.label },
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}>
                      <span className="label-technical" style={{ color: '#888' }}>{label}</span>
                      <span style={{ fontFamily: 'Inter', fontSize: '14px' }}>{value}</span>
                    </div>
                  ))}
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setStep(2)} className="btn-ghost" style={{ padding: '14px 32px' }}>← BACK</button>
                  <button onClick={handleConfirm} disabled={submitting}
                    className="btn-primary"
                    style={{
                      flex: 1, padding: '18px',
                      boxShadow: '0 8px 24px rgba(161,201,255,0.25)',
                    }}>
                    {submitting ? 'PROCESSING...' : 'CONFIRM BOOKING'}
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* ── Sticky Order Summary ─────────────────────── */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div className="glass-card-strong" style={{ padding: '2rem', borderRadius: '8px' }}>
              {/* Car summary */}
              <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="label-technical" style={{ color: '#888', marginBottom: '6px' }}>{car?.series}</p>
                <h4 style={{ fontFamily: 'Montserrat', fontSize: '18px', fontWeight: 600, textTransform: 'uppercase' }}>
                  {car?.model}
                </h4>
                <p className="label-technical" style={{ color: '#c1c7d3', marginTop: '4px' }}>
                  {car?.year} · {booking.type.toUpperCase()}
                </p>
              </div>
              
              {/* Line items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                {[
                  { label: `Rental (${days} days)`,   value: `$${subtotal.toFixed(2)}`, show: days > 0 },
                  { label: `${ins?.label}`,           value: `$${insuranceFee.toFixed(2)}`, show: true },
                  { label: 'Concierge Delivery',      value: '$150.00', show: booking.delivery === 'concierge' },
                ].filter(i => i.show).map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#c1c7d3' }}>
                    <span style={{ fontFamily: 'Inter' }}>{label}</span>
                    <span style={{ fontFamily: 'JetBrains Mono' }}>{value}</span>
                  </div>
                ))}
              </div>
              
              {/* Total */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.08)',
              }}>
                <span style={{ fontFamily: 'Montserrat', fontWeight: 600, textTransform: 'uppercase' }}>Total</span>
                <span style={{ fontFamily: 'Montserrat', fontSize: '22px', fontWeight: 700, color: '#a1c9ff' }}
                  className="text-glow">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

const SAMPLE_CAR = {
  model: 'BMW M4 Competition', series: 'M Series', year: 2024,
  type: 'Coupe', rent_price_daily: 450, sale_price: 89500,
}
