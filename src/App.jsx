import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import Scene from './Scene'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

// Check reduced motion preference
const prefersReducedMotion = typeof window !== 'undefined' 
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function App() {
  const [morphTarget, setMorphTarget] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const containerRef = useRef(null)
  const lenisRef = useRef(null)

  // Lenis smooth scroll
  useEffect(() => {
    if (prefersReducedMotion) return
    
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    })
    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(lenis.raf)
    }
  }, [])

  // GSAP ScrollTrigger for morph targets and text reveals
  useEffect(() => {
    if (prefersReducedMotion) return
    
    const ctx = gsap.context(() => {
      // Global scroll progress for camera rotation
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => setScrollProgress(self.progress),
      })

      // Section 0: Hero — sphere (already default)
      // Morph 1: sphere → explosion when scrolling past hero
      ScrollTrigger.create({
        trigger: '.section--manifesto',
        start: 'top 80%',
        onEnter: () => setMorphTarget(1),
        onLeaveBack: () => setMorphTarget(0),
      })

      // Morph 2: explosion → text "AURA" at showcase
      ScrollTrigger.create({
        trigger: '.section--showcase',
        start: 'top 60%',
        onEnter: () => setMorphTarget(2),
        onLeaveBack: () => setMorphTarget(1),
      })

      // Morph 3: text → helix at capabilities
      ScrollTrigger.create({
        trigger: '.section--capabilities',
        start: 'top 60%',
        onEnter: () => setMorphTarget(3),
        onLeaveBack: () => setMorphTarget(2),
      })

      // Morph 4: helix → grid at team
      ScrollTrigger.create({
        trigger: '.section--team',
        start: 'top 60%',
        onEnter: () => setMorphTarget(4),
        onLeaveBack: () => setMorphTarget(3),
      })

      // Morph 5: grid → scatter at contact
      ScrollTrigger.create({
        trigger: '.section--contact',
        start: 'top 60%',
        onEnter: () => setMorphTarget(5),
        onLeaveBack: () => setMorphTarget(4),
      })

      // Text reveal animations — staggered with proper easing
      gsap.utils.toArray('.reveal-text').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          y: 80,
          opacity: 0,
          duration: 1,
          ease: 'power4.out',
        })
      })

      // Staggered list reveals
      gsap.utils.toArray('.reveal-stagger').forEach((container) => {
        const items = container.querySelectorAll('.stagger-item')
        gsap.from(items, {
          scrollTrigger: {
            trigger: container,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
          y: 60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: 'expo.out',
        })
      })

      // Horizontal line reveals
      gsap.utils.toArray('.reveal-line').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
          scaleX: 0,
          transformOrigin: 'left center',
          duration: 1.2,
          ease: 'power3.inOut',
        })
      })

      // Counter animations
      gsap.utils.toArray('.counter').forEach((el) => {
        const target = parseInt(el.dataset.target, 10)
        const obj = { val: 0 }
        gsap.to(obj, {
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = Math.round(obj.val)
          },
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <>
      <Scene morphTarget={morphTarget} scrollProgress={scrollProgress} />
      
      <div ref={containerRef} className="content-layer">
        {/* ─── HERO ─── */}
        <section className="section section--hero">
          <div className="hero-content">
            <p className="hero-label reveal-text">Creative Technology Studio</p>
            <h1 className="hero-title">
              <span className="hero-line reveal-text">We craft</span>
              <span className="hero-line reveal-text">digital</span>
              <span className="hero-line hero-line--accent reveal-text">experiences</span>
            </h1>
            <p className="hero-sub reveal-text">
              Strategy, design, and engineering for brands that refuse to blend in.
            </p>
          </div>
          <div className="scroll-indicator">
            <div className="scroll-line" />
          </div>
        </section>

        {/* ─── MANIFESTO ─── */}
        <section className="section section--manifesto">
          <div className="manifesto-grid">
            <div className="manifesto-left">
              <span className="section-label reveal-text">01 / Manifesto</span>
              <div className="reveal-line" style={{ width: '60px', height: '1px', background: 'var(--accent)', margin: '24px 0' }} />
            </div>
            <div className="manifesto-right">
              <h2 className="manifesto-heading reveal-text">
                We believe technology should feel like magic, not machinery.
              </h2>
              <p className="manifesto-body reveal-text">
                Every pixel, every interaction, every millisecond of motion is intentional. 
                We don't decorate screens — we choreograph moments that make people stop, 
                lean in, and remember.
              </p>
              <p className="manifesto-body reveal-text">
                Founded in Amsterdam in 2019, AURA sits at the intersection of creative 
                direction, interaction design, and precision engineering. Our team of 12 
                designers and developers has shipped work for brands across fashion, 
                architecture, automotive, and the arts.
              </p>
            </div>
          </div>
        </section>

        {/* ─── SHOWCASE ─── */}
        <section className="section section--showcase">
          <span className="section-label reveal-text">02 / Selected Work</span>
          <div className="reveal-line" style={{ width: '60px', height: '1px', background: 'var(--accent)', margin: '24px 0' }} />
          
          <div className="showcase-grid reveal-stagger">
            <a href="#" className="showcase-card stagger-item">
              <div className="showcase-img" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
                <span className="showcase-number">01</span>
              </div>
              <div className="showcase-info">
                <h3>Volkov Architecture</h3>
                <p>Immersive portfolio with scroll-driven 3D model viewer</p>
                <span className="showcase-tags">WebGL / Three.js / GSAP</span>
              </div>
            </a>
            <a href="#" className="showcase-card stagger-item">
              <div className="showcase-img" style={{ background: 'linear-gradient(135deg, #2d1b69, #11001c)' }}>
                <span className="showcase-number">02</span>
              </div>
              <div className="showcase-info">
                <h3>Maison Noire</h3>
                <p>Luxury fragrance brand with particle transitions and shader effects</p>
                <span className="showcase-tags">R3F / Custom Shaders / Lenis</span>
              </div>
            </a>
            <a href="#" className="showcase-card stagger-item">
              <div className="showcase-img" style={{ background: 'linear-gradient(135deg, #0d2818, #04471c)' }}>
                <span className="showcase-number">03</span>
              </div>
              <div className="showcase-info">
                <h3>Solis Energy</h3>
                <p>Clean-tech startup with data-driven scroll narrative</p>
                <span className="showcase-tags">D3.js / ScrollTrigger / Motion</span>
              </div>
            </a>
            <a href="#" className="showcase-card stagger-item">
              <div className="showcase-img" style={{ background: 'linear-gradient(135deg, #3d0c02, #1a0000)' }}>
                <span className="showcase-number">04</span>
              </div>
              <div className="showcase-info">
                <h3>Komorebi Films</h3>
                <p>Film studio showcase with cinematic video transitions</p>
                <span className="showcase-tags">Video / Canvas / GSAP</span>
              </div>
            </a>
          </div>
        </section>

        {/* ─── CAPABILITIES ─── */}
        <section className="section section--capabilities">
          <div className="cap-header">
            <span className="section-label reveal-text">03 / What We Do</span>
            <div className="reveal-line" style={{ width: '60px', height: '1px', background: 'var(--accent)', margin: '24px 0' }} />
            <h2 className="cap-title reveal-text">End-to-end, nothing less.</h2>
          </div>
          
          <div className="cap-list reveal-stagger">
            <div className="cap-item stagger-item">
              <span className="cap-number">01</span>
              <h3 className="cap-name">Creative Direction</h3>
              <p className="cap-desc">Brand strategy, visual identity, and art direction that sets the tone before a single pixel is placed.</p>
            </div>
            <div className="cap-divider reveal-line" />
            <div className="cap-item stagger-item">
              <span className="cap-number">02</span>
              <h3 className="cap-name">Interaction Design</h3>
              <p className="cap-desc">Choreographed motion, micro-interactions, and scroll experiences that feel inevitable.</p>
            </div>
            <div className="cap-divider reveal-line" />
            <div className="cap-item stagger-item">
              <span className="cap-number">03</span>
              <h3 className="cap-name">WebGL & 3D</h3>
              <p className="cap-desc">Custom Three.js scenes, shader effects, particle systems, and real-time 3D — all GPU-driven, all 60fps.</p>
            </div>
            <div className="cap-divider reveal-line" />
            <div className="cap-item stagger-item">
              <span className="cap-number">04</span>
              <h3 className="cap-name">Engineering</h3>
              <p className="cap-desc">React, Next.js, headless CMS, performance optimization. We build what we design — no handoff gap.</p>
            </div>
          </div>
        </section>

        {/* ─── STATS ─── */}
        <section className="section section--stats">
          <div className="stats-row reveal-stagger">
            <div className="stat stagger-item">
              <span className="stat-number counter" data-target="47">0</span>
              <span className="stat-label">Projects shipped</span>
            </div>
            <div className="stat stagger-item">
              <span className="stat-number counter" data-target="12">0</span>
              <span className="stat-label">Team members</span>
            </div>
            <div className="stat stagger-item">
              <span className="stat-number counter" data-target="8">0</span>
              <span className="stat-label">Awwwards SOTD</span>
            </div>
            <div className="stat stagger-item">
              <span className="stat-number">60</span>
              <span className="stat-label">FPS or it doesn't ship</span>
            </div>
          </div>
        </section>

        {/* ─── TEAM ─── */}
        <section className="section section--team">
          <span className="section-label reveal-text">04 / The Team</span>
          <div className="reveal-line" style={{ width: '60px', height: '1px', background: 'var(--accent)', margin: '24px 0' }} />
          <h2 className="team-title reveal-text">Small team. Deep craft.</h2>
          <p className="team-sub reveal-text">
            Twelve people who obsess over the details. Designers who code, 
            engineers who design, and nobody who settles for "good enough."
          </p>
          
          <div className="team-grid reveal-stagger">
            {[
              { name: 'Lena van der Berg', role: 'Founder & Creative Director' },
              { name: 'Kai Nakamura', role: 'Technical Director' },
              { name: 'Sofia Morales', role: 'Design Lead' },
              { name: 'Marcus Chen', role: 'WebGL Engineer' },
              { name: 'Amara Osei', role: 'Motion Designer' },
              { name: 'Jonas Eriksson', role: 'Full-Stack Engineer' },
            ].map((person, i) => (
              <div key={i} className="team-member stagger-item">
                <div className="team-avatar" style={{ 
                  background: `hsl(${60 + i * 30}, 60%, ${20 + i * 5}%)` 
                }}>
                  <span>{person.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <h4>{person.name}</h4>
                <p>{person.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CONTACT ─── */}
        <section className="section section--contact">
          <div className="contact-content">
            <span className="section-label reveal-text">05 / Get in Touch</span>
            <div className="reveal-line" style={{ width: '60px', height: '1px', background: 'var(--accent)', margin: '24px 0' }} />
            <h2 className="contact-heading reveal-text">
              Let's build something<br />
              <span className="accent">worth remembering.</span>
            </h2>
            <div className="contact-links reveal-stagger">
              <a href="mailto:hello@aura.studio" className="contact-link stagger-item">
                hello@aura.studio
              </a>
              <a href="#" className="contact-link stagger-item">
                Instagram
              </a>
              <a href="#" className="contact-link stagger-item">
                Twitter / X
              </a>
              <a href="#" className="contact-link stagger-item">
                LinkedIn
              </a>
            </div>
            <div className="contact-footer reveal-text">
              <p>AURA Creative Technology Studio</p>
              <p>Keizersgracht 520, Amsterdam</p>
              <p>The Netherlands</p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
