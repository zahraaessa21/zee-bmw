// ============================================================
// pages/ExperiencePage.jsx — Real data from Supabase
// ============================================================
// Real data sections:
//   - Stats: live counts from cars + bookings tables
//   - Featured Fleet Stories: real cars from database
//   - Testimonials: from testimonials table
//   - Locations: from locations table
//
// Static sections (brand content — no need for DB):
//   - Hero, Pillars, CTA
// ============================================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import expHero from '../images/expHero.jpg'


// ── Static brand content ───────────────────────────────────── 
const PILLARS = [
  {
    icon: 'precision_manufacturing',
    title: 'ENGINEERED PRECISION',
    desc: 'Every vehicle in our fleet is maintained to factory-spec by certified BMW M-Technicians. 150-point inspections are completed before every single rental — because precision is non-negotiable.',
  },
  {
    icon: 'diamond',
    title: 'UNMATCHED LUXURY',
    desc: 'We don\'t just rent cars. We curate experiences. From the moment you book to the instant you return the keys, every interaction is designed to exceed expectation at the highest level.',
  },
  {
    icon: 'bolt',
    title: 'PURE PERFORMANCE',
    desc: 'Only the most capable BMW M-Series vehicles enter our fleet. We test every car at the limit, so when you get behind the wheel, every machine performs exactly as the engineers intended.',
  },
]

// Fallback data if DB tables don't exist yet
const FALLBACK_TESTIMONIALS = [
  { id:1, name:'James Al-Khatib', role:'CEO, Venture Capital', text:'The M8 Gran Coupe exceeded every expectation. ZEE-BMW operates at a level I haven\'t experienced anywhere else.', rating:5, city:'Beirut' },
  { id:2, name:'Sarah Mansour',   role:'Architect',            text:'I rented the M4 Competition for a weekend drive. Absolute perfection. The car was impeccably presented throughout.', rating:5, city:'Dubai' },
  { id:3, name:'Rami Haddad',     role:'Entrepreneur',         text:'Three rentals in six months and never a single issue. The fleet quality is extraordinary. This is the gold standard.', rating:5, city:'Beirut' },
]

const FALLBACK_LOCATIONS = [
  { id:1, city:'BEIRUT', detail:'Rafic Hariri International Airport + Downtown Hub' },
  { id:2, city:'DUBAI',  detail:'Dubai International Airport + DIFC Concierge' },
  { id:3, city:'MUNICH', detail:'Munich International Airport (MUC)' },
  { id:4, city:'BERLIN', detail:'Berlin Brandenburg Airport (BER)' },
  { id:5, city:'LONDON', detail:'Heathrow & Gatwick + Private Delivery' },
]

