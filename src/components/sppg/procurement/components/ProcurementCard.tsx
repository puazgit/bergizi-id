// ProcurementCard Component - Enterprise SPPG Procurement Management
// Bergizi-ID SaaS Platform - Procurement System UI Components

'use client'

import { type FC } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
// import { useProcurementOperations } from '../hooks/useProcurementServerActions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Eye,
  Package,
  Calendar,
  DollarSign,
  User
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
// import type { 
//   ProcurementWithDetails, 
//   PaymentStatus, 
//   DeliveryStatus 
// } from '@/types/domains/procurement'

// Temporary types
type ProcurementWithDetails = any
type PaymentStatus = string
type DeliveryStatus = string

interface ProcurementCardProps {
  procurement: ProcurementWithDetails
  variant?: 'default' | 'compact'
  showActions?: boolean
}

export const ProcurementCard: FC<ProcurementCardProps> = ({ 
  procurement, 
  variant = 'default',
  showActions = true 
}) => {
  // const { mutate: deleteProcurement, isPending: isDeleting } = useDeleteProcurement()
  const isDeleting = false

  const handleDelete = () => {
    if (confirm(`Hapus procurement "${procurement.procurementCode}"?`)) {
      console.log('Delete procurement:', procurement.id)
    }
  }

  const getPaymentStatusVariant = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID': return 'default' as const
      case 'PARTIAL': return 'secondary' as const
      case 'OVERDUE': return 'destructive' as const
      default: return 'outline' as const
    }
  }

  const getDeliveryStatusVariant = (status: DeliveryStatus) => {
    switch (status) {
      case 'DELIVERED': return 'default' as const
      case 'SHIPPED': return 'secondary' as const
      case 'CONFIRMED': return 'outline' as const
      default: return 'outline' as const
    }
  }

  return (
    <Card className={cn(
      'p-6 hover:shadow-lg transition-all duration-200',
      'dark:hover:shadow-xl dark:hover:shadow-primary/5',
      variant === 'compact' && 'p-4'
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={cn(
              'font-semibold text-foreground',
              variant === 'compact' ? 'text-lg' : 'text-xl'
            )}>
              {procurement.procurementCode}
            </h3>
            <Badge 
              variant={getPaymentStatusVariant(procurement.paymentStatus as PaymentStatus)}
              className="ml-2"
            >
              {procurement.paymentStatus}
            </Badge>
            <Badge 
              variant={getDeliveryStatusVariant(procurement.deliveryStatus as DeliveryStatus)}
              className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
            >
              {procurement.deliveryStatus}
            </Badge>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{procurement.supplierName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(procurement.procurementDate), 'dd MMMM yyyy', { locale: id })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>{procurement.items?.length || 0} item</span>
            </div>
          </div>
        </div>

        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link 
                  href={`/procurement/${procurement.id}`}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Lihat Detail
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link 
                  href={`/procurement/${procurement.id}/edit`}
                  className="flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <span className="text-muted-foreground">Total</span>
          <p className="font-semibold text-foreground flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            Rp {procurement.totalAmount.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground">Dibayar</span>
          <p className="font-semibold text-foreground">
            Rp {procurement.paidAmount.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Button asChild className="flex-1">
          <Link href={`/procurement/${procurement.id}`}>
            Lihat Detail
          </Link>
        </Button>
        
        {procurement.paymentStatus !== 'PAID' && (
          <Button 
            variant="outline" 
            size="sm"
            className="border-green-600/30 text-green-600 hover:bg-green-50 dark:border-green-400/50 dark:text-green-400 dark:hover:bg-green-950/20"
          >
            Bayar
          </Button>
        )}
        
        {procurement.deliveryStatus === 'SHIPPED' && (
          <Button 
            variant="outline" 
            size="sm"
            className="border-blue-600/30 text-blue-600 hover:bg-blue-50 dark:border-blue-400/50 dark:text-blue-400 dark:hover:bg-blue-950/20"
          >
            Terima
          </Button>
        )}
      </div>
    </Card>
  )
}