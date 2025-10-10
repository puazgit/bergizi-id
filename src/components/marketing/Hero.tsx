'use client'

import Link from 'next/link'
import { ArrowRight, Play, Shield, Zap, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <Badge variant="secondary" className="w-fit">
              🚀 Platform Enterprise-Grade untuk SPPG Indonesia
            </Badge>

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                Revolusi
                <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Manajemen SPPG
                </span>
                di Indonesia
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Platform SaaS terdepan untuk transformasi digital SPPG dengan teknologi enterprise-grade. 
                Tingkatkan efisiensi operasional hingga <strong className="text-primary">300%</strong> dan 
                hemat biaya operasional signifikan.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-8 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1000+</div>
                <div className="text-muted-foreground">SPPG Aktif</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10M+</div>
                <div className="text-muted-foreground">Beneficiaries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">99.9%</div>
                <div className="text-muted-foreground">Uptime</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link href="/demo-request">
                  Demo Gratis Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                <Play className="mr-2 h-5 w-5" />
                Tonton Video Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                ISO 27001 Certified
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                99.9% SLA Guarantee  
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                24/7 Enterprise Support
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            {/* Dashboard Preview */}
            <div className="relative mx-auto w-full max-w-lg">
              <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-8 shadow-2xl ring-1 ring-border">
                {/* Mock Dashboard */}
                <div className="h-full rounded-lg bg-background p-4 shadow-inner">
                  {/* Header */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="h-4 w-24 rounded bg-muted"></div>
                    <div className="h-4 w-16 rounded bg-primary/20"></div>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="mb-4 grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded bg-muted/50 p-2">
                        <div className="mb-1 h-2 w-12 rounded bg-muted"></div>
                        <div className="h-3 w-8 rounded bg-primary/30"></div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Chart Area */}
                  <div className="h-20 rounded bg-gradient-to-r from-primary/10 to-primary/5 p-2">
                    <div className="h-full w-full rounded bg-primary/20"></div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -right-4 -top-4 rounded-full bg-green-500 p-3 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-full bg-blue-500 p-3 shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl"></div>
      </div>
    </section>
  )
}