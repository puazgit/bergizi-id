import Link from 'next/link'
import { ArrowRight, Shield, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function CTA() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <Card className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 p-8 lg:p-16">
          <div className="relative z-10 text-center text-primary-foreground">
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl mb-6">
              Siap Mentransformasi
              <span className="block">SPPG Anda?</span>
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              Bergabung dengan 1000+ SPPG yang telah merasakan efisiensi operasional hingga 300% 
              dan penghematan biaya signifikan dengan Bergizi-ID.
            </p>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-6 mb-8 text-left">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/20 p-2">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">Enterprise Security</div>
                  <div className="text-sm opacity-80">ISO 27001 & SOC 2 Certified</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/20 p-2">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">Fast Implementation</div>
                  <div className="text-sm opacity-80">Go-live dalam 2 minggu</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/20 p-2">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">24/7 Support</div>
                  <div className="text-sm opacity-80">Tim ahli siap membantu</div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary" 
                asChild
                className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90"
              >
                <Link href="/demo-request">
                  Demo Gratis 30 Menit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild
                className="text-lg px-8 py-6 border-white/20 text-white hover:bg-white/10"
              >
                <Link href="/pricing">
                  Lihat Harga
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 text-sm opacity-80">
              ✓ Trial 14 hari gratis • ✓ Tidak ada setup fee • ✓ Cancel kapan saja
            </div>
          </div>

          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10"></div>
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
        </Card>
      </div>
    </section>
  )
}