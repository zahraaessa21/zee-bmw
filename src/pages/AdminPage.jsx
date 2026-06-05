// ============================================================
// pages/AdminPage.jsx — Full Admin Dashboard
// ============================================================
// Sections (sidebar navigation):
//   1. OVERVIEW   — stats cards + recent activity
//   2. CARS       — full CRUD (add/edit/delete vehicles)
//   3. BOOKINGS   — view & manage all bookings
//   4. USERS      — view all registered users
//
// Only accessible by users with role = 'admin' in profiles table
// ============================================================

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import ImageUploader from '../components/ImageUploader'

// ── Sidebar nav items ─────────────────────────────────────── 
const SIDEBAR_ITEMS = [
  { key: 'OVERVIEW',  icon: 'dashboard',      label: 'Overview' },
  { key: 'CARS',      icon: 'directions_car',  label: 'Fleet / Cars' },
  { key: 'BOOKINGS',  icon: 'calendar_month',  label: 'Bookings' },
  { key: 'USERS',     icon: 'group',           label: 'Users' },
]

const EMPTY_CAR = {
  model: '', series: 'M Series', type: 'Coupe',
  year: new Date().getFullYear(),
  color: '', horsepower: '', acceleration: '', top_speed: '',
  transmission: '8-SPD', drive_type: 'RWD',
  engine: '', interior: '', description: '',
  image_url: '',
  photos: [],                   // array of all photo URLs
  availability: 'both', status: 'available',
  rent_price_daily: '', sale_price: '',
}

