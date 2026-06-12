'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function LogoCanvas({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // ── renderer ──────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 0, 9.5)

    // ── lights ────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const key = new THREE.DirectionalLight(0xffffff, 1.0)
    key.position.set(4, 6, 8)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x9cc8ff, 0.7)
    rim.position.set(-6, -2, -4)
    scene.add(rim)
    const blueGlow = new THREE.PointLight(0x1d7dff, 1.2, 30)
    blueGlow.position.set(0, 0, 5)
    scene.add(blueGlow)

    const logo = new THREE.Group()
    scene.add(logo)



    // ── text stack helper ─────────────────────────────────────────────
    function textCanvas(text: string, fill: string | ((ctx: CanvasRenderingContext2D, c: HTMLCanvasElement) => CanvasGradient), stroke?: string) {
      const c = document.createElement('canvas')
      c.width = 1280; c.height = 420
      const ctx = c.getContext('2d')!
      ctx.font = '900 300px "Arial Black", Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.lineJoin = 'round'
      ctx.fillStyle = typeof fill === 'function' ? fill(ctx, c) : fill
      if (stroke) {
        ctx.strokeStyle = stroke
        ctx.lineWidth = 14
        ctx.strokeText(text, c.width / 2, c.height / 2 + 10)
      }
      ctx.fillText(text, c.width / 2, c.height / 2 + 10)
      return c
    }

    function makeTextStack(
      text: string,
      topGrad: (ctx: CanvasRenderingContext2D, c: HTMLCanvasElement) => CanvasGradient,
      sideColor: string,
      width: number,
      y: number,
    ) {
      const group = new THREE.Group()
      const aspect = 420 / 1280
      const h = width * aspect
      const geo = new THREE.PlaneGeometry(width, h)

      const sideTex = new THREE.CanvasTexture(textCanvas(text, sideColor, sideColor))
      sideTex.anisotropy = 8
      const sideMat = new THREE.MeshBasicMaterial({ map: sideTex, transparent: true, alphaTest: 0.45, side: THREE.DoubleSide })

      const topTex = new THREE.CanvasTexture(textCanvas(text, topGrad))
      topTex.anisotropy = 8
      const topMat = new THREE.MeshBasicMaterial({ map: topTex, transparent: true, alphaTest: 0.45, side: THREE.DoubleSide })

      const LAYERS = 34, DEPTH = 0.46
      for (let i = 0; i < LAYERS; i++) {
        const m = new THREE.Mesh(geo, i === LAYERS - 1 ? topMat : sideMat)
        m.position.z = -DEPTH / 2 + (DEPTH * i / (LAYERS - 1))
        group.add(m)
      }
      group.position.y = y
      return group
    }

    const silverGrad = (ctx: CanvasRenderingContext2D, c: HTMLCanvasElement) => {
      const g = ctx.createLinearGradient(0, 40, 0, c.height - 40)
      g.addColorStop(0.00, '#ffffff')
      g.addColorStop(0.42, '#dde2e8')
      g.addColorStop(0.50, '#8e97a2')
      g.addColorStop(0.62, '#c7cdd5')
      g.addColorStop(1.00, '#f4f6f8')
      return g
    }
    const blueGrad = (ctx: CanvasRenderingContext2D, c: HTMLCanvasElement) => {
      const g = ctx.createLinearGradient(0, 40, 0, c.height - 40)
      g.addColorStop(0.00, '#cfe9ff')
      g.addColorStop(0.38, '#3fa2ff')
      g.addColorStop(0.50, '#0b6fe6')
      g.addColorStop(0.78, '#0a4ec0')
      g.addColorStop(1.00, '#3e95ff')
      return g
    }

    logo.add(makeTextStack('2EZ', silverGrad, '#4d545e', 3.15, 0.52))
    logo.add(makeTextStack('TEK', blueGrad, '#072c66', 3.05, -0.55))

    // ── accent bars ───────────────────────────────────────────────────
    function accentBar(y: number) {
      const g = new THREE.Group()
      const barMat = new THREE.MeshPhongMaterial({
        color: 0x9fb4c9, specular: 0xffffff, shininess: 100,
        emissive: 0x0a3a8f, emissiveIntensity: 0.25,
      })
      const bar = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.055, 0.07), barMat)
      g.add(bar)
      const diaMat = new THREE.MeshPhongMaterial({
        color: 0x1d7dff, emissive: 0x0a47c2, emissiveIntensity: 0.9,
        specular: 0xffffff, shininess: 120,
      })
      const dia = new THREE.Mesh(new THREE.OctahedronGeometry(0.12), diaMat)
      dia.scale.set(1.3, 1, 0.55)
      g.add(dia)
      g.position.y = y
      return g
    }
    logo.add(accentBar(1.42))
    logo.add(accentBar(-1.42))

    // ── sizing ────────────────────────────────────────────────────────
    function fit() {
      const s = Math.min(mount!.clientWidth, mount!.clientHeight)
      if (s > 0) {
        renderer.setSize(s, s, false)
        camera.updateProjectionMatrix()
      }
    }
    const ro = new ResizeObserver(fit)
    ro.observe(mount)
    fit()

    // ── animation loop ────────────────────────────────────────────────
    const clock = new THREE.Clock()
    let rafId: number
    function animate() {
      rafId = requestAnimationFrame(animate)
      logo.rotation.y += clock.getDelta() * 0.7
      renderer.render(scene, camera)
    }
    animate()

    // ── cleanup ───────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className={className} style={{ aspectRatio: '1 / 1' }} />
}
