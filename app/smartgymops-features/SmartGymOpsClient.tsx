// app/smartgymops-features/SmartGymOpsClient.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 1.0, delay, ease: EASE } }),
}

const staggerContainer = (stagger = 0.08, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
})

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
}

function Reveal({ children, className, delay = 0 }: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={delay} className={className}>
      {children}
    </motion.div>
  )
}

// ─── Animated Network Node Card ───────────────────────────────────────────────

function NodeCard({ stat, label, index, isActive, onClick }: {
  stat: string
  label: string
  index: number
  isActive: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.9 + index * 0.1, ease: EASE }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className="relative rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-xl text-left transition-all duration-500 cursor-pointer"
      style={{
        borderColor: isActive ? 'rgba(34,211,238,0.5)' : undefined,
        boxShadow: isActive ? '0 0 40px rgba(34,211,238,0.2), inset 0 0 20px rgba(34,211,238,0.05)' : undefined,
      }}
    >
      {/* Pulse ring */}
      {isActive && (
        <>
          <motion.div
            className="absolute inset-0 rounded-[2rem] border border-cyan-400/30"
            animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-0 rounded-[2rem] border border-cyan-400/20"
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
        </>
      )}

      {/* Glow dot */}
      <motion.div
        className="absolute top-4 right-4 h-2 w-2 rounded-full bg-cyan-400"
        animate={isActive
          ? { opacity: [1, 0.3, 1], scale: [1, 1.5, 1] }
          : { opacity: 0.3 }
        }
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="text-5xl font-black text-cyan-300">{stat}</div>
      <div className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-white/70">{label}</div>

      {/* Active indicator */}
      <motion.div
        className="mt-4 h-px bg-cyan-400"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isActive ? 1 : 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        style={{ originX: 0 }}
      />
    </motion.button>
  )
}

// ─── Animated workflow step ───────────────────────────────────────────────────

function WorkflowStep({ step, index, total }: { step: string; index: number; total: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.08, ease: EASE }}
      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl"
    >
      {/* Animated number */}
      <motion.div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-sm font-black text-black"
        whileHover={{ scale: 1.15, rotate: 5 }}
        animate={inView ? { scale: [0.5, 1.1, 1] } : {}}
        transition={{ duration: 0.5, delay: index * 0.08 + 0.2 }}
      >
        {String(index + 1).padStart(2, '0')}
      </motion.div>

      <div className="flex-1">
        <div className="text-lg font-black text-white/88">{step}</div>
      </div>

      {/* Connector line to next */}
      {index < total - 1 && (
        <motion.div
          className="absolute left-[2.75rem] mt-16 h-4 w-px bg-cyan-400/20"
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : {}}
          transition={{ duration: 0.3, delay: index * 0.08 + 0.4 }}
          style={{ originY: 0 }}
        />
      )}

      {/* Checkmark on complete */}
      <motion.div
        className="text-cyan-400/40 text-sm"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
      >
        ✓
      </motion.div>
    </motion.div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const nodes = [
  {
    stat: 'AI',
    label: 'Repair Support',
    detail: 'Generate repair guidance, troubleshooting notes, equipment history summaries, and technician recommendations powered by AI.',
  },
  {
    stat: 'GPS',
    label: 'Tech Tracking',
    detail: 'Track technician location, job arrival, field progress, and active service coverage across the Dallas Fort Worth area.',
  },
  {
    stat: 'QR',
    label: 'Issue Reporting',
    detail: 'Allow gym staff and members to scan equipment QR codes and report issues instantly from the floor. No app required.',
  },
  {
    stat: 'PM',
    label: 'Maintenance Plans',
    detail: 'Track maintenance schedules, recurring service, overdue machines, inspection history, and machine uptime for every facility.',
  },
]