export default function AdminPage() {
  const { user, displayName } = useAuth()
  const navigate = useNavigate()

  const [activeSection, setActiveSection] = useState('OVERVIEW')
  const [sidebarOpen,   setSidebarOpen]   = useState(true)
  const [cars,          setCars]          = useState([])
  const [bookings,      setBookings]      = useState([])
  const [users,         setUsers]         = useState([])
  const [loading,       setLoading]       = useState(true)
  const [editingCar,    setEditingCar]    = useState(null)
  const [showCarForm,   setShowCarForm]   = useState(false)
  const [form,          setForm]          = useState(EMPTY_CAR)
  const [saving,        setSaving]        = useState(false)
  const [toast,         setToast]         = useState('')

  // ── Load everything on mount ──────────────────────────── 
  useEffect(() => { loadAll() }, [])

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [carsRes, bookingsRes, usersRes] = await Promise.all([
        supabase.from('cars').select('*').order('created_at', { ascending: false }),
        supabase.from('bookings').select('*, cars(model,image_url), profiles(full_name)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      ])
      setCars(carsRes.data       || SAMPLE_CARS)
      setBookings(bookingsRes.data || SAMPLE_BOOKINGS)
      setUsers(usersRes.data     || SAMPLE_USERS)
    } catch {
      setCars(SAMPLE_CARS)
      setBookings(SAMPLE_BOOKINGS)
      setUsers(SAMPLE_USERS)
    } finally {
      setLoading(false)
    }
  }

  // ── CRUD: Save car (create or update) ─────────────────── 
  const saveCar = async (e) => {
    e.preventDefault()
    setSaving(true)

    // photos array: first = main image_url, rest = extra photos
    const allPhotos = form.photos || []
    const mainPhoto = allPhotos[0] || form.image_url || ''

    const carData = {
      ...form,
      image_url:        mainPhoto,         // first photo = main display photo
      photos:           allPhotos,         // all photos saved in array
      year:             parseInt(form.year) || 2024,
      horsepower:       form.horsepower       ? parseInt(form.horsepower)       : null,
      acceleration:     form.acceleration     ? parseFloat(form.acceleration)   : null,
      top_speed:        form.top_speed        ? parseInt(form.top_speed)        : null,
      rent_price_daily: form.rent_price_daily ? parseFloat(form.rent_price_daily) : null,
      sale_price:       form.sale_price       ? parseFloat(form.sale_price)     : null,
    }
    try {
      if (editingCar) {
        const { error } = await supabase.from('cars').update(carData).eq('id', editingCar.id)
        if (error) throw error
        setCars(prev => prev.map(c => c.id === editingCar.id ? { ...c, ...carData } : c))
        setToast('✓ Vehicle updated successfully')
      } else {
        const { data, error } = await supabase.from('cars').insert(carData).select().single()
        if (error) throw error
        setCars(prev => [data, ...prev])
        setToast('✓ Vehicle added to fleet')
      }
      resetCarForm()
    } catch (err) {
      setToast('✗ Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── CRUD: Delete car ──────────────────────────────────── 
  const deleteCar = async (carId, model) => {
    if (!confirm(`Delete "${model}" permanently?`)) return
    try {
      const { error } = await supabase.from('cars').delete().eq('id', carId)
      if (error) throw error
      setCars(prev => prev.filter(c => c.id !== carId))
      setToast('✓ Vehicle removed from fleet')
    } catch (err) {
      setToast('✗ ' + err.message)
    }
  }

  // ── Update booking status ─────────────────────────────── 
  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId)
      if (error) throw error
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))
      setToast('✓ Booking status updated')
    } catch (err) {
      setToast('✗ ' + err.message)
    }
  }

  const startEditCar = (car) => {
    setEditingCar(car)
    // Build photos array from existing data
    const existingPhotos = car.photos?.length > 0
      ? car.photos
      : car.image_url ? [car.image_url] : []

    setForm({
      model: car.model || '', series: car.series || 'M Series',
      type: car.type || 'Coupe', year: car.year || '',
      color: car.color || '', horsepower: car.horsepower || '',
      acceleration: car.acceleration || '', top_speed: car.top_speed || '',
      transmission: car.transmission || '', drive_type: car.drive_type || '',
      engine: car.engine || '', interior: car.interior || '',
      description: car.description || '',
      image_url: car.image_url || '',
      photos: existingPhotos,
      availability: car.availability || 'both', status: car.status || 'available',
      rent_price_daily: car.rent_price_daily || '', sale_price: car.sale_price || '',
    })
    setShowCarForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetCarForm = () => {
    setEditingCar(null)
    setForm(EMPTY_CAR)
    setShowCarForm(false)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // ── Computed stats ────────────────────────────────────── 
  const stats = {
    totalCars:       cars.length,
    availableCars:   cars.filter(c => c.status === 'available').length,
    totalBookings:   bookings.length,
    activeBookings:  bookings.filter(b => ['confirmed','active'].includes(b.status)).length,
    totalUsers:      users.length,
    totalRevenue:    bookings.reduce((s, b) => s + (Number(b.total_price) || 0), 0),
    recentBookings:  [...bookings].slice(0, 5),
    recentCars:      [...cars].slice(0, 4),
  }

  return (
    <div style={{
      paddingTop: '72px',
      minHeight: '100vh',
      display: 'flex',
      background: '#0e0e0e',
    }}>

      {/* ── SIDEBAR ──────────────────────────────────────── */}
      <aside style={{
        width: sidebarOpen ? '240px' : '64px',
        minHeight: 'calc(100vh - 72px)',
        background: '#131313',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s ease',
        flexShrink: 0,
        position: 'sticky',
        top: '72px',
        alignSelf: 'flex-start',
        overflow: 'hidden',
      }}>
        {/* Sidebar header */}
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center',
          justifyContent: sidebarOpen ? 'space-between' : 'center',
        }}>
          {sidebarOpen && (
            <div>
              <div style={{ fontFamily: 'Montserrat', fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#a1c9ff' }}>
                Admin Panel
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#888', marginTop: '2px', letterSpacing: '0.05em' }}>
                {displayName}
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(o => !o)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#888', padding: '4px',
            display: 'flex', alignItems: 'center',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {sidebarOpen ? 'menu_open' : 'menu'}
            </span>
          </button>
        </div>

        {/* Sidebar nav links */}
        <nav style={{ padding: '12px 8px', flexGrow: 1 }}>
          {SIDEBAR_ITEMS.map(item => {
            const isActive = activeSection === item.key
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                title={!sidebarOpen ? item.label : ''}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  gap: '12px', padding: '12px',
                  borderRadius: '6px', border: 'none', cursor: 'pointer',
                  marginBottom: '4px',
                  background: isActive ? 'rgba(161,201,255,0.12)' : 'transparent',
                  color: isActive ? '#a1c9ff' : '#888',
                  transition: 'all 0.2s',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <span className="material-symbols-outlined icon-filled" style={{ fontSize: '20px', flexShrink: 0 }}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <span style={{
                    fontFamily: 'JetBrains Mono', fontSize: '12px',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    fontWeight: isActive ? 700 : 500,
                    whiteSpace: 'nowrap',
                  }}>
                    {item.label}
                  </span>
                )}
                {isActive && sidebarOpen && (
                  <div style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', background: '#a1c9ff' }} />
                )}
              </button>
            )
          })}
        </nav>

        {/* Back to site */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => navigate('/')}
            title={!sidebarOpen ? 'Back to Site' : ''}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: '12px', padding: '12px',
              borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: 'transparent', color: '#666',
              transition: 'all 0.2s',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#c1c7d3'}
            onMouseLeave={e => e.currentTarget.style.color = '#666'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px', flexShrink: 0 }}>arrow_back</span>
            {sidebarOpen && (
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                BACK TO SITE
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <div style={{ flex: 1, padding: '32px', minWidth: 0, overflow: 'auto' }}>

        {/* Toast notification */}
        {toast && (
          <div style={{
            position: 'fixed', top: '88px', right: '24px', zIndex: 999,
            background: toast.startsWith('✓') ? 'rgba(0,200,83,0.15)' : 'rgba(255,100,100,0.15)',
            border: `1px solid ${toast.startsWith('✓') ? 'rgba(0,200,83,0.4)' : 'rgba(255,100,100,0.4)'}`,
            color: toast.startsWith('✓') ? '#69f0ae' : '#ff8080',
            padding: '12px 20px', borderRadius: '6px',
            fontFamily: 'Inter', fontSize: '14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            animation: 'fadeUp 0.3s ease',
          }}>
            {toast}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            SECTION: OVERVIEW
            ══════════════════════════════════════════════ */}
        {activeSection === 'OVERVIEW' && (
          <div>
            <PageHeader
              title="Dashboard Overview"
              subtitle={`Welcome back, ${displayName}. Here's what's happening.`}
            />

            {loading ? <LoadingSpinner /> : (
              <>
                {/* Stats grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px', marginBottom: '32px',
                }}>
                  {[
                    { label: 'Total Vehicles',   value: stats.totalCars,      sub: `${stats.availableCars} available`, icon: 'directions_car', color: '#a1c9ff' },
                    { label: 'Total Bookings',   value: stats.totalBookings,  sub: `${stats.activeBookings} active`,   icon: 'calendar_month',  color: '#69f0ae' },
                    { label: 'Registered Users', value: stats.totalUsers,     sub: 'All time',                         icon: 'group',           color: '#ffd740' },
                    { label: 'Total Revenue',    value: `$${stats.totalRevenue.toLocaleString()}`, sub: 'All bookings', icon: 'payments',        color: '#ff9800' },
                  ].map(stat => (
                    <StatCard key={stat.label} {...stat} />
                  ))}
                </div>

                {/* Two column: Recent Bookings + Fleet Status */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '24px' }}>

                  {/* Recent Bookings */}
                  <div className="glass-card" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontFamily: 'Montserrat', fontSize: '15px', fontWeight: 700, textTransform: 'uppercase' }}>Recent Bookings</h3>
                      <button onClick={() => setActiveSection('BOOKINGS')} style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', letterSpacing: '0.08em', color: '#a1c9ff', background: 'none', border: 'none', cursor: 'pointer' }}>VIEW ALL →</button>
                    </div>
                    <div>
                      {stats.recentBookings.length === 0 ? (
                        <EmptyState icon="calendar_today" text="No bookings yet" />
                      ) : stats.recentBookings.map(b => (
                        <div key={b.id} style={{
                          padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '4px', background: '#1f2020', overflow: 'hidden', flexShrink: 0 }}>
                              {b.cars?.image_url && <img src={b.cars.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {b.cars?.model || 'Vehicle'}
                              </div>
                              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#888', letterSpacing: '0.05em' }}>
                                {b.profiles?.full_name || 'Unknown'}
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontFamily: 'Montserrat', fontSize: '14px', fontWeight: 600, color: '#a1c9ff' }}>
                              ${Number(b.total_price || 0).toLocaleString()}
                            </div>
                            <StatusPill status={b.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fleet status */}
                  <div className="glass-card" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontFamily: 'Montserrat', fontSize: '15px', fontWeight: 700, textTransform: 'uppercase' }}>Fleet Status</h3>
                      <button onClick={() => setActiveSection('CARS')} style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', letterSpacing: '0.08em', color: '#a1c9ff', background: 'none', border: 'none', cursor: 'pointer' }}>MANAGE →</button>
                    </div>

                    {/* Status breakdown bars */}
                    <div style={{ padding: '20px 24px' }}>
                      {[
                        { label: 'Available', count: cars.filter(c => c.status === 'available').length, color: '#a1c9ff' },
                        { label: 'Booked',    count: cars.filter(c => c.status === 'booked').length,    color: '#ffd740' },
                        { label: 'Sold',      count: cars.filter(c => c.status === 'sold').length,      color: '#ff8080' },
                      ].map(({ label, count, color }) => (
                        <div key={label} style={{ marginBottom: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', letterSpacing: '0.08em', color: '#c1c7d3' }}>{label}</span>
                            <span style={{ fontFamily: 'Montserrat', fontSize: '14px', fontWeight: 700, color }}>{count}</span>
                          </div>
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: '99px',
                              background: color,
                              width: cars.length > 0 ? `${(count / cars.length) * 100}%` : '0%',
                              transition: 'width 0.6s ease',
                            }} />
                          </div>
                        </div>
                      ))}

                      {/* Series breakdown */}
                      <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#888', letterSpacing: '0.08em', marginBottom: '12px' }}>BY SERIES</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {[...new Set(cars.map(c => c.series).filter(Boolean))].map(series => (
                            <span key={series} style={{
                              fontFamily: 'JetBrains Mono', fontSize: '10px', letterSpacing: '0.06em',
                              padding: '4px 12px', borderRadius: '2px',
                              background: 'rgba(161,201,255,0.08)',
                              border: '1px solid rgba(161,201,255,0.2)',
                              color: '#a1c9ff',
                            }}>
                              {series}: {cars.filter(c => c.series === series).length}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Quick add car button */}
                    <div style={{ padding: '0 24px 20px' }}>
                      <button onClick={() => { setActiveSection('CARS'); setShowCarForm(true) }} className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                        + ADD NEW VEHICLE
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick actions row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {[
                    { label: 'Add Vehicle',    icon: 'add_circle',    action: () => { setActiveSection('CARS'); setShowCarForm(true) } },
                    { label: 'View Bookings',  icon: 'list_alt',      action: () => setActiveSection('BOOKINGS') },
                    { label: 'Manage Users',   icon: 'manage_accounts', action: () => setActiveSection('USERS') },
                    { label: 'View Live Site', icon: 'open_in_new',   action: () => navigate('/') },
                  ].map(({ label, icon, action }) => (
                    <button key={label} onClick={action}
                      className="glass-card"
                      style={{
                        padding: '16px', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '6px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(161,201,255,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                      <span className="material-symbols-outlined icon-filled" style={{ fontSize: '22px', color: '#a1c9ff' }}>{icon}</span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', letterSpacing: '0.06em', color: '#c1c7d3', textTransform: 'uppercase' }}>{label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            SECTION: CARS (CRUD)
            ══════════════════════════════════════════════ */}
        {activeSection === 'CARS' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <PageHeader
                title="Fleet Management"
                subtitle={`${cars.length} vehicles in inventory`}
                noMargin
              />
              <button onClick={() => { resetCarForm(); setShowCarForm(true) }} className="btn-primary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                ADD VEHICLE
              </button>
            </div>

            {/* Car Form (toggle) */}
            {showCarForm && (
              <div className="glass-card" style={{ padding: '28px', borderRadius: '8px', marginBottom: '28px', border: '1px solid rgba(161,201,255,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontFamily: 'Montserrat', fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', color: '#a1c9ff' }}>
                    {editingCar ? `Editing: ${editingCar.model}` : 'Add New Vehicle'}
                  </h3>
                  <button onClick={resetCarForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <form onSubmit={saveCar}>
                  {/* Row 1 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <FormField span={2} label="Model Name" name="model" value={form.model} onChange={handleFormChange} placeholder="BMW M4 Competition" required />
                    <FormField label="Year" name="year" value={form.year} onChange={handleFormChange} placeholder="2024" type="number" />
                    <FormField label="Color" name="color" value={form.color} onChange={handleFormChange} placeholder="Isle of Man Green" />
                  </div>

                  {/* Row 2 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <FormField label="Horsepower" name="horsepower" value={form.horsepower} onChange={handleFormChange} placeholder="503" type="number" />
                    <FormField label="0-60 (sec)" name="acceleration" value={form.acceleration} onChange={handleFormChange} placeholder="3.4" type="number" />
                    <FormField label="Top Speed (mph)" name="top_speed" value={form.top_speed} onChange={handleFormChange} placeholder="180" type="number" />
                    <FormField label="Transmission" name="transmission" value={form.transmission} onChange={handleFormChange} placeholder="8-SPD M Step" />
                    <FormField label="Drive Type" name="drive_type" value={form.drive_type} onChange={handleFormChange} placeholder="RWD / AWD" />
                    <FormField label="Engine" name="engine" value={form.engine} onChange={handleFormChange} placeholder="3.0L TwinPower" />
                  </div>

                  {/* Row 3 — selects */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    {[
                      { name: 'series',       label: 'Series',       opts: ['M Series','X Series','Electric','Standard'] },
                      { name: 'type',         label: 'Body Type',    opts: ['Coupe','Sedan','SUV','Convertible','Hatchback'] },
                      { name: 'availability', label: 'Availability', opts: ['rent','sale','both'] },
                      { name: 'status',       label: 'Status',       opts: ['available','booked','sold'] },
                    ].map(({ name, label, opts }) => (
                      <div key={name}>
                        <label style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>{label}</label>
                        <select name={name} value={form[name]} onChange={handleFormChange} className="input-ghost" style={{ padding: '10px 14px', fontSize: '14px' }}>
                          {opts.map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>

                  {/* Row 4 — prices */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <FormField label="Daily Rent Price ($)" name="rent_price_daily" value={form.rent_price_daily} onChange={handleFormChange} placeholder="450" type="number" />
                    <FormField label="Sale Price ($)" name="sale_price" value={form.sale_price} onChange={handleFormChange} placeholder="89500" type="number" />
                  </div>

                  {/* Photos — ImageUploader replaces old single URL field */}
                  <div style={{ marginBottom: '16px' }}>
                    <ImageUploader
                      photos={form.photos || []}
                      onChange={(newPhotos) => setForm(prev => ({
                        ...prev,
                        photos:    newPhotos,
                        image_url: newPhotos[0] || '',   // keep image_url in sync
                      }))}
                    />
                  </div>

                  {/* Description */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Description</label>
                    <textarea name="description" value={form.description} onChange={handleFormChange} rows={3}
                      placeholder="Describe the vehicle..."
                      className="input-ghost" style={{ resize: 'vertical', fontSize: '14px' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '14px 32px' }}>
                      {saving ? 'SAVING...' : editingCar ? 'UPDATE VEHICLE' : 'ADD VEHICLE'}
                    </button>
                    <button type="button" onClick={resetCarForm} className="btn-ghost" style={{ padding: '14px 24px' }}>CANCEL</button>
                  </div>
                </form>
              </div>
            )}

            {/* Cars table */}
            {loading ? <LoadingSpinner /> : (
              <div className="glass-card" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['Vehicle', 'Series', 'Year', 'Status', 'Daily Rate', 'Sale Price', 'Actions'].map(h => (
                          <th key={h} style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', fontWeight: 500, padding: '14px 16px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cars.map(car => (
                        <tr key={car.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '44px', height: '30px', borderRadius: '3px', overflow: 'hidden', background: '#1f2020', flexShrink: 0 }}>
                                {car.image_url && <img src={car.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                              </div>
                              <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500 }}>{car.model}</span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#a1c9ff', letterSpacing: '0.05em' }}>{car.series}</td>
                          <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#c1c7d3' }}>{car.year}</td>
                          <td style={{ padding: '14px 16px' }}><StatusPill status={car.status} /></td>
                          <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono', fontSize: '13px', color: '#a1c9ff' }}>
                            {car.rent_price_daily ? `$${car.rent_price_daily}` : '—'}
                          </td>
                          <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#c1c7d3' }}>
                            {car.sale_price ? `$${Number(car.sale_price).toLocaleString()}` : '—'}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => startEditCar(car)} style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', padding: '6px 14px', background: 'rgba(161,201,255,0.08)', border: '1px solid rgba(161,201,255,0.25)', color: '#a1c9ff', cursor: 'pointer', borderRadius: '3px', transition: 'all 0.2s' }}>
                                EDIT
                              </button>
                              <button onClick={() => deleteCar(car.id, car.model)} style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', padding: '6px 14px', background: 'rgba(255,100,100,0.08)', border: '1px solid rgba(255,100,100,0.25)', color: '#ff8080', cursor: 'pointer', borderRadius: '3px', transition: 'all 0.2s' }}>
                                DEL
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            SECTION: BOOKINGS
            ══════════════════════════════════════════════ */}
        {activeSection === 'BOOKINGS' && (
          <div>
            <PageHeader title="Bookings Management" subtitle={`${bookings.length} total bookings`} />

            {/* Status filter pills */}
            <BookingFilters bookings={bookings} updateStatus={updateBookingStatus} loading={loading} />
          </div>
        )}

        {/* ══════════════════════════════════════════════
            SECTION: USERS
            ══════════════════════════════════════════════ */}
        {activeSection === 'USERS' && (
          <div>
            <PageHeader title="User Management" subtitle={`${users.length} registered users`} />

            {loading ? <LoadingSpinner /> : (
              <div className="glass-card" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['User', 'Phone', 'Role', 'Bookings', 'Joined'].map(h => (
                          <th key={h} style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', fontWeight: 500, padding: '14px 16px', textAlign: 'left' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => {
                        const userBookings = bookings.filter(b => b.user_id === u.id)
                        return (
                          <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                  width: '36px', height: '36px', borderRadius: '50%',
                                  background: 'rgba(161,201,255,0.12)', border: '1px solid rgba(161,201,255,0.2)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontFamily: 'Montserrat', fontSize: '14px', fontWeight: 700, color: '#a1c9ff',
                                  flexShrink: 0,
                                }}>
                                  {(u.full_name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontFamily: 'Inter', fontSize: '14px' }}>{u.full_name || 'Unknown'}</span>
                              </div>
                            </td>
                            <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#c1c7d3' }}>{u.phone || '—'}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{
                                fontFamily: 'JetBrains Mono', fontSize: '10px', letterSpacing: '0.06em',
                                padding: '3px 10px', borderRadius: '2px', textTransform: 'uppercase',
                                background: u.role === 'admin' ? 'rgba(161,201,255,0.15)' : 'rgba(255,255,255,0.05)',
                                color: u.role === 'admin' ? '#a1c9ff' : '#888',
                                border: `1px solid ${u.role === 'admin' ? 'rgba(161,201,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                              }}>
                                {u.role || 'user'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono', fontSize: '13px', color: '#c1c7d3' }}>
                              {userBookings.length}
                            </td>
                            <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#666' }}>
                              {u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Bookings section with filter ──────────────────────────── 
function BookingFilters({ bookings, updateStatus, loading }) {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  return (
    <>
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['all', 'confirmed', 'active', 'completed', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontFamily: 'JetBrains Mono', fontSize: '11px', letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: '8px 16px',
            borderRadius: '3px', border: 'none', cursor: 'pointer',
            background: filter === f ? 'rgba(161,201,255,0.15)' : 'rgba(255,255,255,0.04)',
            color: filter === f ? '#a1c9ff' : '#888',
            transition: 'all 0.2s',
          }}>
            {f} {f === 'all' ? `(${bookings.length})` : `(${bookings.filter(b => b.status === f).length})`}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="glass-card" style={{ borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Ref', 'Client', 'Vehicle', 'Type', 'Dates', 'Total', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', fontWeight: 500, padding: '14px 16px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#666' }}>
                      #{String(b.id).padStart(5,'0')}
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'Inter', fontSize: '13px' }}>
                      {b.profiles?.full_name || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'Inter', fontSize: '13px' }}>
                      {b.cars?.model || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#a1c9ff', letterSpacing: '0.05em' }}>
                      {b.booking_type?.toUpperCase()}
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#c1c7d3' }}>
                      {b.start_date ? `${b.start_date} → ${b.end_date}` : '—'}
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'Montserrat', fontSize: '14px', fontWeight: 600, color: '#a1c9ff' }}>
                      ${Number(b.total_price || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}><StatusPill status={b.status} /></td>
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        value={b.status}
                        onChange={e => updateStatus(b.id, e.target.value)}
                        style={{
                          background: '#1f2020', border: '1px solid rgba(255,255,255,0.1)',
                          color: '#c1c7d3', borderRadius: '3px', padding: '5px 8px',
                          fontFamily: 'JetBrains Mono', fontSize: '10px',
                          cursor: 'pointer', outline: 'none',
                        }}
                      >
                        {['pending','confirmed','active','completed','cancelled'].map(s => (
                          <option key={s} value={s}>{s.toUpperCase()}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <EmptyState icon="calendar_today" text="No bookings found" />}
          </div>
        </div>
      )}
    </>
  )
}

// ── Small reusable components ─────────────────────────────── 

function PageHeader({ title, subtitle, noMargin }) {
  return (
    <div style={{ marginBottom: noMargin ? 0 : '28px' }}>
      <h1 style={{ fontFamily: 'Montserrat', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>{title}</h1>
      {subtitle && <p style={{ fontFamily: 'Inter', fontSize: '14px', color: '#888' }}>{subtitle}</p>}
    </div>
  )
}

function StatCard({ label, value, sub, icon, color }) {
  return (
    <div className="glass-card" style={{
      padding: '20px', borderRadius: '8px',
      display: 'flex', flexDirection: 'column', gap: '12px',
      transition: 'border-color 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = `${color}40`}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' }}>{label}</span>
        <span className="material-symbols-outlined icon-filled" style={{ fontSize: '22px', color, opacity: 0.7 }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontFamily: 'Montserrat', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#666', marginTop: '4px', letterSpacing: '0.05em' }}>{sub}</div>
      </div>
    </div>
  )
}

function StatusPill({ status }) {
  const styles = {
    available:  { bg: 'rgba(161,201,255,0.12)', color: '#a1c9ff',  border: 'rgba(161,201,255,0.3)' },
    confirmed:  { bg: 'rgba(161,201,255,0.12)', color: '#a1c9ff',  border: 'rgba(161,201,255,0.3)' },
    active:     { bg: 'rgba(0,200,83,0.12)',    color: '#69f0ae',  border: 'rgba(0,200,83,0.3)' },
    booked:     { bg: 'rgba(255,215,64,0.12)',  color: '#ffd740',  border: 'rgba(255,215,64,0.3)' },
    completed:  { bg: 'rgba(255,255,255,0.05)', color: '#888',     border: 'rgba(255,255,255,0.1)' },
    cancelled:  { bg: 'rgba(255,100,100,0.1)',  color: '#ff8080',  border: 'rgba(255,100,100,0.3)' },
    sold:       { bg: 'rgba(255,100,100,0.1)',  color: '#ff8080',  border: 'rgba(255,100,100,0.3)' },
    pending:    { bg: 'rgba(255,152,0,0.1)',    color: '#ff9800',  border: 'rgba(255,152,0,0.3)' },
  }
  const s = styles[status] || styles.available
  return (
    <span style={{
      fontFamily: 'JetBrains Mono', fontSize: '10px', fontWeight: 700,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      padding: '3px 10px', borderRadius: '2px',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  )
}

function FormField({ label, name, value, onChange, placeholder, type = 'text', required, span = 1 }) {
  return (
    <div style={{ gridColumn: `span ${span}` }}>
      <label style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
        {label}
      </label>
      <input type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        className="input-ghost" style={{ padding: '10px 14px', fontSize: '14px' }} />
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '12px', color: '#888' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a1c9ff" strokeWidth="2" style={{ animation: 'spin 0.8s linear infinite' }}>
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', letterSpacing: '0.1em', color: '#a1c9ff' }}>LOADING...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function EmptyState({ icon, text }) {
  return (
    <div style={{ padding: '48px', textAlign: 'center', color: '#666' }}>
      <span className="material-symbols-outlined" style={{ fontSize: '40px', display: 'block', marginBottom: '12px', opacity: 0.4 }}>{icon}</span>
      <p style={{ fontFamily: 'Inter', fontSize: '14px' }}>{text}</p>
    </div>
  )
}

// ── Sample fallback data ───────────────────────────────────── 
const SAMPLE_CARS = [
  { id:1, model:'BMW M4 Competition', series:'M Series', type:'Coupe', year:2024, status:'available', availability:'both', rent_price_daily:450, sale_price:89500, image_url:'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=200&q=60', created_at: new Date().toISOString() },
  { id:2, model:'BMW M5 CS',          series:'M Series', type:'Sedan', year:2023, status:'booked',    availability:'rent', rent_price_daily:650, sale_price:null,   image_url:'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=200&q=60', created_at: new Date().toISOString() },
  { id:3, model:'BMW X5 M Competition',series:'X Series',type:'SUV',  year:2024, status:'available', availability:'both', rent_price_daily:550, sale_price:115000, image_url:'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=200&q=60', created_at: new Date().toISOString() },
]
const SAMPLE_BOOKINGS = [
  { id:1001, booking_type:'rent', status:'confirmed', start_date:'2025-01-15', end_date:'2025-01-18', total_price:1475, created_at:new Date().toISOString(), cars:{ model:'BMW M4 Competition', image_url:'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=100' }, profiles:{ full_name:'Rami Khalil' } },
  { id:1002, booking_type:'rent', status:'completed', start_date:'2024-12-20', end_date:'2024-12-22', total_price:1450, created_at:new Date().toISOString(), cars:{ model:'BMW X5 M',          image_url:'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=100' }, profiles:{ full_name:'Sarah Mansour' } },
]
const SAMPLE_USERS = [
  { id:'1', full_name:'Rami Khalil',  phone:'+961 70 123456', role:'user',  created_at:new Date().toISOString() },
  { id:'2', full_name:'Admin User',   phone:'+961 71 000000', role:'admin', created_at:new Date().toISOString() },
]
