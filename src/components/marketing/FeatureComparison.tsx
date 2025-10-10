import { Check, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const comparisonData = {
  categories: [
    {
      name: 'Core Features',
      features: [
        'Menu Management',
        'Procurement System', 
        'Production Control',
        'Distribution Management',
        'Analytics & Reporting',
        'Multi-tenant Architecture'
      ]
    },
    {
      name: 'Advanced Features',
      features: [
        'AI-powered Nutrition Calculation',
        'Demand Forecasting',
        'Route Optimization',
        'Quality Control Automation',
        'Predictive Analytics',
        'IoT Sensor Integration'
      ]
    },
    {
      name: 'Enterprise Features',
      features: [
        'Custom Dashboards',
        'API Access',
        'SSO Integration',
        'Advanced Security',
        'Audit Trail',
        '24/7 Support'
      ]
    },
    {
      name: 'Compliance & Security',
      features: [
        'ISO 27001 Certification',
        'SOC 2 Type II',
        'GDPR Compliance',
        'Data Encryption',
        'Role-based Access Control',
        'Regular Security Audits'
      ]
    }
  ],
  plans: [
    {
      name: 'Traditional System',
      price: 'Variable',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50 dark:bg-gray-900',
      features: {
        'Menu Management': false,
        'Procurement System': 'partial',
        'Production Control': false,
        'Distribution Management': false,
        'Analytics & Reporting': 'basic',
        'Multi-tenant Architecture': false,
        'AI-powered Nutrition Calculation': false,
        'Demand Forecasting': false,
        'Route Optimization': false,
        'Quality Control Automation': false,
        'Predictive Analytics': false,
        'IoT Sensor Integration': false,
        'Custom Dashboards': false,
        'API Access': false,
        'SSO Integration': false,
        'Advanced Security': 'basic',
        'Audit Trail': false,
        '24/7 Support': false,
        'ISO 27001 Certification': false,
        'SOC 2 Type II': false,
        'GDPR Compliance': false,
        'Data Encryption': 'basic',
        'Role-based Access Control': false,
        'Regular Security Audits': false
      }
    },
    {
      name: 'Competitor A',
      price: '$2,000/month',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      features: {
        'Menu Management': true,
        'Procurement System': true,
        'Production Control': 'partial',
        'Distribution Management': 'partial',
        'Analytics & Reporting': true,
        'Multi-tenant Architecture': false,
        'AI-powered Nutrition Calculation': false,
        'Demand Forecasting': 'basic',
        'Route Optimization': false,
        'Quality Control Automation': false,
        'Predictive Analytics': false,
        'IoT Sensor Integration': false,
        'Custom Dashboards': 'partial',
        'API Access': 'limited',
        'SSO Integration': 'addon',
        'Advanced Security': true,
        'Audit Trail': true,
        '24/7 Support': 'business-hours',
        'ISO 27001 Certification': false,
        'SOC 2 Type II': false,
        'GDPR Compliance': true,
        'Data Encryption': true,
        'Role-based Access Control': true,
        'Regular Security Audits': false
      }
    },
    {
      name: 'Bergizi-ID',
      price: 'Mulai $500/month',
      color: 'text-primary',
      bgColor: 'bg-primary/5',
      isHighlight: true,
      features: {
        'Menu Management': true,
        'Procurement System': true,
        'Production Control': true,
        'Distribution Management': true,
        'Analytics & Reporting': true,
        'Multi-tenant Architecture': true,
        'AI-powered Nutrition Calculation': true,
        'Demand Forecasting': true,
        'Route Optimization': true,
        'Quality Control Automation': true,
        'Predictive Analytics': true,
        'IoT Sensor Integration': true,
        'Custom Dashboards': true,
        'API Access': true,
        'SSO Integration': true,
        'Advanced Security': true,
        'Audit Trail': true,
        '24/7 Support': true,
        'ISO 27001 Certification': true,
        'SOC 2 Type II': true,
        'GDPR Compliance': true,
        'Data Encryption': true,
        'Role-based Access Control': true,
        'Regular Security Audits': true
      }
    }
  ]
}

export function FeatureComparison() {
  const renderFeatureStatus = (status: boolean | string) => {
    if (status === true) {
      return <Check className="h-4 w-4 text-green-500" />
    }
    if (status === false) {
      return <X className="h-4 w-4 text-gray-300" />
    }
    if (typeof status === 'string') {
      return <span className="text-xs text-muted-foreground">{status}</span>
    }
    return <X className="h-4 w-4 text-gray-300" />
  }

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Perbandingan Komprehensif</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Lihat mengapa Bergizi-ID adalah pilihan terbaik dibandingkan solusi tradisional dan kompetitor.
        </p>
      </div>

      <div className="overflow-x-auto">
        <Card className="min-w-[800px]">
          <div className="grid grid-cols-4 gap-0">
            {/* Header */}
            <div className="p-4 border-b">
              <h3 className="font-semibold">Features</h3>
            </div>
            {comparisonData.plans.map((plan) => (
              <div key={plan.name} className={`p-4 border-b text-center ${plan.bgColor} ${plan.isHighlight ? 'border-l-2 border-l-primary' : ''}`}>
                <h3 className={`font-semibold ${plan.color}`}>{plan.name}</h3>
                {plan.isHighlight && (
                  <Badge className="mt-1">Recommended</Badge>
                )}
                <p className="text-sm text-muted-foreground mt-1">{plan.price}</p>
              </div>
            ))}

            {/* Feature Categories */}
            {comparisonData.categories.map((category) => (
              <div key={category.name}>
                {/* Category Header */}
                <div className="col-span-4 grid grid-cols-4 bg-muted/30">
                  <div className="p-3 font-medium text-sm">{category.name}</div>
                  <div className="p-3"></div>
                  <div className="p-3"></div>
                  <div className="p-3"></div>
                </div>

                {/* Category Features */}
                {category.features.map((feature) => (
                  <div key={feature} className="col-span-4 grid grid-cols-4 border-b border-border/50">
                    <div className="p-3 text-sm">{feature}</div>
                    {comparisonData.plans.map((plan) => (
                      <div key={plan.name} className={`p-3 text-center ${plan.isHighlight ? 'bg-primary/5' : ''}`}>
                        {renderFeatureStatus(plan.features[feature as keyof typeof plan.features])}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-8">
        <p className="text-muted-foreground mb-4">
          Masih ragu? Bandingkan langsung dengan demo gratis 30 menit
        </p>
      </div>
    </section>
  )
}