import { 
  MenuSquare, 
  ShoppingCart, 
  Factory, 
  Truck, 
  BarChart3,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const featuresDetailed = [
  {
    id: 'menu-management',
    icon: MenuSquare,
    title: 'Menu Management System',
    subtitle: 'AI-Powered Nutrition Planning',
    description: 'Sistem manajemen menu berbasis AI dengan kalkulasi nutrisi otomatis, optimasi biaya, dan seasonal menu planning untuk efisiensi maksimal.',
    features: [
      'AI-powered nutrition calculation dengan akurasi 99%',
      'Cost optimization algorithms untuk penghematan biaya',
      'Seasonal menu planning dengan weather data integration',
      'Allergen management dan dietary restrictions',
      'Multi-language menu support (Indonesia, English)',
      'Integration dengan supplier database untuk real-time pricing'
    ],
    benefits: [
      'Hemat waktu planning hingga 70%',
      'Akurasi nutrisi 99%+',
      'Penghematan biaya bahan 25%'
    ],
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'procurement',
    icon: ShoppingCart,
    title: 'Smart Procurement',
    subtitle: 'Automated Supply Chain Management',
    description: 'Sistem procurement otomatis dengan supplier network terintegrasi, demand forecasting, dan automated ordering untuk supply chain yang efisien.',
    features: [
      'Demand forecasting dengan machine learning algorithms',
      'Automated purchase order generation',
      'Supplier network integration dengan 500+ suppliers',
      'Price comparison dan negotiation tools',
      'Inventory optimization dengan minimum stock levels',
      'Contract management dan vendor performance tracking'
    ],
    benefits: [
      'Reduce procurement time 60%',
      'Lower costs through bulk ordering',
      'Zero stockout situations'
    ],
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'production',
    icon: Factory,
    title: 'Production Management',
    subtitle: 'Real-time Production Control',
    description: 'Kontrol produksi real-time dengan quality assurance, waste reduction, dan production optimization untuk operational excellence.',
    features: [
      'Real-time production monitoring dan tracking',
      'Quality control checkpoints dengan IoT sensors',
      'Waste reduction algorithms dan sustainability metrics',
      'Production scheduling optimization',
      'Staff productivity tracking dan performance analytics',
      'Equipment maintenance scheduling dan predictive maintenance'
    ],
    benefits: [
      'Reduce waste by 45%',
      'Improve quality consistency',
      'Optimize staff productivity'
    ],
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'distribution',
    icon: Truck,
    title: 'Distribution Optimization',
    subtitle: 'Smart Logistics & Delivery',
    description: 'Optimasi rute distribusi dengan tracking real-time, delivery confirmation, dan logistics optimization untuk customer satisfaction maksimal.',
    features: [
      'Route optimization dengan AI algorithms',
      'Real-time GPS tracking untuk semua delivery vehicles',
      'Delivery confirmation dengan digital signatures',
      'Customer notification system via SMS/WhatsApp',
      'Temperature monitoring untuk food safety',
      'Delivery performance analytics dan optimization'
    ],
    benefits: [
      'Reduce delivery time 40%',
      'Improve customer satisfaction',
      'Lower logistics costs'
    ],
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'reporting',
    icon: BarChart3,
    title: 'Analytics & Reporting',
    subtitle: 'Business Intelligence Platform',
    description: 'Dashboard analytics comprehensive dengan 50+ built-in reports, predictive insights, dan custom dashboards untuk data-driven decision making.',
    features: [
      '50+ built-in reports dengan customization options',
      'Predictive analytics untuk demand forecasting',
      'Custom dashboard builder dengan drag-and-drop interface',
      'Real-time KPI monitoring dan alerting',
      'Advanced data visualization dengan interactive charts',
      'Export capabilities ke PDF, Excel, dan PowerPoint'
    ],
    benefits: [
      'Data-driven decision making',
      'Improved operational visibility',
      'Better planning accuracy'
    ],
    color: 'from-indigo-500 to-indigo-600'
  }
]

export function FeaturesShowcase() {
  return (
    <section className="py-16">
      <div className="space-y-16">
        {featuresDetailed.map((feature, index) => {
          const Icon = feature.icon
          const isEven = index % 2 === 0
          
          return (
            <div key={feature.id} id={feature.id} className="grid gap-8 lg:grid-cols-2 lg:items-center">
              {/* Content */}
              <div className={isEven ? 'lg:order-1' : 'lg:order-2'}>
                <Badge variant="secondary" className="mb-4">
                  <Icon className="h-4 w-4 mr-2" />
                  {feature.subtitle}
                </Badge>
                
                <h3 className="text-3xl font-bold mb-4">{feature.title}</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  {feature.description}
                </p>

                {/* Key Features */}
                <div className="space-y-2 mb-6">
                  {feature.features.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Benefits */}
                <div className="grid gap-2 md:grid-cols-3 mb-6">
                  {feature.benefits.map((benefit) => (
                    <div key={benefit} className="text-xs bg-muted/50 rounded-lg p-2 text-center">
                      {benefit}
                    </div>
                  ))}
                </div>

                <Button className="group">
                  Pelajari Lebih Lanjut
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Visual */}
              <div className={isEven ? 'lg:order-2' : 'lg:order-1'}>
                <Card className="p-8 relative overflow-hidden">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-10`} />
                  
                  {/* Mock Interface */}
                  <div className="relative z-10 aspect-[4/3] rounded-lg bg-background border shadow-inner p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 bg-gradient-to-br ${feature.color} text-white rounded p-1`} />
                        <div className="h-3 w-24 bg-muted rounded" />
                      </div>
                      <div className="h-3 w-16 bg-primary/20 rounded" />
                    </div>
                    
                    {/* Content Area */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-muted/50 rounded p-2 space-y-1">
                            <div className="h-2 bg-muted rounded" />
                            <div className={`h-3 bg-gradient-to-r ${feature.color} rounded w-1/2`} />
                          </div>
                        ))}
                      </div>
                      
                      <div className={`h-16 bg-gradient-to-r ${feature.color} opacity-20 rounded`} />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-8 bg-muted/30 rounded" />
                        <div className="h-8 bg-muted/30 rounded" />
                      </div>
                    </div>
                  </div>

                  {/* Floating Icon */}
                  <div className={`absolute -top-4 -right-4 rounded-full bg-gradient-to-br ${feature.color} p-4 shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </Card>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}