// ============================================================
// pages/FleetPage.jsx — Car Catalog / Fleet Gallery
// ============================================================
// Matches the "PRECISION FLEET" page from the design with:
//   - Rent/Buy toggle segmented control
//   - Series filter chips (M Series, X Series, Electric)
//   - 3-column responsive grid of car cards
//   - Search input
//
// KEY REACT PATTERNS:
//   - useMemo: filters cars without re-querying the database
//     (computed derived state — like a computed property)
//   - useEffect + fetch: loads all cars on mount
//   - useState: manages all filter/search values
// ============================================================

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// Filter options — these match the design's category chips
const SERIES_FILTERS = ['ALL SERIES', 'M SERIES', 'X SERIES', 'ELECTRIC']
const TYPE_FILTERS   = ['All', 'Coupe', 'Sedan', 'SUV', 'Convertible']

export default function FleetPage() {
  const navigate = useNavigate()
  
  // ── State ──────────────────────────────────────────────── 
  const [cars, setCars]               = useState([])        // Raw data from DB
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [activeMode, setActiveMode]   = useState('rent')    // Rent or Buy
  const [activeSeries, setActiveSeries] = useState('ALL SERIES')
  const [activeType, setActiveType]   = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // ── Fetch All Cars ────────────────────────────────────── 
  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true)
      try {
        // Build dynamic query based on mode
        // If activeMode changes, we re-filter (handled by useMemo below)
        const { data, error } = await supabase
          .from('cars')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setCars(data || [])
      } catch (err) {
        console.warn('Using sample data:', err.message)
        setCars(FLEET_SAMPLE)  // Fallback to sample data
      } finally {
        setLoading(false)
      }
    }
    
    fetchCars()
  }, []) // Only runs once on mount

  // ── Filter Cars (useMemo) ─────────────────────────────── 
  // useMemo re-computes ONLY when its dependencies change.
  // This prevents re-filtering on every keystroke unnecessarily.
  // It's like a cached computed value.
  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      // Filter 1: Mode (rent vs buy)
      // A car must match the selected mode or be 'both'
      const modeMatch = activeMode === 'rent'
        ? car.availability === 'rent' || car.availability === 'both'
        : car.availability === 'sale' || car.availability === 'both'
      
      // Filter 2: Series (M Series, X Series, etc.)
      const seriesMatch = activeSeries === 'ALL SERIES' || 
        car.series?.toUpperCase() === activeSeries
      
      // Filter 3: Body type (Coupe, Sedan, etc.)
      const typeMatch = activeType === 'All' || car.type === activeType
      
      // Filter 4: Search query (case-insensitive)
      const searchMatch = !searchQuery || 
        car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.series?.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Car must pass ALL filters
      return modeMatch && seriesMatch && typeMatch && searchMatch
    })
  }, [cars, activeMode, activeSeries, activeType, searchQuery])
  // ↑ Recalculate when any of these values change

  return (
    <main style={{ paddingTop: '72px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '6rem 80px 6rem' }}>
        
        {/* ── Page Header + Filters ───────────────────── */}
        <section style={{
          display: 'flex', flexDirection: 'column',
          gap: '2rem', marginBottom: '3rem',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem',
          }}>
            {/* Page title */}
            <div>
              <h1 style={{
                fontFamily: 'Montserrat', fontSize: 'clamp(32px, 5vw, 56px)',
                fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '-0.02em', marginBottom: '0.75rem',
              }}>
                PRECISION FLEET
              </h1>
              <p style={{ fontFamily: 'Inter', fontSize: '18px', color: '#c1c7d3', maxWidth: '560px', lineHeight: 1.6 }}>
                Experience the pinnacle of German engineering. Select your drive 
                from our curated collection.
              </p>
            </div>
            
            {/* Right side: toggle + search */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
              
              {/* Rent/Buy Toggle */}
              <div style={{
                display: 'inline-flex', padding: '4px',
                background: '#1f2020',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '999px',
              }}>
                {[
                  { key: 'rent', label: 'RENT' },
                  { key: 'sale', label: 'BUY' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveMode(key)}
                    style={{
                      padding: '8px 28px', borderRadius: '999px', border: 'none',
                      cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: '12px',
                      letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700,
                      transition: 'all 0.3s',
                      background: activeMode === key ? '#a1c9ff' : 'transparent',
                      color: activeMode === key ? '#00325a' : '#c1c7d3',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              
              {/* Search input */}
              <input
                type="text"
                placeholder="Search model..."
                value={searchQuery}
                // onChange: fires on every keystroke
                // e.target.value = the current text in the input
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-ghost"
                style={{ width: '260px', padding: '10px 16px' }}
              />
            </div>
          </div>
          
          {/* Series filter chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {SERIES_FILTERS.map(series => (
              <button
                key={series}
                onClick={() => setActiveSeries(series)}
                className="glass-card"
                style={{
                  padding: '8px 20px', borderRadius: '999px',
                  border: activeSeries === series
                    ? '1px solid rgba(161,201,255,0.5)'
                    : '1px solid rgba(255,255,255,0.1)',
                  fontFamily: 'JetBrains Mono', fontSize: '12px',
                  letterSpacing: '0.1em', cursor: 'pointer',
                  color: activeSeries === series ? '#a1c9ff' : '#c1c7d3',
                  background: activeSeries === series
                    ? 'rgba(161,201,255,0.08)' : 'rgba(255,255,255,0.03)',
                  transition: 'all 0.2s',
                }}
              >
                {series}
              </button>
            ))}
            
            {/* Divider */}
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
            
            {/* Body type filters */}
            {TYPE_FILTERS.map(type => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                style={{
                  padding: '8px 16px', borderRadius: '2px',
                  border: activeType === type
                    ? '1px solid rgba(161,201,255,0.4)'
                    : '1px solid rgba(255,255,255,0.06)',
                  fontFamily: 'JetBrains Mono', fontSize: '11px',
                  letterSpacing: '0.08em', cursor: 'pointer',
                  color: activeType === type ? '#a1c9ff' : '#888',
                  background: 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                {type}
              </button>
            ))}
          </div>
          
          {/* Results count */}
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#888', letterSpacing: '0.08em' }}>
            {filteredCars.length} VEHICLES FOUND
          </div>
        </section>

        {/* ── Car Grid ─────────────────────────────────── */}
        {loading ? (
          // Loading state: grid of skeleton cards
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '24px',
          }}>
            {Array(6).fill(0).map((_, i) => <GridCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          // Error state
          <div style={{ textAlign: 'center', padding: '4rem', color: '#c1c7d3' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>error</span>
            <p>Failed to load fleet. Please try again.</p>
          </div>
        ) : filteredCars.length === 0 ? (
          // Empty state
          <div style={{ textAlign: 'center', padding: '6rem', color: '#c1c7d3' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>search_off</span>
            <p style={{ fontFamily: 'Montserrat', fontSize: '20px', textTransform: 'uppercase' }}>No vehicles match your filters</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveSeries('ALL SERIES'); setActiveType('All') }}
              style={{
                marginTop: '1.5rem', fontFamily: 'JetBrains Mono',
                fontSize: '12px', letterSpacing: '0.1em',
                background: 'transparent', border: '1px solid rgba(161,201,255,0.3)',
                color: '#a1c9ff', padding: '10px 24px', cursor: 'pointer', borderRadius: '2px',
              }}
            >
              CLEAR FILTERS
            </button>
          </div>
        ) : (
          // ── Car Cards Grid ───────────────────────────
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '24px',
          }}>
            {filteredCars.map((car, index) => (
              <CarGridCard
                key={car.id}
                car={car}
                mode={activeMode}
                // Staggered animation delay for each card
                style={{ animationDelay: `${index * 60}ms` }}
                onClick={() => navigate(`/cars/${car.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

// ── Car Grid Card Component ──────────────────────────────── 
// Each car in the fleet grid — matches DESIGN.md card spec
function CarGridCard({ car, mode, onClick, style }) {
  const [hovered, setHovered] = useState(false)
  const price = mode === 'rent' ? car.rent_price_daily : car.sale_price
  const priceLabel = mode === 'rent' ? '/ DAY' : 'SALE'

  return (
    <article
      className="glass-card animate-fadeUp"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '4px', overflow: 'hidden',
        cursor: 'pointer', position: 'relative',
        transition: 'border-color 0.3s, transform 0.2s',
        borderColor: hovered ? 'rgba(161,201,255,0.35)' : undefined,
        transform: hovered ? 'translateY(-3px)' : undefined,
        ...style
      }}
    >
      {/* Car image */}
      <div style={{ aspectRatio: '16/10', overflow: 'hidden', position: 'relative' }}>
        <img
          src={car.image_url || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=700&q=80'}
          alt={car.model}
          loading="lazy"  // Lazy loading: only loads when visible
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.7s',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
          }}
        />
        {/* Gradient overlay at bottom of image */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '50%',
          background: 'linear-gradient(to top, rgba(19,19,19,0.7), transparent)',
        }} />
      </div>
      
      {/* Card body */}
      <div style={{ padding: '1.5rem' }}>
        
        {/* Series label + name + price */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <span style={{
              fontFamily: 'JetBrains Mono', fontSize: '11px',
              color: '#a1c9ff', letterSpacing: '0.1em', textTransform: 'uppercase',
              display: 'block', marginBottom: '4px',
            }}>
              {car.series || 'M SERIES'}
            </span>
            <h3 style={{
              fontFamily: 'Montserrat', fontSize: '20px',
              fontWeight: 600, textTransform: 'uppercase',
            }}>
              {car.model}
            </h3>
          </div>
          
          {/* Price display */}
          {price && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <span style={{
                fontFamily: 'Montserrat', fontSize: '22px',
                fontWeight: 600, color: '#a1c9ff',
              }}>
                ${Number(price).toLocaleString()}
              </span>
              <span style={{
                fontFamily: 'JetBrains Mono', fontSize: '11px',
                color: '#c1c7d3', display: 'block', letterSpacing: '0.05em',
              }}>
                {priceLabel}
              </span>
            </div>
          )}
        </div>
        
        {/* Specs row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '12px', padding: '1rem 0',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          marginBottom: '1.25rem',
        }}>
          {[
            { icon: 'speed',      value: car.horsepower ? `${car.horsepower} HP` : '— HP' },
            { icon: 'timer',      value: car.acceleration ? `${car.acceleration}s` : '—' },
          ].map(({ icon, value }) => (
            <div key={icon} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#a1c9ff' }}>{icon}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#e4e2e1' }}>{value}</span>
            </div>
          ))}
        </div>
        
        {/* View Details CTA */}
        <button
          className="btn-primary"
          style={{
            width: '100%', padding: '14px',
            background: hovered ? '#a1c9ff' : 'transparent',
            color: hovered ? '#00325a' : '#a1c9ff',
            border: '1px solid rgba(161,201,255,0.35)',
            fontFamily: 'JetBrains Mono', fontSize: '12px',
            letterSpacing: '0.1em', fontWeight: 700,
          }}
        >
          VIEW DETAILS
        </button>
      </div>
    </article>
  )
}

// Loading skeleton
function GridCardSkeleton() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '4px', overflow: 'hidden',
    }}>
      <div style={{
        aspectRatio: '16/10',
        background: 'linear-gradient(90deg, #1a1a1a 25%, #242424 50%, #1a1a1a 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }} />
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ height: '14px', background: '#1f2020', borderRadius: '2px', width: '40%' }} />
        <div style={{ height: '22px', background: '#2a2a2a', borderRadius: '2px', width: '70%' }} />
        <div style={{ height: '48px', background: '#1f2020', borderRadius: '2px', marginTop: '8px' }} />
      </div>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
    </div>
  )
}

// ── Sample Fleet Data ─────────────────────────────────────── 
const FLEET_SAMPLE = [
  { id: 1, model: 'M4 Competition', series: 'M Series', type: 'Coupe', year: 2024, horsepower: 503, acceleration: 3.4, transmission: '8-SPD', drive_type: 'RWD', availability: 'both', status: 'available', rent_price_daily: 450, sale_price: 89500, image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80' },
  { id: 2, model: 'M5 CS', series: 'M Series', type: 'Sedan', year: 2023, horsepower: 627, acceleration: 2.9, transmission: 'M xDrive', drive_type: 'AWD', availability: 'rent', status: 'booked', rent_price_daily: 650, image_url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80' },
  { id: 3, model: 'X5 M Competition', series: 'X Series', type: 'SUV', year: 2024, horsepower: 617, acceleration: 3.7, transmission: '8-SPD', drive_type: 'AWD', availability: 'both', status: 'available', rent_price_daily: 550, sale_price: 115000, image_url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80' },
  { id: 4, model: 'M8 Gran Coupe', series: 'M Series', type: 'Coupe', year: 2024, horsepower: 617, acceleration: 3.0, transmission: 'M xDrive', drive_type: 'AWD', availability: 'rent', status: 'available', rent_price_daily: 750, image_url: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80' },
  { id: 5, model: 'M3 Competition', series: 'M Series', type: 'Sedan', year: 2023, horsepower: 503, acceleration: 3.4, transmission: '8-SPD', drive_type: 'RWD', availability: 'sale', status: 'available', sale_price: 79900, image_url: 'https://images.unsplash.com/photo-1617531653332-bd46c16f7d5f?w=800&q=80' },
  { id: 6, model: 'X6 M', series: 'X Series', type: 'SUV', year: 2024, horsepower: 600, acceleration: 3.8, transmission: '8-SPD', drive_type: 'AWD', availability: 'both', status: 'available', rent_price_daily: 500, sale_price: 105000, image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80' },
]
