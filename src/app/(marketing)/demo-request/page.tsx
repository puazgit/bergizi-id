import { Metadata } from 'next'
import { DemoRequestForm } from '@/components/marketing/DemoRequestForm'
import { DemoFeatures } from '@/components/marketing/DemoFeatures'
import { DemoTestimonials } from '@/components/marketing/DemoTestimonials'

export const metadata: Metadata = {
  title: 'Request Demo - Bergizi-ID',
  description: 'Dapatkan demo eksklusif Bergizi-ID dan lihat langsung bagaimana platform kami dapat mentransformasi operasional SPPG Anda.'
}

export default function DemoRequestPage() {
  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Lihat Bergizi-ID
            <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              dalam Aksi
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Dapatkan demo personal 30 menit dengan ahli kami dan rasakan pengalaman platform enterprise-grade.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <DemoRequestForm />
          </div>
          <div className="space-y-8">
            <DemoFeatures />
            <DemoTestimonials />
          </div>
        </div>
      </div>
    </div>
  )
}