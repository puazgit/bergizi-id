import { 
  MenuSquare, 
  ShoppingCart, 
  Factory, 
  Truck, 
  BarChart3, 
  Shield, 
  Zap, 
  Users,
  CheckCircle
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const features = [
  {
    icon: MenuSquare,
    title: 'Menu Management',
    description: 'Sistem manajemen menu berbasis AI dengan kalkulasi nutrisi otomatis dan optimasi biaya.',
    benefits: ['AI-powered nutrition calculation', 'Cost optimization', 'Seasonal menu planning'],
    color: 'text-blue-500'
  },
  {
    icon: ShoppingCart,
    title: 'Smart Procurement',
    description: 'Procurement otomatis dengan supplier network terintegrasi dan forecasting demand.',
    benefits: ['Automated ordering', 'Supplier network', 'Demand forecasting'],
    color: 'text-green-500'
  },
  {
    icon: Factory,
    title: 'Production Management',
    description: 'Kontrol produksi real-time dengan quality assurance dan waste reduction.',
    benefits: ['Real-time monitoring', 'Quality control', 'Waste reduction'],
    color: 'text-purple-500'
  },
  {
    icon: Truck,
    title: 'Distribution Optimization',
    description: 'Optimasi rute distribusi dengan tracking real-time dan delivery confirmation.',
    benefits: ['Route optimization', 'Real-time tracking', 'Delivery confirmation'],
    color: 'text-orange-500'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reporting',
    description: 'Dashboard analytics dengan 50+ reports dan predictive insights untuk decision making.',
    benefits: ['50+ built-in reports', 'Predictive analytics', 'Custom dashboards'],
    color: 'text-indigo-500'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Keamanan tingkat enterprise dengan compliance audit trail dan data encryption.',
    benefits: ['ISO 27001 certified', 'Audit trail', 'Data encryption'],
    color: 'text-red-500'
  }
]

export function Features() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            🚀 Enterprise-Grade Features
          </Badge>
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl mb-6">
            Fitur Lengkap untuk
            <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Operasional SPPG Modern
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Platform all-in-one dengan teknologi AI dan automation untuk mengoptimalkan 
            setiap aspek operasional SPPG Anda.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="p-6 group hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <div className={`inline-flex rounded-lg p-3 bg-muted/50 ${feature.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                
                <ul className="space-y-2">
                  {feature.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </Card>
            )
          })}
        </div>

        {/* Additional Features Grid */}
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">Lightning Fast</h4>
            <p className="text-sm text-muted-foreground">Sub-3 second loading</p>
          </div>
          <div className="text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">Multi-tenant</h4>
            <p className="text-sm text-muted-foreground">Isolated tenant data</p>
          </div>
          <div className="text-center">
            <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">99.9% Uptime</h4>
            <p className="text-sm text-muted-foreground">Enterprise SLA</p>
          </div>
          <div className="text-center">
            <BarChart3 className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">Real-time Analytics</h4>
            <p className="text-sm text-muted-foreground">Live data insights</p>
          </div>
        </div>
      </div>
    </section>
  )
}