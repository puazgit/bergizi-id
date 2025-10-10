import { Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const pricingPlans = [
  {
    name: 'Starter',
    price: 'Gratis',
    period: '14 hari trial',
    description: 'Cocok untuk SPPG kecil yang ingin mencoba platform',
    features: [
      'Maksimal 100 beneficiaries',
      'Basic menu management',
      'Simple procurement',
      'Basic reporting',
      'Email support',
      'Mobile access'
    ],
    limitations: [
      'Limited advanced features',
      'Basic analytics only',
      'Community support'
    ],
    cta: 'Mulai Trial Gratis',
    popular: false
  },
  {
    name: 'Professional',
    price: 'Rp 2.500.000',
    period: 'per bulan',
    description: 'Solusi lengkap untuk SPPG menengah',
    features: [
      'Maksimal 5.000 beneficiaries',
      'AI-powered menu planning',
      'Smart procurement system',
      'Advanced production control',
      'Distribution optimization',
      'Advanced analytics & reporting',
      'Priority support',
      'SSO integration',
      'API access',
      'Custom workflows'
    ],
    limitations: [],
    cta: 'Mulai Sekarang',
    popular: true,
    savings: 'Hemat 20% vs bulanan'
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'sesuai kebutuhan',
    description: 'Solusi enterprise untuk SPPG besar dan multi-location',
    features: [
      'Unlimited beneficiaries',
      'Full platform access',
      'Custom integrations',
      'Dedicated account manager',
      '24/7 premium support',
      'Custom reporting',
      'Advanced security',
      'Compliance support',
      'Training & onboarding',
      'SLA guarantee 99.9%'
    ],
    limitations: [],
    cta: 'Hubungi Sales',
    popular: false,
    enterprise: true
  }
]

export function PricingPlans() {
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Pilih Paket yang Tepat</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Semua paket include fitur core platform. Upgrade atau downgrade kapan saja.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 max-w-7xl mx-auto">
        {pricingPlans.map((plan) => (
          <Card key={plan.name} className={`p-8 relative ${plan.popular ? 'ring-2 ring-primary shadow-lg scale-105' : ''}`}>
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Star className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground ml-2">/{plan.period}</span>
                )}
              </div>
              {plan.savings && (
                <Badge variant="secondary" className="mb-4">
                  {plan.savings}
                </Badge>
              )}
              <p className="text-muted-foreground">{plan.description}</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="space-y-2">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              className={`w-full ${plan.popular ? 'bg-primary' : ''}`}
              variant={plan.popular ? 'default' : 'outline'}
            >
              {plan.cta}
            </Button>

            {plan.enterprise && (
              <p className="text-xs text-center text-muted-foreground mt-4">
                Custom pricing based on requirements
              </p>
            )}
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold mb-6">Semua paket termasuk:</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              SSL Certificate & Security
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Automated Backups
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              99.9% Uptime SLA
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Mobile Apps Access
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}