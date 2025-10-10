import { Star, Quote } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'

const demoTestimonials = [
  {
    name: 'Dr. Ahmad Susanto',
    position: 'Kepala SPPG Bandung',
    quote: 'Demo yang sangat informatif! Dalam 30 menit, saya sudah bisa melihat potential impact yang luar biasa untuk operasional SPPG kami.',
    rating: 5
  },
  {
    name: 'Siti Rahayu, S.Gz',
    position: 'Ahli Gizi SPPG Surabaya', 
    quote: 'Tim demo-nya sangat knowledgeable. Mereka bisa jawab semua pertanyaan teknis dan memberikan solusi yang tepat sasaran.',
    rating: 5
  }
]

export function DemoTestimonials() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Testimonial Demo Experience</h3>
      
      <div className="space-y-4">
        {demoTestimonials.map((testimonial, index) => (
          <div key={index} className="border-l-2 border-primary/20 pl-4">
            <Quote className="h-4 w-4 text-primary/40 mb-2" />
            
            <p className="text-sm text-muted-foreground mb-3 italic">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 bg-gradient-to-br from-primary to-primary/60">
                <div className="text-white text-xs font-semibold">
                  {testimonial.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              </Avatar>
              <div>
                <div className="text-xs font-medium">{testimonial.name}</div>
                <div className="text-xs text-muted-foreground">{testimonial.position}</div>
              </div>
            </div>
            
            <div className="flex mt-2">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}