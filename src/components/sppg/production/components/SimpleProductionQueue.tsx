'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, ChefHat } from 'lucide-react'

interface SimpleProductionQueueProps {
  productions: any[]
}

export function SimpleProductionQueue({ productions }: SimpleProductionQueueProps) {
  // Filter untuk productions yang sedang aktif atau akan dimulai
  const activeProductions = productions.filter(p => 
    ['PLANNED', 'PREPARING', 'COOKING'].includes(p.status)
  ).slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChefHat className="h-5 w-5" />
          Antrian Produksi
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeProductions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            Tidak ada produksi dalam antrian.
          </div>
        ) : (
          <div className="space-y-3">
            {activeProductions.map((production, index) => (
              <div key={production.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{production.menu.menuName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {production.productionTime}
                    <span>•</span>
                    <span>{production.quantityPlanned} porsi</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    Chef: {production.assignedChef}
                  </p>
                </div>
                <Badge variant={
                  production.status === 'COOKING' ? 'default' :
                  production.status === 'PREPARING' ? 'secondary' :
                  'outline'
                }>
                  {production.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}