const features = [
  {
    title: 'AI Technician Assistant',
    icon: '🤖',
    text: 'Generate repair guidance, troubleshooting notes, equipment history summaries, and technician recommendations.',
  },
  {
    title: 'GPS Technician Tracking',
    icon: '📍',
    text: 'Track technician location, job arrival, field progress, and active service coverage across Dallas Fort Worth.',
  },
  {
    title: 'Project Management',
    icon: '📋',
    text: 'Manage commercial gym buildouts, installs, assembly projects, tasks, timelines, assignments, and completion stages.',
  },
  {
    title: 'QR Equipment Reporting',
    icon: '📱',
    text: 'Allow gym staff and members to scan equipment QR codes and report issues instantly from the floor.',
  },
  {
    title: 'Service Request Workflow',
    icon: '⚡',
    text: 'Capture, organize, assign, and track every repair request from intake to completion.',
  },
  {
    title: 'Preventative Maintenance',
    icon: '🔧',
    text: 'Track maintenance schedules, recurring service, overdue machines, inspection history, and machine uptime.',
  },
  {
    title: 'Asset History',
    icon: '📊',
    text: 'Store repair history, model information, serial numbers, machine locations, photos, and technician notes.',
  },
  {
    title: 'Client Portal',
    icon: '🏢',
    text: 'Give commercial clients visibility into requests, statuses, completed work, invoices, and maintenance activity.',
  },
]

