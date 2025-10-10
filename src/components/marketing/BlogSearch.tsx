'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function BlogSearch() {
  return (
    <div className="mb-8">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari artikel, topik, atau kata kunci..."
            className="pl-10"
          />
        </div>
        <Button>Cari</Button>
      </div>
    </div>
  )
}