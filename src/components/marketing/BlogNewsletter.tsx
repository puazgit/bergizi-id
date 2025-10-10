import { Mail } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function BlogNewsletter() {
  return (
    <Card className="p-6">
      <div className="text-center mb-4">
        <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
        <h3 className="font-semibold mb-2">Newsletter</h3>
        <p className="text-sm text-muted-foreground">
          Dapatkan artikel terbaru dan insights langsung di inbox Anda.
        </p>
      </div>
      
      <form className="space-y-3">
        <Input 
          type="email" 
          placeholder="Email Anda"
        />
        <Button className="w-full">
          Berlangganan
        </Button>
      </form>
      
      <p className="text-xs text-muted-foreground text-center mt-3">
        Gratis dan bisa unsubscribe kapan saja
      </p>
    </Card>
  )
}