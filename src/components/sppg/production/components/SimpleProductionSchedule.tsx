'use client'

import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SimpleProductionScheduleProps {
  productions: any[]
}

export function SimpleProductionSchedule({ productions }: SimpleProductionScheduleProps) {
  if (productions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Jadwal Produksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada jadwal produksi tersedia.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jadwal Produksi ({productions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {productions.slice(0, 10).map((production) => (
            <div key={production.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold">{production.menu.menuName}</h3>
                <p className="text-sm text-muted-foreground">
                  {production.program.name}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span>
                    {format(new Date(production.productionDate), 'dd MMM yyyy', { locale: id })}
                  </span>
                  <span>{production.productionTime}</span>
                  <span>{production.menu.mealType}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Batch: {production.batchNumber} | Target: {production.quantityPlanned} porsi
                </p>
              </div>
              <div className="text-right">
                <Badge variant={
                  production.status === 'COMPLETED' ? 'default' :
                  production.status === 'COOKING' ? 'secondary' :
                  production.status === 'PLANNED' ? 'outline' :
                  'secondary'
                }>
                  {production.status}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">
                  Chef: {production.assignedChef}
                </div>
              </div>
            </div>
          ))}
          {productions.length > 10 && (
            <div className="text-center text-sm text-muted-foreground pt-4">
              ... dan {productions.length - 10} jadwal lainnya
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}