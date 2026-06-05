// ============================================================
// pages/HomePage.jsx — Landing Page (Fully Responsive)
// ============================================================

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function HomePage() {
  const navigate = useNavigate()
  const [featuredCars, setFeaturedCars] = useState([])
  const [activeTab, setActiveTab]       = useState('rent')
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data, error } = await supabase
          .from('cars').select('*').limit(6).order('created_at', { ascending: false })
        if (error) throw error
        setFeaturedCars(data || [])
      } catch {
        setFeaturedCars(SAMPLE_CARS)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  return (
    <main style={{ paddingTop: '72px' }}>

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        height: 'calc(100vh - 72px)',
        minHeight: '560px',
        display: 'flex', alignItems: 'center',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1800&q=90"
            alt="BMW M4"
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.4)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #131313 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #131313 0%, transparent 70%)' }} />
        </div>

        <div style={{
          position: 'relative', zIndex: 1,
          padding: '0 var(--page-pad)',
          maxWidth: '1440px', width: '100%', margin: '0 auto',
        }}>
          <span className="section-eyebrow">Engineered for Precision</span>

          <h1 style={{
            fontFamily: 'Montserrat',
            fontSize: 'clamp(36px, 6vw, 72px)',
            fontWeight: 800,
            lineHeight: 1.0,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
            maxWidth: '700px',
          }}>
            EXPERIENCE<br />
            PURE <span style={{ color: '#a1c9ff' }}>PERFORMANCE</span>
          </h1>

          <p style={{
            fontFamily: 'Inter',
            fontSize: 'clamp(15px, 2vw, 18px)',
            lineHeight: 1.7,
            color: '#c1c7d3',
            maxWidth: '480px',
            marginBottom: '2.5rem',
          }}>
            Uncompromising power meets artisanal luxury. Access the world's most 
            exclusive fleet of BMW M-Series vehicles.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/fleet')} className="btn-primary" style={{ padding: '16px 36px' }}>
              Browse Fleet
            </button>
            <button onClick={() => navigate('/experience')} className="btn-ghost" style={{ padding: '16px 32px' }}>
              Our Experience
            </button>
          </div>
        </div>

        {/* Stats row — bottom of hero (hidden on small mobile) */}
        <div style={{
          position: 'absolute', bottom: '40px', right: 'var(--page-pad)',
          display: 'flex', gap: '40px',
        }} className="hero-stats">
          {[
            { value: '2.8s',    label: '0-60 MPH' },
            { value: '617 HP',  label: 'Peak Output' },
            { value: 'M xDrive', label: 'All-Wheel' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div style={{ fontFamily: 'Montserrat', fontSize: 'clamp(18px, 2.5vw, 26px)', fontWeight: 600, color: '#a1c9ff' }}>{value}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>
        <style>{`@media(max-width:640px){.hero-stats{display:none!important}}`}</style>
      </section>

      {/* ══ WHY CHOOSE US — Bento Grid ════════════════════ */}
      <section style={{ padding: 'var(--section-gap) var(--page-pad)', maxWidth: '1440px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="section-eyebrow">Why ZEE-BMW</span>
          <h2 className="section-title">BUILT FOR THE BEST</h2>
        </div>

        {/* Bento — stacks on mobile, grid on desktop */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }} className="bento-grid">
          {[
            { icon: 'precision_manufacturing', title: 'PRECISION', text: 'Every vehicle undergoes a rigorous 150-point inspection by certified M-Technicians to ensure factory-spec performance.', span: 2 },
            { icon: 'diamond', title: 'LUXURY', text: 'Bespoke concierge services, contactless delivery, and 24/7 technical support.', span: 1 },
            { icon: 'bolt', title: 'SPEED', text: 'Instant booking and real-time fleet availability. From selection to ignition in under 15 minutes.', span: 1 },
          ].map(({ icon, title, text }) => (
            <div key={title} className="glass-card" style={{
              padding: 'clamp(1.5rem, 3vw, 2.5rem)',
              borderRadius: '6px',
              minHeight: '220px',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              transition: 'border-color 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(161,201,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
            >
              <span className="material-symbols-outlined icon-filled"
                style={{ fontSize: '36px', color: '#a1c9ff', marginBottom: '1rem' }}>{icon}</span>
              <h3 style={{ fontFamily: 'Montserrat', fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>{title}</h3>
              <p style={{ fontFamily: 'Inter', fontSize: '15px', color: '#c1c7d3', lineHeight: 1.7 }}>{text}</p>
            </div>
          ))}

          {/* Cockpit image card */}
          <div className="glass-card" style={{
            borderRadius: '6px', minHeight: '280px',
            position: 'relative', overflow: 'hidden',
          }}>
            <img
              src="https://images.unsplash.com/photo-1607853554439-0069ec0f29b6?w=1000&q=80"
              alt="BMW cockpit"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }}
            />
            <div style={{
              position: 'absolute', inset: 0, padding: '2rem',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              background: 'linear-gradient(to top, rgba(19,19,19,0.9), transparent)',
            }}>
              <h3 style={{ fontFamily: 'Montserrat', fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                THE COCKPIT EXPERIENCE
              </h3>
              <p style={{ fontFamily: 'Inter', fontSize: '15px', color: '#c1c7d3' }}>
                Technology that anticipates your every need.
              </p>
            </div>
          </div>
        </div>

        <style>{`
          @media(min-width:768px){
            .bento-grid{grid-template-columns:repeat(3,1fr)!important;}
            .bento-grid>div:first-child{grid-column:span 2;}
            .bento-grid>div:last-child{grid-column:span 2;}
          }
        `}</style>
      </section>

      {/* ══ FEATURED FLEET ════════════════════════════════ */}
      <section style={{ paddingBottom: 'var(--section-gap)' }}>
        <div style={{
          padding: '0 var(--page-pad)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginBottom: '2rem', flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <span className="section-eyebrow">The Fleet</span>
            <h2 className="section-title" style={{ fontSize: 'clamp(24px, 3vw, 36px)' }}>Featured M-Series</h2>
          </div>
          <Link to="/fleet" style={{
            fontFamily: 'JetBrains Mono', fontSize: '12px', letterSpacing: '0.1em',
            textDecoration: 'none', color: '#a1c9ff',
            border: '1px solid rgba(161,201,255,0.3)',
            padding: '10px 20px', borderRadius: '2px',
            whiteSpace: 'nowrap',
          }}>
            VIEW ALL →
          </Link>
        </div>

        <div style={{
          display: 'flex', gap: '20px', overflowX: 'auto',
          padding: '4px var(--page-pad) 20px',
          scrollSnapType: 'x mandatory',
        }} className="hide-scrollbar">
          {loading
            ? Array(3).fill(0).map((_, i) => <CarSkeleton key={i} />)
            : (featuredCars.length > 0 ? featuredCars : SAMPLE_CARS).map(car => (
                <CarCard key={car.id} car={car} onClick={() => navigate(`/cars/${car.id}`)} />
              ))
          }
        </div>
      </section>

      {/* ══ RENT / BUY TOGGLE ════════════════════════════ */}
      <section style={{ background: '#0e0e0e', padding: 'var(--section-gap) var(--page-pad)', textAlign: 'center' }}>
        <h2 className="section-title" style={{ marginBottom: '2.5rem' }}>OWN THE EXPERIENCE</h2>

        {/* Toggle */}
        <div style={{
          display: 'inline-flex', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '999px',
          padding: '4px', marginBottom: '3rem',
        }}>
          {[{ k: 'rent', l: 'Rent Now' }, { k: 'sale', l: 'Purchase Fleet' }].map(({ k, l }) => (
            <button key={k} onClick={() => setActiveTab(k)} style={{
              padding: '10px 28px', borderRadius: '999px', border: 'none', cursor: 'pointer',
              fontFamily: 'JetBrains Mono', fontSize: '12px', letterSpacing: '0.1em',
              textTransform: 'uppercase', fontWeight: 700, transition: 'all 0.3s',
              background: activeTab === k ? '#a1c9ff' : 'transparent',
              color: activeTab === k ? '#00325a' : '#c1c7d3',
            }}>
              {l}
            </button>
          ))}
        </div>

        <div className="grid-2" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'left' }}>
          {activeTab === 'rent' ? (
            <>
              <FeatureCard title="The Ultra Lease" desc="Flexible long-term access. Swap vehicles monthly with full maintenance included." features={['NO DEPRECIATION RISK', 'TAX EFFICIENT SOLUTIONS', 'PRIORITY FLEET ACCESS']} />
              <FeatureCard title="Daily Premium Rental" desc="From one day to one month. Delivered to your door with full coverage." features={['FREE CANCELLATION 24H', 'CONCIERGE DELIVERY', 'FULL INSURANCE']} />
            </>
          ) : (
            <>
              <FeatureCard title="Certified Acquisition" desc="Low-mileage, meticulously maintained M-Series with full service history." features={['DIRECT FLEET PRICING', 'CONCIERGE EXPORTING', 'M-CERTIFIED INSPECTION']} />
              <FeatureCard title="Finance Solutions" desc="Bespoke financing packages for high-performance vehicle acquisitions." features={['COMPETITIVE RATES', 'FLEXIBLE TERMS', '24H APPROVAL']} />
            </>
          )}
        </div>
      </section>

      {/* ══ MINI SERVICES PREVIEW ═════════════════════════ */}
      <section style={{ padding: 'var(--section-gap) var(--page-pad)', maxWidth: '1440px', margin: '0 auto', textAlign: 'center' }}>
        <span className="section-eyebrow">What We Offer</span>
        <h2 className="section-title" style={{ marginBottom: '1rem' }}>OUR SERVICES</h2>
        <p style={{ fontFamily: 'Inter', fontSize: '16px', color: '#c1c7d3', maxWidth: '500px', margin: '0 auto 3rem', lineHeight: 1.7 }}>
          From single-day rentals to full fleet acquisitions — every service is engineered for the discerning driver.
        </p>

        <div className="grid-3" style={{ marginBottom: '3rem' }}>
          {[
            { icon: 'directions_car', title: 'Daily Rental',       subtitle: 'From $350/day' },
            { icon: 'calendar_month', title: 'Long-Term Lease',    subtitle: 'From $2,800/mo' },
            { icon: 'local_shipping', title: 'Concierge Delivery', subtitle: 'Any location' },
            { icon: 'shield',         title: 'Full Protection',    subtitle: 'Zero deductible' },
            { icon: 'build',          title: 'M-Tech Maintenance', subtitle: '150-point check' },
            { icon: 'payments',       title: 'Fleet Purchase',     subtitle: 'From $79,900' },
          ].map(({ icon, title, subtitle }) => (
            <div key={title} className="glass-card" style={{
              padding: '1.75rem', borderRadius: '6px',
              display: 'flex', alignItems: 'center', gap: '16px',
              textAlign: 'left', transition: 'border-color 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(161,201,255,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <span className="material-symbols-outlined icon-filled" style={{ fontSize: '28px', color: '#a1c9ff', flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ fontFamily: 'Montserrat', fontWeight: 700, textTransform: 'uppercase', fontSize: '14px', marginBottom: '2px' }}>{title}</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#a1c9ff', letterSpacing: '0.05em' }}>{subtitle}</div>
              </div>
            </div>
          ))}
        </div>

        <Link to="/services" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ padding: '16px 48px' }}>EXPLORE ALL SERVICES</button>
        </Link>
      </section>
    </main>
  )
}

// ── Car Card ──────────────────────────────────────────────── 
function CarCard({ car, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div className="glass-card" onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minWidth: 'clamp(280px, 85vw, 380px)',
        borderRadius: '4px', overflow: 'hidden',
        cursor: 'pointer', scrollSnapAlign: 'start',
        flexShrink: 0, transition: 'border-color 0.3s',
        borderColor: hovered ? 'rgba(161,201,255,0.35)' : undefined,
      }}
    >
      <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
        <img src={car.image_url || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=70'}
          alt={car.model} style={{ width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.6s', transform: hovered ? 'scale(1.08)' : 'scale(1)' }} />
        <span className={`badge ${car.status === 'available' ? 'badge-available' : 'badge-booked'}`}
          style={{ position: 'absolute', top: '12px', right: '12px' }}>
          {car.status === 'available' ? 'Available' : 'Booked'}
        </span>
      </div>
      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h4 style={{ fontFamily: 'Montserrat', fontSize: '18px', fontWeight: 700, textTransform: 'uppercase' }}>{car.model}</h4>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#c1c7d3' }}>{car.year} {car.type}</span>
          </div>
          {car.rent_price_daily && (
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontFamily: 'Montserrat', fontSize: '20px', fontWeight: 700, color: '#a1c9ff' }}>${car.rent_price_daily}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#c1c7d3', display: 'block' }}>/DAY</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '16px', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
          {car.horsepower && (
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#a1c9ff' }}>speed</span>
              {car.horsepower} HP
            </span>
          )}
          {car.acceleration && (
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#a1c9ff' }}>timer</span>
              {car.acceleration}s
            </span>
          )}
        </div>
        <button className="btn-outline" style={{ fontSize: '11px', padding: '12px' }}>VIEW DETAILS</button>
      </div>
    </div>
  )
}

function CarSkeleton() {
  return (
    <div style={{ minWidth: 'clamp(280px, 85vw, 380px)', flexShrink: 0, borderRadius: '4px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ height: '200px', background: 'linear-gradient(90deg,#1a1a1a 25%,#242424 50%,#1a1a1a 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ padding: '1.5rem' }}>
        <div style={{ height: '18px', background: '#2a2a2a', borderRadius: '2px', marginBottom: '8px', width: '70%' }} />
        <div style={{ height: '14px', background: '#1f2020', borderRadius: '2px', width: '40%' }} />
      </div>
    </div>
  )
}

function FeatureCard({ title, desc, features }) {
  return (
    <div className="glass-card" style={{ padding: '2rem', borderRadius: '6px' }}>
      <h3 style={{ fontFamily: 'Montserrat', fontSize: '20px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>{title}</h3>
      <p style={{ fontFamily: 'Inter', fontSize: '15px', color: '#c1c7d3', lineHeight: 1.7, marginBottom: '1.5rem' }}>{desc}</p>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="material-symbols-outlined icon-filled" style={{ color: '#a1c9ff', fontSize: '18px' }}>check_circle</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', letterSpacing: '0.08em' }}>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const SAMPLE_CARS = [
  { id:1, model:'M4 Competition', series:'M Series', type:'Coupe', year:2024, horsepower:503, acceleration:3.4, status:'available', rent_price_daily:450, image_url:'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80' },
  { id:2, model:'M5 CS', series:'M Series', type:'Sedan', year:2023, horsepower:627, acceleration:2.9, status:'booked', rent_price_daily:650, image_url:'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80' },
  { id:3, model:'X5 M Competition', series:'X Series', type:'SUV', year:2024, horsepower:617, acceleration:3.7, status:'available', rent_price_daily:550, image_url:'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80' },
  { id:4, model:'M8 Gran Coupe', series:'M Series', type:'Coupe', year:2024, horsepower:617, acceleration:3.0, status:'available', rent_price_daily:750, image_url:'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80' },
]
