'use client'

import { ProcurementCard } from './ProcurementCard'

interface ProcurementListProps {
  procurements: any[]
}

export function ProcurementList({ procurements }: ProcurementListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Procurement List</h2>
        <span className="text-sm text-muted-foreground">
          {procurements.length} items
        </span>
      </div>
      
      <div className="grid gap-4">
        {procurements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No procurement data available
          </div>
        ) : (
          procurements.map((procurement: any) => (
            <ProcurementCard 
              key={procurement.id} 
              procurement={procurement} 
            />
          ))
        )}
      </div>
    </div>
  )
}
