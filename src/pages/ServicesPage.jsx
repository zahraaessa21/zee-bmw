// ============================================================
// pages/ServicesPage.jsx — Services Showcase
// ============================================================
// Sections:
//   1. Hero — "Our Services" header with background
//   2. Main Services Grid — 6 service cards
//   3. How It Works — 4-step process flow
//   4. Insurance & Protection tiers
//   5. CTA — Book a vehicle
// ============================================================

import { useNavigate } from 'react-router-dom'

// ── Hero image ────────────────────────────────────────────── 
// To use your own photo:
// 1. Rename your file to: services-hero.jpg (no spaces!)
// 2. Copy it to: src/images/services-hero.jpg
// 3. Uncomment the import below:
// import serviceHero from '../images/services-hero.jpg'
//
// For now we use a fallback online image
import serviceHero from '../images/services-hero.jpg'

// ── Service data ──────────────────────────────────────────── 
const SERVICES = [
  {
    icon: 'directions_car',
    title: 'Daily Rental',
    subtitle: 'From 1 Day',
    description: 'Rent any BMW M-Series vehicle for a single day or weekend. Flexible pickup and return at any of our locations. Perfect for special occasions or business trips.',
    features: ['Free cancellation 24h before', 'Full insurance included', 'Unlimited mileage option', 'Same-day availability'],
    price: 'From $350/day',
    color: '#a1c9ff',
  },
  {
    icon: 'calendar_month',
    title: 'Long-Term Lease',
    subtitle: '1–12 Months',
    description: 'Access a rotating fleet with monthly flexibility. Swap vehicles monthly, enjoy priority access, and eliminate depreciation risk entirely.',
    features: ['Swap vehicle monthly', 'Priority fleet access', 'Zero depreciation risk', 'Tax-efficient solutions'],
    price: 'From $2,800/mo',
    color: '#a1c9ff',
  },
  {
    icon: 'local_shipping',
    title: 'Concierge Delivery',
    subtitle: 'Door to Door',
    description: 'Your vehicle delivered to your home, office, hotel, or private hangar. Our white-glove team handles everything from preparation to handover.',
    features: ['Delivery within 2 hours', 'Any location in the city', 'Full vehicle walkthrough', '24/7 concierge line'],
    price: '+$150 flat fee',
    color: '#a1c9ff',
  },
  {
    icon: 'shield',
    title: 'Full Protection',
    subtitle: 'Zero Deductible',
    description: 'Our Platinum Protection plan covers everything — collision, theft, and roadside assistance — with zero out-of-pocket deductible.',
    features: ['Zero deductible', 'Collision & theft covered', '24/7 roadside assistance', 'Replacement vehicle'],
    price: 'From $125/day',
    color: '#a1c9ff',
  },
  {
    icon: 'build',
    title: 'M-Tech Maintenance',
    subtitle: 'Factory-Grade',
    description: 'Every vehicle in our fleet is maintained by certified BMW M-Technicians. 150-point inspection before every rental guarantee.',
    features: ['150-point inspection', 'BMW-certified technicians', 'Factory-spec performance', 'Full service history'],
    price: 'Included in all rentals',
    color: '#a1c9ff',
  },
  {
    icon: 'payments',
    title: 'Certified Purchase',
    subtitle: 'Buy from Fleet',
    description: 'Acquire a low-mileage, meticulously maintained M-Series from our professional fleet. Full service history, extended warranty, and direct pricing.',
    features: ['Direct fleet pricing', 'Extended warranty', 'M-Certified inspection', 'Export assistance'],
    price: 'From $79,900',
    color: '#a1c9ff',
  },
]

// ── How It Works steps ─────────────────────────────────────── 
const STEPS = [
  { number: '01', icon: 'search', title: 'Browse Fleet', desc: 'Explore our curated collection of BMW M-Series vehicles and filter by series, type, and availability.' },
  { number: '02', icon: 'calendar_today', title: 'Select Dates', desc: 'Choose your pickup date, return date, location, and preferred insurance tier.' },
  { number: '03', icon: 'lock', title: 'Secure Booking', desc: 'Confirm your reservation securely. We verify your identity and process payment instantly.' },
  { number: '04', icon: 'directions_car', title: 'Take the Wheel', desc: 'Your vehicle is prepared, inspected, and delivered to your chosen location. Enjoy the drive.' },
]

// ── Insurance tiers ────────────────────────────────────────── 
const INSURANCE_TIERS = [
  {
    name: 'Standard',
    price: '$35',
    period: '/day',
    deductible: '$2,000',
    features: ['Third-party liability', 'Basic collision', 'Theft protection'],
    highlight: false,
  },
  {
    name: 'Executive',
    price: '$75',
    period: '/day',
    deductible: '$500',
    features: ['Everything in Standard', 'Reduced deductible', 'Windshield coverage', 'Roadside assistance'],
    highlight: false,
  },
  {
    name: 'Platinum',
    price: '$125',
    period: '/day',
    deductible: '$0',
    features: ['Everything in Executive', 'Zero deductible', 'Personal accident cover', 'Free replacement car', 'Priority towing'],
    highlight: true,
  },
]

