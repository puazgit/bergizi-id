import { TrendingUp, Users, Shield, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'

const stats = [
  {
    icon: Users,
    value: '1,000+',
    label: 'SPPG Aktif',
    description: 'Tersebar di seluruh Indonesia',
    color: 'text-blue-500'
  },
  {
    icon: TrendingUp,
    value: '10M+',
    label: 'Beneficiaries',
    description: 'Dilayani setiap bulannya',
    color: 'text-green-500'
  },
  {
    icon: Shield,
    value: '99.9%',
    label: 'Uptime SLA',
    description: 'Reliability terjamin',
    color: 'text-purple-500'
  },
  {
    icon: Zap,
    value: '300%',
    label: 'Efisiensi Boost',
    description: 'Peningkatan operasional',
    color: 'text-orange-500'
  }
]

const achievements = [
  {
    title: 'ISO 27001 Certified',
    description: 'Standar keamanan internasional'
  },
  {
    title: 'SOC 2 Type II',
    description: 'Security & availability assurance'
  },
  {
    title: 'GDPR Compliant',
    description: 'Data protection compliance'
  },
  {
    title: 'Indonesia Awards 2024',
    description: 'Best SaaS Platform for Public Sector'
  }
]

export function Stats() {
  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl mb-6">
            Dipercaya oleh
            <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Ribuan SPPG Indonesia
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Platform yang telah terbukti meningkatkan efisiensi operasional dan 
            menghemat biaya operasional secara signifikan.
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="p-6 text-center group hover:shadow-lg transition-shadow">
                <div className={`inline-flex rounded-full p-4 bg-muted/50 mb-4 ${stat.color}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg font-semibold mb-1">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </Card>
            )
          })}
        </div>

        {/* Achievements */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-8">Sertifikasi & Penghargaan</h3>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {achievements.map((achievement) => (
            <Card key={achievement.title} className="p-4 text-center">
              <div className="font-semibold text-sm mb-1">{achievement.title}</div>
              <div className="text-xs text-muted-foreground">{achievement.description}</div>
            </Card>
          ))}
        </div>

        {/* ROI Highlight */}
        <Card className="mt-16 p-8 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-200 dark:border-green-800">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
              ROI 300%+
            </div>
            <div className="text-xl font-semibold mb-2">
              Return on Investment dalam 6 bulan
            </div>
            <div className="text-muted-foreground">
              Rata-rata penghematan biaya operasional dan peningkatan efisiensi yang dialami klien kami
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}