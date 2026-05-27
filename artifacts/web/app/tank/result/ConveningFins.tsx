'use client'

import { useEffect, useRef } from 'react'

// Vertical position of the "water surface" within the container
const WATERLINE = 0.56

interface FinDef {
  size: number
  cx: number       // orbit center x, fraction of container width
  rx: number       // horizontal orbit radius, fraction of width
  ry: number       // vertical orbit radius, fraction of height
  belowWL: number  // orbit center offset below waterline, fraction of height
  speed: number    // rad/s
  phase: number    // starting angle (rad)
}

const FINS: FinDef[] = [
  // A — closest, fastest, tight circle near surface
  { size: 130, cx: 0.42, rx: 0.26, ry: 0.14, belowWL: 0.18, speed: 0.52, phase: 0.0 },
  // B — mid-distance, lazy wide sweep
  { size: 100, cx: 0.60, rx: 0.22, ry: 0.11, belowWL: 0.15, speed: 0.30, phase: 2.1 },
  // C — deep diver, slow — large ry causes periodic submersion
  { size:  76, cx: 0.50, rx: 0.19, ry: 0.28, belowWL: 0.20, speed: 0.18, phase: 4.3 },
]

export function ConveningFins() {
  const containerRef = useRef<HTMLDivElement>(null)
  const finElsRef   = useRef<(HTMLDivElement | null)[]>([null, null, null])
  const rafRef      = useRef<number>(0)
  const t0Ref       = useRef<number | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const container = containerRef.current
    if (!container) return

    function frame(ts: number) {
      if (t0Ref.current === null) t0Ref.current = ts
      const t = (ts - t0Ref.current!) / 1000

      const W   = container!.offsetWidth
      const H   = container!.offsetHeight
      const wlY = WATERLINE * H

      // Fins fade in over the first 1.5 s — feels like a reveal, not a snap
      const entrance = Math.min(1, t / 1.5)

      FINS.forEach((fin, i) => {
        const el = finElsRef.current[i]
        if (!el) return

        const angle = t * fin.speed + fin.phase
        const ocx   = fin.cx   * W
        const ocy   = wlY + fin.belowWL * H

        // Bottom-center of fin traces the ellipse
        const bx = ocx + fin.rx * W * Math.cos(angle)
        const by = ocy + fin.ry * H * Math.sin(angle)

        const left   = bx - fin.size / 2
        const top    = by - fin.size
        // Mirror when travelling left (sin > 0 on a CW orbit)
        const scaleX = Math.sin(angle) > 0 ? -1 : 1

        // Fade out as fin dives below the waterline
        const submerge = Math.max(0, (by - wlY) / (fin.ry * H))
        const opacity  = Math.max(0.08, 1 - submerge * 0.92) * entrance

        el.style.transform = `translate(${left.toFixed(1)}px, ${top.toFixed(1)}px) scaleX(${scaleX})`
        el.style.opacity    = opacity.toFixed(3)
      })

      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '580px',
        height: '280px',
        margin: '0 auto',
        overflow: 'hidden',
        background: '#f0e4d2',
        WebkitMaskImage: 'radial-gradient(ellipse 84% 88% at 50% 54%, black 36%, transparent 72%)',
        maskImage:        'radial-gradient(ellipse 84% 88% at 50% 54%, black 36%, transparent 72%)',
      }}
    >
      {FINS.map((fin, i) => (
        <div
          key={i}
          ref={(el) => { finElsRef.current[i] = el }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width:  fin.size,
            height: fin.size,
            willChange: 'transform',
            pointerEvents: 'none',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/single-fin.png"
            alt=""
            width={fin.size}
            height={fin.size}
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      ))}
    </div>
  )
}