export default function ServicesPage() {
  const navigate = useNavigate()

  return (
    <main className="page-wrapper">

      {/* ══════════════════════════════════════════════════
          HERO
          ══════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', minHeight: '420px', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img
            src={serviceHero}
            alt="Services hero"
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #131313 30%, transparent 100%)' }} />
        </div>

        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: '1440px', margin: '0 auto',
          padding: '60px var(--page-pad)',
          width: '100%',
        }}>
          <span className="section-eyebrow">What We Offer</span>
          <h1 className="section-title" style={{ maxWidth: '600px', marginBottom: '1.5rem' }}>
            PREMIUM<br />
            <span style={{ color: '#a1c9ff' }}>SERVICES</span>
          </h1>
          <p style={{
            fontFamily: 'Inter', fontSize: 'clamp(15px, 2vw, 18px)',
            color: '#c1c7d3', lineHeight: 1.7, maxWidth: '480px',
          }}>
            From single-day rentals to certified fleet acquisitions — 
            every service is engineered for the discerning driver.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SERVICES GRID — 3 columns on desktop
          ══════════════════════════════════════════════════ */}
      <section style={{
        padding: 'var(--section-gap) var(--page-pad)',
        maxWidth: '1440px', margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span className="section-eyebrow">Our Offerings</span>
          <h2 className="section-title">EVERYTHING YOU NEED</h2>
        </div>

        <div className="grid-3">
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.title} service={service} index={i} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          HOW IT WORKS — 4 steps
          ══════════════════════════════════════════════════ */}
      <section style={{ background: '#0e0e0e', padding: 'var(--section-gap) var(--page-pad)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span className="section-eyebrow">Process</span>
            <h2 className="section-title">HOW IT WORKS</h2>
          </div>

          {/* Steps — responsive grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '32px',
            position: 'relative',
          }}>
            {STEPS.map((step, i) => (
              <div key={step.number} style={{ position: 'relative' }}>
                {/* Connector line between steps (hidden on mobile) */}
                {i < STEPS.length - 1 && (
                  <div style={{
                    position: 'absolute', top: '28px', left: 'calc(100% + 4px)',
                    width: 'calc(100% - 8px)', height: '1px',
                    background: 'linear-gradient(to right, rgba(161,201,255,0.3), transparent)',
                    display: 'none',
                  }} className="step-connector" />
                )}

                <div className="glass-card animate-fadeUp" style={{
                  padding: '2rem', borderRadius: '6px',
                  animationDelay: `${i * 100}ms`,
                }}>
                  {/* Step number */}
                  <div style={{
                    fontFamily: 'JetBrains Mono', fontSize: '11px',
                    color: '#a1c9ff', letterSpacing: '0.1em',
                    marginBottom: '16px', opacity: 0.7,
                  }}>
                    STEP {step.number}
                  </div>

                  {/* Icon */}
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%',
                    background: 'rgba(161,201,255,0.1)',
                    border: '1px solid rgba(161,201,255,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '20px',
                  }}>
                    <span className="material-symbols-outlined icon-filled"
                      style={{ fontSize: '24px', color: '#a1c9ff' }}>
                      {step.icon}
                    </span>
                  </div>

                  <h3 style={{
                    fontFamily: 'Montserrat', fontSize: '18px',
                    fontWeight: 700, textTransform: 'uppercase',
                    marginBottom: '10px',
                  }}>
                    {step.title}
                  </h3>
                  <p style={{ fontFamily: 'Inter', fontSize: '14px', color: '#c1c7d3', lineHeight: 1.7 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <button onClick={() => navigate('/fleet')} className="btn-primary" style={{ padding: '18px 48px', fontSize: '14px' }}>
              BROWSE THE FLEET
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          INSURANCE TIERS
          ══════════════════════════════════════════════════ */}
      <section style={{
        padding: 'var(--section-gap) var(--page-pad)',
        maxWidth: '1440px', margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span className="section-eyebrow">Protection Plans</span>
          <h2 className="section-title">INSURANCE TIERS</h2>
          <p style={{
            fontFamily: 'Inter', fontSize: '16px', color: '#c1c7d3',
            maxWidth: '500px', margin: '16px auto 0', lineHeight: 1.7,
          }}>
            Drive with confidence. Choose the protection level that fits your journey.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px', maxWidth: '960px', margin: '0 auto',
        }}>
          {INSURANCE_TIERS.map(tier => (
            <InsuranceTierCard key={tier.name} tier={tier} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          BOTTOM CTA BANNER
          ══════════════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #0e0e0e 0%, #1a2535 100%)',
        borderTop: '1px solid rgba(161,201,255,0.15)',
        padding: 'var(--section-gap) var(--page-pad)',
        textAlign: 'center',
      }}>
        <span className="section-eyebrow" style={{ justifyContent: 'center', display: 'block' }}>Ready?</span>
        <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>
          START YOUR EXPERIENCE
        </h2>
        <p style={{
          fontFamily: 'Inter', fontSize: '17px', color: '#c1c7d3',
          maxWidth: '460px', margin: '0 auto 2.5rem', lineHeight: 1.7,
        }}>
          Browse our full fleet and book your preferred BMW M-Series today.
          Concierge support available 24/7.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/fleet')} className="btn-primary" style={{ padding: '18px 48px' }}>
            BROWSE FLEET
          </button>
          <button onClick={() => navigate('/register')} className="btn-ghost" style={{ padding: '18px 40px' }}>
            CREATE ACCOUNT
          </button>
        </div>
      </section>
    </main>
  )
}

// ── Service Card ──────────────────────────────────────────── 
function ServiceCard({ service, index }) {
  return (
    <div className="glass-card animate-fadeUp" style={{
      padding: '2rem', borderRadius: '6px',
      display: 'flex', flexDirection: 'column', gap: '16px',
      transition: 'border-color 0.3s, transform 0.2s',
      animationDelay: `${index * 80}ms`,
      cursor: 'default',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'rgba(161,201,255,0.35)'
      e.currentTarget.style.transform = 'translateY(-4px)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
      e.currentTarget.style.transform = 'translateY(0)'
    }}
    >
      {/* Icon */}
      <div style={{
        width: '56px', height: '56px', borderRadius: '4px',
        background: 'rgba(161,201,255,0.1)',
        border: '1px solid rgba(161,201,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="material-symbols-outlined icon-filled"
          style={{ fontSize: '28px', color: '#a1c9ff' }}>
          {service.icon}
        </span>
      </div>

      {/* Title */}
      <div>
        <span style={{
          fontFamily: 'JetBrains Mono', fontSize: '10px',
          color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase',
          display: 'block', marginBottom: '4px',
        }}>
          {service.subtitle}
        </span>
        <h3 style={{
          fontFamily: 'Montserrat', fontSize: '20px',
          fontWeight: 700, textTransform: 'uppercase',
        }}>
          {service.title}
        </h3>
      </div>

      {/* Description */}
      <p style={{
        fontFamily: 'Inter', fontSize: '14px',
        color: '#c1c7d3', lineHeight: 1.7, flexGrow: 1,
      }}>
        {service.description}
      </p>

      {/* Features */}
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {service.features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="material-symbols-outlined icon-filled"
              style={{ fontSize: '16px', color: '#a1c9ff', flexShrink: 0 }}>check_circle</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', letterSpacing: '0.05em', color: '#e4e2e1' }}>{f}</span>
          </li>
        ))}
      </ul>

      {/* Price tag */}
      <div style={{
        paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)',
        fontFamily: 'Montserrat', fontSize: '15px', fontWeight: 600,
        color: '#a1c9ff',
      }}>
        {service.price}
      </div>
    </div>
  )
}

// ── Insurance Tier Card ────────────────────────────────────── 
function InsuranceTierCard({ tier }) {
  return (
    <div style={{
      padding: '2rem', borderRadius: '8px',
      background: tier.highlight ? 'rgba(161,201,255,0.08)' : 'rgba(255,255,255,0.04)',
      border: tier.highlight ? '1px solid rgba(161,201,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
      position: 'relative', overflow: 'hidden',
      boxShadow: tier.highlight ? '0 0 40px rgba(161,201,255,0.12)' : 'none',
    }}>
      {/* Recommended badge */}
      {tier.highlight && (
        <div style={{
          position: 'absolute', top: '16px', right: '16px',
          background: '#a1c9ff', color: '#00325a',
          fontFamily: 'JetBrains Mono', fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '4px 10px', borderRadius: '2px',
        }}>
          RECOMMENDED
        </div>
      )}

      <h3 style={{
        fontFamily: 'Montserrat', fontSize: '22px', fontWeight: 700,
        textTransform: 'uppercase', marginBottom: '4px',
      }}>
        {tier.name}
      </h3>
      <div style={{ marginBottom: '8px' }}>
        <span style={{ fontFamily: 'Montserrat', fontSize: '32px', fontWeight: 700, color: '#a1c9ff' }}>
          {tier.price}
        </span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#888' }}>{tier.period}</span>
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono', fontSize: '11px',
        color: '#c1c7d3', marginBottom: '24px', letterSpacing: '0.06em',
      }}>
        DEDUCTIBLE: {tier.deductible}
      </div>

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
        {tier.features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="material-symbols-outlined icon-filled"
              style={{ fontSize: '16px', color: '#a1c9ff', flexShrink: 0 }}>check_circle</span>
            <span style={{ fontFamily: 'Inter', fontSize: '14px', color: '#c1c7d3' }}>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
