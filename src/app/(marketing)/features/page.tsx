import { Metadata } from 'next'
import { FeaturesShowcase } from '@/components/marketing/FeaturesShowcase'
import { FeatureComparison } from '@/components/marketing/FeatureComparison'
import { TechnicalSpecs } from '@/components/marketing/TechnicalSpecs'
import { CTA } from '@/components/marketing/CTA'

export const metadata: Metadata = {
  title: 'Fitur Lengkap - Bergizi-ID',
  description: 'Jelajahi fitur-fitur enterprise-grade Bergizi-ID untuk manajemen SPPG yang komprehensif dan efisien.'
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Fitur Enterprise-Grade
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Solusi lengkap untuk manajemen SPPG dengan teknologi terdepan dan standar enterprise internasional.
          </p>
        </div>
        
        <FeaturesShowcase />
        <FeatureComparison />
        <TechnicalSpecs />
        <CTA />
      </div>
    </div>
  )
}