import { 
  Server, 
  Shield, 
  Zap, 
  Globe, 
  Database, 
  Smartphone,
  Check,
  Monitor,
  Cloud,
  Code
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const technicalSpecs = {
  architecture: [
    {
      icon: Server,
      title: 'Cloud-Native Architecture',
      specs: [
        'Microservices dengan Docker containers',
        'Auto-scaling dengan Kubernetes',
        'Multi-region deployment',
        'Edge computing untuk latency rendah'
      ]
    },
    {
      icon: Database,
      title: 'Enterprise Database',
      specs: [
        'PostgreSQL 17+ dengan connection pooling',
        'Redis untuk caching & session management', 
        'Automated daily backups',
        'Point-in-time recovery'
      ]
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      specs: [
        'ISO 27001 & SOC 2 Type II certified',
        'End-to-end encryption (AES-256)',
        'Multi-factor authentication',
        'Regular penetration testing'
      ]
    },
    {
      icon: Zap,
      title: 'Performance & Scalability',
      specs: [
        'Sub-3 second loading times',
        '99.9% uptime SLA',
        'Handle 10,000+ concurrent users',
        'CDN global untuk Indonesia'
      ]
    }
  ],
  technology: [
    {
      category: 'Frontend',
      icon: Monitor,
      technologies: [
        { name: 'Next.js 15', description: 'React framework dengan App Router' },
        { name: 'TypeScript', description: 'Type-safe development' },
        { name: 'Tailwind CSS', description: 'Utility-first CSS framework' },
        { name: 'PWA Support', description: 'Progressive Web App capabilities' }
      ]
    },
    {
      category: 'Backend',
      icon: Server,
      technologies: [
        { name: 'Node.js 18+', description: 'Runtime dengan Edge support' },
        { name: 'Prisma ORM', description: 'Database toolkit modern' },
        { name: 'NextAuth.js', description: 'Authentication solution' },
        { name: 'Zod', description: 'Schema validation' }
      ]
    },
    {
      category: 'Infrastructure',
      icon: Cloud,
      technologies: [
        { name: 'Vercel/AWS', description: 'Enterprise hosting dengan auto-scaling' },
        { name: 'PostgreSQL', description: 'Reliable relational database' },
        { name: 'Redis', description: 'In-memory caching' },
        { name: 'Docker', description: 'Containerization untuk consistency' }
      ]
    },
    {
      category: 'Integration',
      icon: Code,
      technologies: [
        { name: 'REST APIs', description: 'RESTful dengan OpenAPI 3.0' },
        { name: 'Webhook Support', description: 'Real-time event notifications' },
        { name: 'SSO Integration', description: 'SAML, OAuth 2.0, OIDC' },
        { name: 'Third-party APIs', description: 'Payment, logistics, government APIs' }
      ]
    }
  ],
  performance: [
    { metric: 'Core Web Vitals', value: '95+', description: 'Lighthouse performance score' },
    { metric: 'First Load', value: '<3s', description: 'Initial page load time' },
    { metric: 'API Response', value: '<100ms', description: 'Average API response time' },
    { metric: 'Uptime', value: '99.9%', description: 'Service level agreement' },
    { metric: 'Concurrent Users', value: '10K+', description: 'Simultaneous active users' },
    { metric: 'Data Processing', value: '1M+ records/hr', description: 'Transaction processing capacity' }
  ],
  security: [
    { standard: 'ISO 27001', status: 'Certified', description: 'Information security management' },
    { standard: 'SOC 2 Type II', status: 'Certified', description: 'Security & availability controls' },
    { standard: 'GDPR', status: 'Compliant', description: 'Data protection regulation' },
    { standard: 'PCI DSS', status: 'Level 1', description: 'Payment card industry standards' }
  ]
}

export function TechnicalSpecs() {
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4">
          🔧 Technical Excellence
        </Badge>
        <h2 className="text-3xl font-bold mb-4">Spesifikasi Teknis Enterprise-Grade</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Dibangun dengan teknologi terdepan dan standar enterprise untuk reliability, 
          scalability, dan security tingkat dunia.
        </p>
      </div>

      {/* Architecture Overview */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
        {technicalSpecs.architecture.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.title} className="p-6">
              <Icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-3">{item.title}</h3>
              <ul className="space-y-1">
                {item.specs.map((spec) => (
                  <li key={spec} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    {spec}
                  </li>
                ))}
              </ul>
            </Card>
          )
        })}
      </div>

      {/* Technology Stack */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold mb-8 text-center">Technology Stack</h3>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {technicalSpecs.technology.map((stack) => {
            const Icon = stack.icon
            return (
              <Card key={stack.category} className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">{stack.category}</h4>
                </div>
                <ul className="space-y-3">
                  {stack.technologies.map((tech) => (
                    <li key={tech.name} className="border-l-2 border-muted pl-3">
                      <div className="font-medium text-sm">{tech.name}</div>
                      <div className="text-xs text-muted-foreground">{tech.description}</div>
                    </li>
                  ))}
                </ul>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold mb-8 text-center">Performance Metrics</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {technicalSpecs.performance.map((metric) => (
            <Card key={metric.metric} className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{metric.value}</div>
              <div className="font-medium text-sm mb-1">{metric.metric}</div>
              <div className="text-xs text-muted-foreground">{metric.description}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Security & Compliance */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold mb-8 text-center">Security & Compliance</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {technicalSpecs.security.map((item) => (
            <Card key={item.standard} className="p-4 text-center">
              <Badge variant="outline" className="mb-2 text-green-600 border-green-600">
                {item.status}
              </Badge>
              <div className="font-semibold text-sm mb-1">{item.standard}</div>
              <div className="text-xs text-muted-foreground">{item.description}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Mobile & Device Support */}
      <Card className="p-8 bg-gradient-to-r from-muted/30 to-transparent">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold">Multi-Platform Support</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Akses dari perangkat apapun dengan experience yang optimal dan konsisten.
            </p>
            <ul className="space-y-2">
              {[
                'Progressive Web App (PWA) dengan offline support',
                'Responsive design untuk mobile, tablet, desktop',
                'Native mobile app (iOS & Android) - coming soon',
                'Cross-browser compatibility (Chrome, Firefox, Safari, Edge)'
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-4 p-6 bg-background rounded-lg border">
              <Monitor className="h-8 w-8 text-primary" />
              <Smartphone className="h-8 w-8 text-primary" />
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Desktop • Mobile • Web
            </p>
          </div>
        </div>
      </Card>
    </section>
  )
}