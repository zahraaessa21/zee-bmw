// ============================================================
// pages/CarDetailPage.jsx — Individual Car Detail View
// ============================================================
// Matches the BMW M4 Competition detail page from the design:
//   - Hero image gallery with thumbnails
//   - Specs bento grid (HP, 0-60, Transmission, etc.)
//   - Sticky booking card on the right
//   - Reviews section
//
// REACT CONCEPTS:
//   - useParams: extracts :id from the URL (e.g., /cars/42)
//   - useEffect: fetch car when the ID changes
//   - useState: manage gallery selection, booking dates, active tab
// ============================================================

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function CarDetailPage() {
  // ── useParams: Get the car ID from the URL ────────────── 
  // If URL is /cars/42, then params.id === "42"
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // ── State ──────────────────────────────────────────────── 
  const [car, setCar]             = useState(null)
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState('rent')
  const [activePhoto, setActivePhoto] = useState(null)  // currently shown hero photo
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate]     = useState('')
  const [insurance, setInsurance] = useState('platinum')

  // ── Fetch Single Car ──────────────────────────────────── 
  useEffect(() => {
    // id is a dependency: if URL changes from /cars/1 to /cars/2,
    // this effect runs again to fetch the new car
    const fetchCar = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('cars')
          .select('*')
          .eq('id', id)    // WHERE id = :id (using the URL parameter)
          .single()        // Expect exactly 1 row; throws if 0 or 2+
        
        if (error) throw error
        setCar(data)
      } catch (err) {
        // Try to find in sample data
        const sample = SAMPLE_CAR
        setCar({ ...sample, id })
      } finally {
        setLoading(false)
      }
    }
    
    fetchCar()
  }, [id]) // Rerun when :id changes

  // ── Calculate Rental Total ────────────────────────────── 
  // Pure JavaScript computation — not stored in state
  // because it's always derivable from startDate + endDate
  const rentalDays = (() => {
    if (!startDate || !endDate) return 0
    const diff = new Date(endDate) - new Date(startDate)
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  })()
  
  const insuranceFees = { platinum: 125, executive: 75, standard: 35 }
  const insuranceFee = rentalDays > 0 ? insuranceFees[insurance] * rentalDays : insuranceFees[insurance]
  const subtotal = car ? rentalDays * (car.rent_price_daily || 0) : 0
  const total = subtotal + insuranceFee

  // ── Navigate to Booking ───────────────────────────────── 
  const handleBook = () => {
    if (!user) {
      navigate('/login')
      return
    }
    // Pass booking data via URL query params or navigate to booking page
    navigate(`/book/${id}?type=${activeTab}&start=${startDate}&end=${endDate}&insurance=${insurance}`)
  }

  // ── Loading State ─────────────────────────────────────── 
  if (loading) return (
    <div style={{
      paddingTop: '80px', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh',
    }}>
      <div style={{ color: '#a1c9ff', fontFamily: 'JetBrains Mono', letterSpacing: '0.1em', fontSize: '12px' }}>
        LOADING VEHICLE...
      </div>
    </div>
  )

  if (!car) return (
    <div style={{ paddingTop: '80px', textAlign: 'center', padding: '10rem 2rem' }}>
      <h2 style={{ fontFamily: 'Montserrat', color: '#c1c7d3' }}>Vehicle not found</h2>
      <button onClick={() => navigate('/fleet')} className="btn-primary" style={{ marginTop: '2rem' }}>
        Back to Fleet
      </button>
    </div>
  )

  return (
    <main style={{ paddingTop: '80px' }}>
      
      {/* ══════════════════════════════════════════════════
          HERO IMAGE + GALLERY THUMBNAILS
          ══════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', height: '65vh', minHeight: '500px' }}>
        {/* Main hero image — shows activePhoto or first car photo */}
        <img
          src={activePhoto || car.image_url || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1600&q=90'}
          alt={`${car.model} hero`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s' }}
        />
        
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, #131313 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
        }} />
        
        {/* Text over image */}
        <div style={{
          position: 'absolute', bottom: '4rem', left: '80px',
        }}>
          <span style={{
            fontFamily: 'JetBrains Mono', fontSize: '12px',
            color: '#a1c9ff', letterSpacing: '0.3em', textTransform: 'uppercase',
            display: 'block', marginBottom: '0.75rem',
          }}>
            {car.series || 'PERFORMANCE SERIES'}
          </span>
          <h1 style={{
            fontFamily: 'Montserrat', fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '-0.02em', marginBottom: '1rem',
          }}>
            {car.model.toUpperCase()}
          </h1>
          {/* Quick spec tags */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {car.engine && (
              <span className="glass-card" style={{
                padding: '8px 16px', borderRadius: '999px',
                fontFamily: 'JetBrains Mono', fontSize: '11px',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                {car.engine}
              </span>
            )}
            {car.horsepower && (
              <span className="glass-card" style={{
                padding: '8px 16px', borderRadius: '999px',
                fontFamily: 'JetBrains Mono', fontSize: '11px',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                {car.horsepower} Horsepower
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── Gallery Thumbnails — uses real car photos ────── */}
      <div style={{
        maxWidth: '1440px', margin: '0 auto',
        padding: '0 var(--page-pad)',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px', marginTop: '-3rem', position: 'relative', zIndex: 10,
      }}>
        {(() => {
          // Build gallery from car's photos array or fallback to image_url
          const allPhotos = (car.photos && car.photos.length > 0)
            ? car.photos
            : car.image_url ? [car.image_url] : []

          // Show up to 3 thumbnails + a "+X more" tile if there are more
          const thumbs    = allPhotos.slice(0, 3)
          const remaining = allPhotos.length - 3

          return (
            <>
              {thumbs.map((url, i) => (
                <div
                  key={i}
                  onClick={() => setActivePhoto(url)}
                  className="glass-card"
                  style={{
                    aspectRatio: '16/9', overflow: 'hidden',
                    borderRadius: '4px', cursor: 'pointer',
                    border: activePhoto === url
                      ? '2px solid #a1c9ff'
                      : '1px solid rgba(255,255,255,0.1)',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <img
                    src={url}
                    alt={`${car.model} view ${i + 1}`}
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                      opacity: 0.8, transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => e.target.style.opacity = '1'}
                    onMouseLeave={e => e.target.style.opacity = '0.8'}
                  />
                </div>
              ))}

              {/* Fill empty slots if fewer than 3 photos */}
              {thumbs.length < 3 && Array(3 - thumbs.length).fill(0).map((_, i) => (
                <div key={`empty-${i}`} className="glass-card" style={{
                  aspectRatio: '16/9', borderRadius: '4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.02)',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#444' }}>
                    image
                  </span>
                </div>
              ))}

              {/* +X more photos tile */}
              <div className="glass-card" style={{
                aspectRatio: '16/9', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '4px',
                borderRadius: '4px', cursor: remaining > 0 ? 'pointer' : 'default',
              }}>
                {remaining > 0 ? (
                  <>
                    <span style={{ fontFamily: 'Montserrat', fontSize: '18px', fontWeight: 700, color: '#a1c9ff' }}>
                      +{remaining}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#888', letterSpacing: '0.1em' }}>
                      PHOTOS
                    </span>
                  </>
                ) : (
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#444', letterSpacing: '0.08em' }}>
                    NO MORE
                  </span>
                )}
              </div>
            </>
          )
        })()}
      </div>

      {/* ══════════════════════════════════════════════════
          MAIN CONTENT: SPECS + BOOKING CARD
          12-column grid: specs take 8 cols, booking takes 4
          ══════════════════════════════════════════════════ */}
      <section style={{
        maxWidth: '1440px', margin: '0 auto',
        padding: '6rem 80px',
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '3rem',
        alignItems: 'start',
      }}>
        
        {/* ── Left: Description + Specs ─────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          
          {/* Description */}
          <div>
            <h2 style={{
              fontFamily: 'Montserrat', fontSize: '28px',
              fontWeight: 600, textTransform: 'uppercase',
              borderLeft: '4px solid #a1c9ff', paddingLeft: '1.5rem',
              marginBottom: '1.5rem',
            }}>
              ENGINEERED FOR ADRENALINE
            </h2>
            <p style={{
              fontFamily: 'Inter', fontSize: '18px',
              lineHeight: 1.7, color: '#c1c7d3', maxWidth: '700px',
            }}>
              {car.description || `The ${car.model} is the ultimate expression of the driver's car. 
              Powered by a precision-engineered engine, it delivers breathtaking performance 
              and uncompromising presence on the road. Every curve is designed for aerodynamic 
              perfection and pure driving pleasure.`}
            </p>
          </div>
          
          {/* ── Specs Bento Grid ──────────────────────────
              6 spec tiles — 3 columns x 2 rows
              Each uses font-mono for the "instrument cluster" look */}
          <div>
            <h3 style={{
              fontFamily: 'Montserrat', fontSize: '20px',
              fontWeight: 600, textTransform: 'uppercase',
              marginBottom: '1.5rem', color: '#e4e2e1',
            }}>
              TECHNICAL SPECIFICATIONS
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
            }}>
              {[
                { icon: 'timer',          label: '0-60 MPH',     value: car.acceleration ? `${car.acceleration} SEC` : 'N/A' },
                { icon: 'bolt',           label: 'HORSEPOWER',   value: car.horsepower ? `${car.horsepower} HP` : 'N/A' },
                { icon: 'settings',       label: 'TRANSMISSION', value: car.transmission || 'N/A' },
                { icon: 'chair',          label: 'INTERIOR',     value: car.interior || 'MERINO LEATHER' },
                { icon: 'directions_car', label: 'DRIVE TYPE',   value: car.drive_type || 'RWD' },
                { icon: 'speed',          label: 'TOP SPEED',    value: car.top_speed ? `${car.top_speed} MPH` : 'N/A' },
              ].map(({ icon, label, value }) => (
                <div
                  key={label}
                  className="glass-card"
                  style={{ padding: '2rem', borderRadius: '4px' }}
                >
                  <span className="material-symbols-outlined"
                    style={{ fontSize: '24px', color: '#a1c9ff', display: 'block', marginBottom: '1rem' }}>
                    {icon}
                  </span>
                  {/* Label: small mono uppercase */}
                  <p style={{
                    fontFamily: 'JetBrains Mono', fontSize: '11px',
                    letterSpacing: '0.1em', color: '#c1c7d3',
                    textTransform: 'uppercase', marginBottom: '6px',
                  }}>
                    {label}
                  </p>
                  {/* Value: large Montserrat */}
                  <p style={{
                    fontFamily: 'Montserrat', fontSize: '22px',
                    fontWeight: 600, textTransform: 'uppercase',
                  }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Sticky Booking Card ────────────────── 
            position: sticky + top = stays visible while scrolling
            This is the key interaction from the design */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <div
            className="glass-card-strong"
            style={{ padding: '2rem', borderRadius: '8px' }}
          >
            {/* Price header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '2rem',
            }}>
              <div>
                <p style={{
                  fontFamily: 'JetBrains Mono', fontSize: '11px',
                  color: '#c1c7d3', letterSpacing: '0.1em', textTransform: 'uppercase',
                  marginBottom: '4px',
                }}>
                  {activeTab === 'rent' ? 'DAILY RATE' : 'SALE PRICE'}
                </p>
                <p style={{
                  fontFamily: 'Montserrat', fontSize: '28px',
                  fontWeight: 600, color: '#a1c9ff',
                }}>
                  {activeTab === 'rent' 
                    ? `$${car.rent_price_daily || 0}` 
                    : `$${(car.sale_price || 0).toLocaleString()}`}
                  {activeTab === 'rent' && (
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#c1c7d3' }}>
                      {' '}/DAY
                    </span>
                  )}
                </p>
              </div>
              {/* Status badge */}
              <span className={`badge ${car.status === 'available' ? 'badge-available' : 'badge-booked'}`}>
                {car.status?.toUpperCase() || 'AVAILABLE'}
              </span>
            </div>
            
            {/* Service type toggle (Rent/Buy) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                fontFamily: 'JetBrains Mono', fontSize: '10px',
                letterSpacing: '0.1em', color: '#c1c7d3',
                textTransform: 'uppercase', display: 'block', marginBottom: '8px',
              }}>
                Service Type
              </label>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '4px', background: '#1f2020',
                borderRadius: '4px', padding: '4px',
              }}>
                {[
                  { key: 'rent', label: 'RENT',  show: car.availability !== 'sale' },
                  { key: 'sale', label: 'BUY',   show: car.availability !== 'rent' },
                ].filter(t => t.show || car.availability === 'both').map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    style={{
                      padding: '10px', borderRadius: '2px', border: 'none',
                      cursor: 'pointer', fontFamily: 'JetBrains Mono',
                      fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
                      fontWeight: 700, transition: 'all 0.2s',
                      background: activeTab === key ? '#a1c9ff' : 'transparent',
                      color: activeTab === key ? '#00325a' : '#c1c7d3',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Rental date fields — only shown in rent mode */}
            {activeTab === 'rent' && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', letterSpacing: '0.1em', color: '#c1c7d3', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    Pickup Date
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a1c9ff', fontSize: '18px' }}>calendar_today</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="input-ghost"
                      style={{ paddingLeft: '42px' }}
                    />
                  </div>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', letterSpacing: '0.1em', color: '#c1c7d3', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    Return Date
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a1c9ff', fontSize: '18px' }}>calendar_today</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="input-ghost"
                      style={{ paddingLeft: '42px' }}
                    />
                  </div>
                </div>
                
                {/* Insurance selector */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', letterSpacing: '0.1em', color: '#c1c7d3', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    Insurance Tier
                  </label>
                  <select
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                    className="input-ghost"
                  >
                    <option value="platinum">Platinum Protection (Full Coverage)</option>
                    <option value="executive">Executive Tier</option>
                    <option value="standard">Standard Coverage</option>
                  </select>
                </div>
                
                {/* Price breakdown */}
                {rentalDays > 0 && (
                  <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    paddingTop: '1rem', marginBottom: '1.5rem',
                    display: 'flex', flexDirection: 'column', gap: '8px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#c1c7d3' }}>
                      <span>Subtotal ({rentalDays} days)</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#c1c7d3' }}>
                      <span>Insurance & Fees</span>
                      <span>${insuranceFee.toFixed(2)}</span>
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontFamily: 'Montserrat', fontSize: '20px', fontWeight: 600,
                      paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)',
                    }}>
                      <span>Total</span>
                      <span style={{ color: '#a1c9ff' }} className="text-glow">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* Book CTA button */}
            <button
              onClick={handleBook}
              disabled={activeTab === 'rent' && (!startDate || !endDate)}
              style={{
                width: '100%', padding: '20px',
                background: '#a1c9ff', color: '#00325a',
                fontFamily: 'Montserrat', fontSize: '14px', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                border: 'none', borderRadius: '4px', cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 10px 30px rgba(161,201,255,0.25)',
                opacity: (activeTab === 'rent' && (!startDate || !endDate)) ? 0.5 : 1,
              }}
            >
              {activeTab === 'rent' ? 'BOOK EXPERIENCE NOW' : 'REQUEST PURCHASE'}
            </button>
            
            <p style={{
              textAlign: 'center', fontFamily: 'JetBrains Mono',
              fontSize: '10px', color: '#888', letterSpacing: '0.08em',
              marginTop: '1rem',
            }}>
              CANCEL FOR FREE UP TO 24H BEFORE PICKUP
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          REVIEWS SECTION
          ══════════════════════════════════════════════════ */}
      <section style={{
        background: '#0e0e0e',
        padding: '80px',
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <h3 style={{
            fontFamily: 'Montserrat', fontSize: '28px',
            fontWeight: 600, textTransform: 'uppercase', marginBottom: '2rem',
          }}>
            DRIVING IMPRESSIONS
          </h3>
          
          {/* Star rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {Array(5).fill(0).map((_, i) => (
                <span key={i} className="material-symbols-outlined icon-filled"
                  style={{ color: '#a1c9ff', fontSize: '22px' }}>star</span>
              ))}
            </div>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#c1c7d3', letterSpacing: '0.08em' }}>
              4.9/5 BASED ON 124 REVIEWS
            </span>
          </div>
          
          {/* Review cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {SAMPLE_REVIEWS.map((r, i) => (
              <div key={i} className="glass-card" style={{ padding: '1.75rem', borderRadius: '4px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem' }}>
                  {Array(r.rating).fill(0).map((_, j) => (
                    <span key={j} className="material-symbols-outlined icon-filled"
                      style={{ color: '#a1c9ff', fontSize: '16px' }}>star</span>
                  ))}
                </div>
                <p style={{ fontFamily: 'Inter', fontSize: '15px', color: '#c1c7d3', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                  "{r.text}"
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#e4e2e1', letterSpacing: '0.05em' }}>
                    {r.author}
                  </span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#888' }}>
                    {r.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

// Sample car data for when Supabase isn't configured
const SAMPLE_CAR = {
  model: 'BMW M4 Competition', series: 'M Series', type: 'Coupe', year: 2024,
  color: 'Isle of Man Green', horsepower: 503, acceleration: 3.4,
  top_speed: 180, transmission: '8-SPD M STEP', drive_type: 'RWD',
  engine: '3.0L Twin-Turbo', interior: 'Merino Leather',
  availability: 'both', status: 'available',
  rent_price_daily: 450, sale_price: 89500,
  description: 'The BMW M4 Competition Coupe is the ultimate expression of the driver\'s car. Powered by a 3.0-liter BMW M TwinPower Turbo inline 6-cylinder engine, it delivers an astounding 503 horsepower and 479 lb-ft of torque.',
  image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1600&q=90',
}

const SAMPLE_REVIEWS = [
  { rating: 5, text: 'Absolutely breathtaking machine. The M4 Competition exceeded every expectation. Delivery was flawless.', author: 'James K.', date: 'OCT 2024' },
  { rating: 5, text: 'The level of service matches the caliber of the car. Concierge delivery to my hotel was a perfect touch.', author: 'Sarah M.', date: 'SEP 2024' },
  { rating: 5, text: 'Third time renting from ULTRADRIVE. The M4 is simply in a different league. Pure engineering excellence.', author: 'Rami A.', date: 'SEP 2024' },
]