export default function ExperiencePage() {
  const navigate = useNavigate()

  // ── State ──────────────────────────────────────────────── 
  const [featuredCars,   setFeaturedCars]   = useState([])
  const [testimonials,   setTestimonials]   = useState([])
  const [locations,      setLocations]      = useState([])
  const [stats,          setStats]          = useState({ cars: 0, bookings: 0, users: 0 })
  const [loading,        setLoading]        = useState(true)

  // ── Fetch all real data from Supabase ─────────────────── 
  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Run all queries at the same time (faster)
        const [carsRes, bookingsRes, usersRes, testimonialsRes, locationsRes] = await Promise.all([
          // Get 2 featured cars for the "Icons of Performance" section
          supabase.from('cars')
            .select('id, model, series, type, year, horsepower, acceleration, drive_type, image_url, photos, description')
            .eq('status', 'available')
            .order('created_at', { ascending: false })
            .limit(2),

          // Count total bookings for stats
          supabase.from('bookings').select('id', { count: 'exact', head: true }),

          // Count total users for stats
          supabase.from('profiles').select('id', { count: 'exact', head: true }),

          // Get testimonials (will fallback if table doesn't exist)
          supabase.from('testimonials').select('*').order('created_at', { ascending: false }),

          // Get locations (will fallback if table doesn't exist)
          supabase.from('locations').select('*').order('sort_order', { ascending: true }),
        ])

        // Set featured cars
        if (carsRes.data && carsRes.data.length > 0) {
          setFeaturedCars(carsRes.data)
        }

        // Set real stats
        setStats({
          cars:     carsRes.data?.length       || 0,
          bookings: bookingsRes.count           || 0,
          users:    usersRes.count              || 0,
        })

        // Testimonials — use DB data or fallback
        setTestimonials(
          testimonials.data?.length > 0
            ? testimonialsRes.data
            : FALLBACK_TESTIMONIALS
        )

        // Locations — use DB data or fallback
        setLocations(
          locationsRes.data?.length > 0
            ? locationsRes.data
            : FALLBACK_LOCATIONS
        )

      } catch (err) {
        console.warn('Experience page using fallback data:', err.message)
        setTestimonials(FALLBACK_TESTIMONIALS)
        setLocations(FALLBACK_LOCATIONS)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  // ── Real stats with live numbers ──────────────────────── 
  const STATS = [
    { value: '150+',                          label: 'Inspection Points' },
    { value: stats.cars > 0 ? `${stats.cars}+` : '6+', label: 'Vehicles in Fleet' },
    { value: stats.bookings > 0 ? `${stats.bookings}+` : '0', label: 'Bookings Made' },
    { value: '24/7',                          label: 'Concierge Support' },
  ]

  return (
    <main className="page-wrapper">

      {/* ══ CINEMATIC HERO ════════════════════════════════ */}
      <section style={{
        position: 'relative',
        height: 'calc(100vh - 72px)', minHeight: '500px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', textAlign: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img
            src={expHero}                 
            alt="Experience hero"
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, #131313 100%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, padding: '0 var(--page-pad)', maxWidth: '900px' }}>
          <span className="section-eyebrow" style={{ display: 'block', textAlign: 'center', marginBottom: '24px' }}>
            The ZEE-BMW Story
          </span>
          <h1 style={{
            fontFamily: 'Montserrat', fontSize: 'clamp(36px, 6vw, 80px)',
            fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '-0.02em', lineHeight: 1.0, marginBottom: '2rem',
          }}>
            BEYOND<br /><span style={{ color: '#a1c9ff' }}>DRIVING</span>
          </h1>
          <p style={{
            fontFamily: 'Inter', fontSize: 'clamp(15px, 2vw, 20px)',
            color: '#c1c7d3', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto 2.5rem',
          }}>
            We exist for those who understand that a car is not just transport.
            It is an extension of identity, an instrument of joy, and a work of engineering art.
          </p>
          <button onClick={() => navigate('/fleet')} className="btn-primary" style={{ padding: '18px 48px', fontSize: '14px' }}>
            DISCOVER THE FLEET
          </button>
        </div>

        <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.5 }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', letterSpacing: '0.2em', color: '#c1c7d3' }}>SCROLL</span>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#a1c9ff', animation: 'bounce 2s infinite' }}>keyboard_arrow_down</span>
        </div>
        <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}`}</style>
      </section>

      {/* ══ BRAND PILLARS ═════════════════════════════════ */}
      <section style={{ padding: 'var(--section-gap) var(--page-pad)', maxWidth: '1440px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span className="section-eyebrow">Our Philosophy</span>
          <h2 className="section-title">WHAT DEFINES US</h2>
        </div>
        <div className="grid-3">
          {PILLARS.map((pillar, i) => (
            <div key={pillar.title} className="glass-card animate-fadeUp"
              style={{ padding: '2.5rem', borderRadius: '6px', animationDelay: `${i * 100}ms`, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <span className="material-symbols-outlined icon-filled" style={{ fontSize: '40px', color: '#a1c9ff' }}>{pillar.icon}</span>
              <h3 style={{ fontFamily: 'Montserrat', fontSize: '20px', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1.2 }}>{pillar.title}</h3>
              <p style={{ fontFamily: 'Inter', fontSize: '15px', color: '#c1c7d3', lineHeight: 1.8, flexGrow: 1 }}>{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ LIVE STATS BAR ════════════════════════════════ */}
      <section style={{ background: '#0e0e0e', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '60px var(--page-pad)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '40px', textAlign: 'center' }}>
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div style={{ fontFamily: 'Montserrat', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, color: '#a1c9ff', lineHeight: 1, marginBottom: '8px' }} className="text-glow">
                {loading ? '—' : value}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', letterSpacing: '0.15em', color: '#888', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURED CARS FROM DATABASE ════════════════════ */}
      <section style={{ padding: 'var(--section-gap) var(--page-pad)', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '80px' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="section-eyebrow">The Vehicles</span>
          <h2 className="section-title">ICONS OF PERFORMANCE</h2>
        </div>

        {loading ? (
          // Loading skeleton
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            {[1,2].map(i => (
              <div key={i} style={{ borderRadius: '8px', aspectRatio: '16/9', background: 'linear-gradient(90deg,#1a1a1a 25%,#242424 50%,#1a1a1a 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            ))}
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
          </div>
        ) : featuredCars.length > 0 ? (
          // Real cars from database
          featuredCars.map((car, i) => (
            <RealCarStoryRow key={car.id} car={car} reverse={i % 2 !== 0} navigate={navigate} />
          ))
        ) : (
          // No cars yet — show add prompt
          <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', display: 'block', marginBottom: '16px', opacity: 0.4 }}>directions_car</span>
            <p style={{ fontFamily: 'Inter', fontSize: '16px', marginBottom: '20px' }}>No vehicles in fleet yet.</p>
            <button onClick={() => navigate('/admin')} className="btn-primary" style={{ padding: '12px 28px' }}>
              ADD CARS IN ADMIN →
            </button>
          </div>
        )}
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════════ */}
      <section style={{ background: '#0e0e0e', padding: 'var(--section-gap) var(--page-pad)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span className="section-eyebrow">Client Stories</span>
            <h2 className="section-title">DRIVING IMPRESSIONS</h2>
          </div>
          <div className="grid-3">
            {(testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS).map((t, i) => (
              <div key={t.id || i} className="glass-card animate-fadeUp"
                style={{ padding: '2rem', borderRadius: '6px', animationDelay: `${i * 100}ms` }}>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '1.25rem' }}>
                  {Array(t.rating || 5).fill(0).map((_, j) => (
                    <span key={j} className="material-symbols-outlined icon-filled" style={{ fontSize: '18px', color: '#a1c9ff' }}>star</span>
                  ))}
                </div>
                <p style={{ fontFamily: 'Inter', fontSize: '15px', color: '#c1c7d3', lineHeight: 1.8, fontStyle: 'italic', marginBottom: '1.5rem' }}>
                  "{t.text}"
                </p>
                <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '14px' }}>{t.name}</div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#888', letterSpacing: '0.05em', marginTop: '2px' }}>{t.role}</div>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#a1c9ff', letterSpacing: '0.1em', padding: '3px 10px', border: '1px solid rgba(161,201,255,0.2)', borderRadius: '2px' }}>
                    {t.city}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ LOCATIONS ═════════════════════════════════════ */}
      <section style={{ padding: 'var(--section-gap) var(--page-pad)', maxWidth: '1440px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span className="section-eyebrow">Where We Are</span>
          <h2 className="section-title">OUR LOCATIONS</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {(locations.length > 0 ? locations : FALLBACK_LOCATIONS).map((loc, i) => (
            <div key={loc.id || i} className="glass-card" style={{
              padding: '1.75rem', borderRadius: '4px',
              display: 'flex', alignItems: 'center', gap: '16px',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(161,201,255,0.35)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
            >
              <span className="material-symbols-outlined icon-filled" style={{ fontSize: '24px', color: '#a1c9ff', flexShrink: 0 }}>location_on</span>
              <div>
                <div style={{ fontFamily: 'Montserrat', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '4px' }}>{loc.city}</div>
                <div style={{ fontFamily: 'Inter', fontSize: '13px', color: '#c1c7d3', lineHeight: 1.5 }}>{loc.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FINAL CTA ═════════════════════════════════════ */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        padding: 'var(--section-gap) var(--page-pad)',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #0a1628 0%, #131313 60%)',
        borderTop: '1px solid rgba(161,201,255,0.1)',
      }}>
        <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse, rgba(161,201,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="section-eyebrow" style={{ display: 'block', textAlign: 'center' }}>Begin</span>
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>
            YOUR EXPERIENCE<br /><span style={{ color: '#a1c9ff' }}>AWAITS</span>
          </h2>
          <p style={{ fontFamily: 'Inter', fontSize: '17px', color: '#c1c7d3', maxWidth: '480px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Join the exclusive circle of clients who demand nothing less than absolute excellence in every drive.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/fleet')} className="btn-primary" style={{ padding: '18px 48px', fontSize: '14px', boxShadow: '0 8px 32px rgba(161,201,255,0.25)' }}>
              BROWSE FLEET
            </button>
            <button onClick={() => navigate('/services')} className="btn-ghost" style={{ padding: '18px 40px' }}>
              OUR SERVICES
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

// ── Real Car Story Row — uses actual DB car data ──────────── 
function RealCarStoryRow({ car, reverse, navigate }) {
  // Get the best available photo
  const mainPhoto = (car.photos && car.photos.length > 0)
    ? car.photos[0]
    : car.image_url || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&q=80'

  // Build spec pills from real data
  const specs = [
    car.horsepower   && `${car.horsepower} HP`,
    car.acceleration && `${car.acceleration}s 0–60`,
    car.drive_type   && car.drive_type,
    car.type         && car.type,
  ].filter(Boolean)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px', alignItems: 'center' }} className="fleet-story-row">

      {/* Car image */}
      <div style={{ borderRadius: '8px', overflow: 'hidden', aspectRatio: '16/9', order: reverse ? 2 : 1 }}
        className={reverse ? 'story-img-reverse' : ''}>
        <img
          src={mainPhoto}
          alt={car.model}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        />
      </div>

      {/* Car info */}
      <div style={{ order: reverse ? 1 : 2, padding: '0 8px' }}>
        <span className="section-eyebrow">{car.series || 'Performance Series'}</span>
        <h3 style={{ fontFamily: 'Montserrat', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1.25rem', lineHeight: 1.1 }}>
          {car.model}
        </h3>
        <p style={{ fontFamily: 'Inter', fontSize: '16px', color: '#c1c7d3', lineHeight: 1.8, marginBottom: '2rem' }}>
          {car.description || `The ${car.model} represents the pinnacle of BMW M performance. Pure engineering excellence on every road.`}
        </p>

        {/* Real spec pills */}
        {specs.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '2rem' }}>
            {specs.map(spec => (
              <span key={spec} style={{
                fontFamily: 'JetBrains Mono', fontSize: '12px', letterSpacing: '0.08em',
                padding: '8px 16px', border: '1px solid rgba(161,201,255,0.3)',
                borderRadius: '2px', color: '#a1c9ff', background: 'rgba(161,201,255,0.05)',
              }}>
                {spec}
              </span>
            ))}
          </div>
        )}

        <button onClick={() => navigate(`/cars/${car.id}`)} className="btn-primary" style={{ padding: '14px 32px' }}>
          VIEW THIS MODEL →
        </button>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .fleet-story-row { grid-template-columns: 1fr 1fr !important; }
          .story-img-reverse { order: 2 !important; }
        }
      `}</style>
    </div>
  )
}
