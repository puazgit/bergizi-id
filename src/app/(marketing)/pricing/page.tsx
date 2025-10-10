import { Metadata } from 'next'
import { PricingPlans } from '@/components/marketing/PricingPlans'
import { PricingFAQ } from '@/components/marketing/PricingFAQ'
import { ROICalculator } from '@/components/marketing/ROICalculator'
import { CTA } from '@/components/marketing/CTA'

export const metadata: Metadata = {
  title: 'Harga & Paket - Bergizi-ID',
  description: 'Pilih paket Bergizi-ID yang sesuai dengan kebutuhan SPPG Anda. Mulai dari trial gratis hingga enterprise unlimited.'
}

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Investasi Terbaik untuk
            <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              SPPG Anda
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Paket fleksibel dengan ROI hingga 300%. Mulai gratis, upgrade sesuai kebutuhan.
          </p>
        </div>
        
        <PricingPlans />
        <ROICalculator />
        <PricingFAQ />
        <CTA />
      </div>
    </div>
  )
}