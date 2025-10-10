'use client'

import { Hero } from '@/components/marketing/Hero'
import { Features } from '@/components/marketing/Features'
import { Stats } from '@/components/marketing/Stats'
import { Testimonials } from '@/components/marketing/Testimonials'
import { CTA } from '@/components/marketing/CTA'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <Stats />
      <Testimonials />
      <CTA />
    </main>
  )
}