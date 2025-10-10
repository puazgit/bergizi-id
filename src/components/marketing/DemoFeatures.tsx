import { CheckCircle, Play, Users, BarChart3, Shield, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'

const demoFeatures = [
  {
    icon: Users,
    title: 'Live Dashboard Tour',
    description: 'Melihat langsung dashboard real-time dengan data sample SPPG'
  },
  {
    icon: BarChart3,
    title: 'Analytics Demo',
    description: 'Eksplorasi 50+ reports dan predictive analytics capabilities'
  },
  {
    icon: Shield,
    title: 'Security Overview',
    description: 'Penjelasan komprehensif tentang enterprise security features'
  },
  {
    icon: Zap,
    title: 'Performance Test',
    description: 'Demo kecepatan dan responsiveness platform secara real-time'
  }
]

const demoIncludes = [
  'Personalized demo sesuai kebutuhan SPPG Anda',
  'Q&A session dengan product expert',
  'ROI calculation untuk operasional SPPG',
  'Roadmap implementasi custom untuk organisasi',
  'Trial account 14 hari gratis',
  'Konsultasi gratis dengan ahli SPPG'
]

export function DemoFeatures() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Play className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Apa yang akan Anda lihat:</h3>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          {demoFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="flex gap-3">
                <div className="rounded-full p-2 bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">{feature.title}</div>
                  <div className="text-xs text-muted-foreground">{feature.description}</div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Demo Package Includes:</h3>
        <ul className="space-y-2">
          {demoIncludes.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}