import { Calendar, User, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Mock blog data
const blogPosts = [
  {
    id: 1,
    title: '5 Strategi Optimasi Procurement untuk SPPG Modern',
    excerpt: 'Pelajari bagaimana teknologi AI dan automation dapat mengurangi biaya procurement hingga 25% sambil meningkatkan kualitas bahan makanan.',
    author: 'Dr. Siti Nurhaliza',
    date: '2024-01-15',
    readTime: '8 min read',
    category: 'Procurement',
    image: '/blog/procurement-optimization.jpg'
  },
  {
    id: 2, 
    title: 'Implementasi Menu Planning Berbasis Nutrisi AI',
    excerpt: 'Revolusi cara SPPG merencanakan menu dengan AI yang dapat mengkalkulasi nutrisi secara otomatis dan optimal sesuai kebutuhan beneficiaries.',
    author: 'Ns. Maria Kusuma',
    date: '2024-01-12',
    readTime: '12 min read',
    category: 'Nutrition',
    image: '/blog/ai-menu-planning.jpg'
  },
  {
    id: 3,
    title: 'Case Study: SPPG Jakarta Pusat Hemat 40% Biaya Operasional',
    excerpt: 'Transformasi digital yang menginspirasi: bagaimana SPPG Jakarta Pusat mencapai efisiensi luar biasa dengan platform Bergizi-ID.',
    author: 'Ahmad Wijaya',
    date: '2024-01-10',
    readTime: '15 min read',
    category: 'Case Study',
    image: '/blog/jakarta-case-study.jpg'
  },
  {
    id: 4,
    title: 'Panduan Lengkap Quality Control dalam Produksi SPPG',
    excerpt: 'Standar quality control yang komprehensif untuk memastikan keamanan dan kualitas makanan yang diproduksi SPPG sesuai regulasi terbaru.',
    author: 'Prof. Dr. Indira Sari',
    date: '2024-01-08',
    readTime: '10 min read',
    category: 'Quality Control',
    image: '/blog/quality-control.jpg'
  }
]

export function BlogList() {
  return (
    <div className="space-y-8">
      {blogPosts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3">
              <div className="h-48 md:h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <div className="text-6xl opacity-20">📰</div>
              </div>
            </div>
            <div className="md:w-2/3 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{post.category}</Badge>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{post.readTime}</span>
              </div>
              
              <h3 className="text-xl font-bold mb-3 hover:text-primary cursor-pointer">
                {post.title}
              </h3>
              
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.date).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" className="group">
                  Baca Selengkapnya
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg">
          Load More Articles
        </Button>
      </div>
    </div>
  )
}