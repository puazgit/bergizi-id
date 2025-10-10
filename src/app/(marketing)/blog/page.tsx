import { Metadata } from 'next'
import { BlogList } from '@/components/marketing/BlogList'
import { BlogCategories } from '@/components/marketing/BlogCategories'
import { BlogSearch } from '@/components/marketing/BlogSearch'
import { BlogNewsletter } from '@/components/marketing/BlogNewsletter'

export const metadata: Metadata = {
  title: 'Blog - Bergizi-ID',
  description: 'Artikel terbaru tentang manajemen SPPG, teknologi gizi, dan best practices dari para ahli.'
}

export default function BlogPage() {
  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Blog & Insights
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Wawasan mendalam tentang manajemen SPPG, inovasi teknologi gizi, dan strategi operasional terkini.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <BlogSearch />
            <BlogList />
          </div>
          <div className="lg:col-span-1">
            <BlogCategories />
            <BlogNewsletter />
          </div>
        </div>
      </div>
    </div>
  )
}