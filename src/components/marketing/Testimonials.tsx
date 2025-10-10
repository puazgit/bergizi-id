import { Star, Quote } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'

const testimonials = [
  {
    id: 1,
    name: 'Dra. Siti Nurhaliza, M.Gizi',
    role: 'Kepala SPPG Jakarta Pusat',
    company: 'SPPG Jakarta Pusat',
    image: '/testimonials/siti.jpg',
    rating: 5,
    content: 'Bergizi-ID telah mengubah cara kami mengelola operasional SPPG. Efisiensi meningkat 280% dan biaya operasional turun signifikan. Platform yang luar biasa!'
  },
  {
    id: 2,
    name: 'Dr. Ahmad Wijaya, SKM',
    role: 'Direktur Operasional',
    company: 'SPPG Jawa Barat',
    image: '/testimonials/ahmad.jpg',
    rating: 5,
    content: 'Implementation yang mudah, support team yang responsif, dan hasil yang mencengangkan. Dalam 3 bulan, waste reduction mencapai 45% dengan Bergizi-ID.'
  },
  {
    id: 3,
    name: 'Ns. Maria Kusuma, S.Gz',
    role: 'Ahli Gizi Senior',
    company: 'SPPG Surabaya',
    image: '/testimonials/maria.jpg',
    rating: 5,
    content: 'Fitur AI nutrition calculation sangat membantu dalam penyusunan menu. Akurasi tinggi dan menghemat waktu planning hingga 70%.'
  },
  {
    id: 4,
    name: 'Budi Santoso, SE',
    role: 'Manager Procurement',
    company: 'SPPG Medan',
    image: '/testimonials/budi.jpg',
    rating: 5,
    content: 'Smart procurement feature benar-benar game changer. Forecasting yang akurat dan supplier network yang terintegrasi membuat procurement jadi efisien.'
  },
  {
    id: 5,
    name: 'Prof. Dr. Indira Sari',
    role: 'Konsultan Nutrisi',
    company: 'Kementerian Kesehatan',
    image: '/testimonials/indira.jpg',
    rating: 5,
    content: 'Sebagai konsultan untuk berbagai SPPG, saya melihat Bergizi-ID sebagai standar baru untuk digitalisasi SPPG di Indonesia.'
  },
  {
    id: 6,
    name: 'Andi Rahman, MT',
    role: 'IT Manager',
    company: 'SPPG Makassar',
    image: '/testimonials/andi.jpg',
    rating: 5,
    content: 'Dari sisi technical, platform ini solid. Security enterprise-grade, performance excellent, dan integration yang seamless dengan sistem existing.'
  }
]

export function Testimonials() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl mb-6">
            Apa Kata
            <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Para Ahli SPPG
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Testimonial dari para profesional yang telah merasakan transformasi 
            operasional dengan Bergizi-ID.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="p-6 relative group hover:shadow-lg transition-shadow">
              {/* Quote Icon */}
              <Quote className="h-8 w-8 text-primary/20 mb-4" />
              
              {/* Rating */}
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 bg-gradient-to-br from-primary to-primary/60">
                  <div className="text-white font-semibold">
                    {testimonial.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                </Avatar>
                <div>
                  <div className="font-semibold text-sm">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  <div className="text-xs text-primary">{testimonial.company}</div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Card>
          ))}
        </div>

        {/* Additional Stats */}
        <div className="mt-16 grid gap-8 md:grid-cols-3 text-center">
          <div>
            <div className="text-3xl font-bold text-primary mb-2">4.9/5</div>
            <div className="text-muted-foreground">Customer Satisfaction</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">98%</div>
            <div className="text-muted-foreground">Retention Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-muted-foreground">Enterprise Support</div>
          </div>
        </div>
      </div>
    </section>
  )
}