const workflow = [
  'Issue Reported',
  'Request Created',
  'Technician Assigned',
  'GPS Check-In',
  'AI Repair Support',
  'Job Completed',
  'History Updated',
  'Maintenance Insight Saved',
]

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SmartGymOpsClient() {
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  const [activeNode, setActiveNode] = useState(0)

  // Auto-cycle through nodes
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % nodes.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen overflow-hidden bg-[#070B12] text-white">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div style={{ y: heroY }} className="relative h-[115%] w-[112%]">
            <motion.div
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2.2, ease: EASE }}
              className="h-full w-full"
            >
              <Image
                src="/images/Gym Build.webp"
                alt="SmartGymOps platform for gym equipment operations"
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-70"
              />
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,11,18,0.95)_0%,rgba(7,11,18,0.6)_50%,rgba(7,11,18,0.1)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_38%)]" />

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 flex min-h-screen items-center px-6 py-32 lg:px-16">
          <div className="mx-auto max-w-7xl w-full">
            <div className="max-w-5xl">
              {/* Eyebrow */}
              <div className="mb-8 flex items-center gap-3">
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
                  style={{ originX: 0 }}
                  className="block h-px w-10 bg-cyan-400"
                />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.55 }}
                  className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400"
                >
                  Powered By SmartGymOps
                </motion.span>
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 56 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
                className="text-5xl font-black leading-[0.92] tracking-tight md:text-7xl"
              >
                The Operating System
                <span className="block text-cyan-400">For Fitness Equipment</span>
                <span className="block text-white/40">Service.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
                className="mt-8 max-w-3xl text-lg leading-8 text-white/75 md:text-xl"
              >
                SmartGymOps helps 2EZ TEK manage service requests, AI repair support, technician tracking, QR reporting, asset history, preventative maintenance, and commercial gym projects in one connected platform.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.65, ease: EASE }}
                className="mt-10 flex flex-wrap gap-4"
              >
                <Link href="/contact" className="button-glow rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:scale-105 active:scale-95">
                  Request A Demo
                </Link>
                <Link href="https://smartgymops.com" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-white/10 bg-white/5 px-8 py-5 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">
                  Visit SmartGymOps ↗
                </Link>
              </motion.div>
            </div>

            {/* ── Animated Node Cards ───────────────────────────────────────── */}
            <div className="mt-20">
              <div className="grid gap-4 md:grid-cols-4">
                {nodes.map((node, i) => (
                  <NodeCard
                    key={node.label}
                    stat={node.stat}
                    label={node.label}
                    index={i}
                    isActive={activeNode === i}
                    onClick={() => setActiveNode(i)}
                  />
                ))}
              </div>

              {/* Detail panel — shows info for active node */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeNode}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="mt-4 rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.06] px-7 py-5 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-cyan-400">{nodes[activeNode].stat}</span>
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400/70">{nodes[activeNode].label}</span>
                    <motion.span
                      className="ml-auto h-2 w-2 rounded-full bg-cyan-400"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{nodes[activeNode].detail}</p>

                  {/* Progress bar — shows time until next auto-cycle */}
                  <motion.div
                    className="mt-4 h-px bg-cyan-400/30 rounded-full overflow-hidden"
                  >
                    <motion.div
                      className="h-full bg-cyan-400"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3, ease: 'linear' }}
                      key={activeNode}
                    />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#0B1220] px-6 py-28 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-16 max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-cyan-400" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Platform Features</span>
            </div>
            <h2 className="text-4xl font-black leading-tight md:text-6xl">
              Everything Needed
              <span className="block text-white/45">To Run Smarter Service.</span>
            </h2>
          </Reveal>

          <motion.div
            variants={staggerContainer(0.07, 0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={staggerItem}
                whileHover={{ y: -8, borderColor: 'rgba(34,211,238,0.3)' }}
                transition={{ duration: 0.35, ease: EASE }}
                className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/20 p-7 backdrop-blur-2xl transition-colors duration-500"
              >
                {/* Gradient overlay on hover */}
                <motion.div
                  className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.1),transparent_65%)]"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />

                <div className="relative">
                  {/* Icon with pulse */}
                  <motion.div
                    className="text-3xl"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {feature.icon}
                  </motion.div>

                  <h3 className="mt-5 text-xl font-black leading-tight text-white">{feature.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/60">{feature.text}</p>

                  {/* Bottom accent */}
                  <motion.div
                    className="mt-6 h-px bg-cyan-400"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    style={{ originX: 0 }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Workflow ──────────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#070B12] px-6 py-28 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-[0.9fr,1.1fr] lg:items-start">
            <Reveal>
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-8 bg-cyan-400" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Live Product Flow</span>
              </div>
              <h2 className="text-4xl font-black leading-tight md:text-6xl">
                From Problem
                <span className="block text-white/45">To Resolution.</span>
              </h2>
              <p className="mt-6 text-lg leading-8 text-white/65">
                SmartGymOps connects the entire workflow, from a broken machine report to technician assignment, AI-supported repair, completion, and long-term equipment history.
              </p>

              {/* Live indicator */}
              <div className="mt-10 flex items-center gap-3">
                <motion.div
                  className="h-3 w-3 rounded-full bg-emerald-400"
                  animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">System Active</span>
              </div>
            </Reveal>

            <div className="relative grid gap-3">
              {workflow.map((step, index) => (
                <WorkflowStep key={step} step={step} index={index} total={workflow.length} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#07101D] px-6 py-28 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[3rem] border border-cyan-400/20 bg-black/20 p-10 shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr,360px] lg:items-center">
            <Reveal>
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-8 bg-cyan-400" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Built For Commercial Growth</span>
              </div>
              <h2 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl">
                Repair Service
                <span className="block text-white/45">With Real Technology Behind It.</span>
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">
                This is what separates 2EZ TEK from traditional repair vendors: smarter tracking, better communication, operational visibility, and service history that compounds over time.
              </p>
            </Reveal>

            <Reveal delay={0.15} className="flex flex-col gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/contact"
                  className="block rounded-2xl bg-cyan-400 px-8 py-6 text-center shadow-[0_0_45px_rgba(34,211,238,0.35)] transition hover:bg-cyan-300"
                >
                  <div className="text-xs font-black uppercase tracking-[0.28em] text-black/70">Request Demo</div>
                  <div className="mt-2 text-2xl font-black text-black">SmartGymOps</div>
                </Link>
              </motion.div>

              <a
                href="tel:9728077232"
                className="rounded-2xl border border-white/15 bg-white/10 px-8 py-5 text-center text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur-xl transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
              >
                Call (972) 807-7232
              </a>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  )
}
