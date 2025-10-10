/**
 * IngredientSelector Component
 * 
 * Searchable dropdown for selecting inventory items as menu ingredients
 * Shows item details (stock, price, category) with filtering
 * Supports dark mode and keyboard navigation
 * 
 * @module components/sppg/menu/components/IngredientSelector
 */

'use client'

import { type FC, useState, useMemo } from 'react'
import { Check, ChevronsUpDown, Search, Package, DollarSign, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface InventoryItem {
  id: string
  itemName: string
  itemCode: string
  category: string
  unit: string
  currentStock: number
  minimumStock: number
  lastPrice: number | null
  averagePrice: number | null
  calories: number | null
  protein: number | null
}

interface IngredientSelectorProps {
  items: InventoryItem[]
  selectedId?: string
  onSelect: (item: InventoryItem | null) => void
  placeholder?: string
  disabled?: boolean
  isLoading?: boolean
  className?: string
  showStockStatus?: boolean
  showPrice?: boolean
  filterByStock?: boolean
}

/**
 * Get stock status configuration
 */
const getStockStatus = (current: number, minimum: number) => {
  const percentage = (current / minimum) * 100
  
  if (current === 0) {
    return { label: 'Habis', color: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300', textColor: 'text-red-600 dark:text-red-400' }
  } else if (percentage <= 50) {
    return { label: 'Rendah', color: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300', textColor: 'text-yellow-600 dark:text-yellow-400' }
  } else {
    return { label: 'Tersedia', color: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300', textColor: 'text-green-600 dark:text-green-400' }
  }
}

/**
 * Format price
 */
const formatPrice = (price: number | null): string => {
  if (price === null) return 'N/A'
  return `Rp ${price.toLocaleString('id-ID')}`
}

export const IngredientSelector: FC<IngredientSelectorProps> = ({
  items,
  selectedId,
  onSelect,
  placeholder = 'Pilih bahan...',
  disabled = false,
  isLoading = false,
  className,
  showStockStatus = true,
  showPrice = true,
  filterByStock = false,
}) => {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter items
  const filteredItems = useMemo(() => {
    let filtered = items

    // Filter by stock if enabled
    if (filterByStock) {
      filtered = filtered.filter((item) => item.currentStock > 0)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.itemName.toLowerCase().includes(query) ||
          item.itemCode.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      )
    }

    // Sort: available stock first, then by name
    return filtered.sort((a, b) => {
      if (a.currentStock > 0 && b.currentStock === 0) return -1
      if (a.currentStock === 0 && b.currentStock > 0) return 1
      return a.itemName.localeCompare(b.itemName)
    })
  }, [items, searchQuery, filterByStock])

  // Get selected item
  const selectedItem = items.find((item) => item.id === selectedId)

  // Group items by category
  const itemsByCategory = useMemo(() => {
    const groups: Record<string, InventoryItem[]> = {}
    filteredItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = []
      }
      groups[item.category].push(item)
    })
    return groups
  }, [filteredItems])

  if (isLoading) {
    return <Skeleton className={cn('h-10 w-full', className)} />
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between',
            !selectedItem && 'text-muted-foreground',
            className
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Package className="h-4 w-4 flex-shrink-0" />
            {selectedItem ? (
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="truncate">{selectedItem.itemName}</span>
                {showStockStatus && (
                  <Badge variant="secondary" className={cn('text-xs', getStockStatus(selectedItem.currentStock, selectedItem.minimumStock).color)}>
                    {selectedItem.currentStock} {selectedItem.unit}
                  </Badge>
                )}
              </div>
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Cari bahan..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <Search className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Tidak ada bahan ditemukan
                </p>
              </div>
            </CommandEmpty>

            {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
              <CommandGroup key={category} heading={category}>
                {categoryItems.map((item) => {
                  const stockStatus = getStockStatus(item.currentStock, item.minimumStock)
                  const price = item.lastPrice || item.averagePrice
                  const isSelected = item.id === selectedId
                  const isOutOfStock = item.currentStock === 0

                  return (
                    <CommandItem
                      key={item.id}
                      value={`${item.itemName} ${item.itemCode} ${item.category}`}
                      onSelect={() => {
                        onSelect(isSelected ? null : item)
                        setOpen(false)
                      }}
                      disabled={isOutOfStock}
                      className={cn(
                        'flex items-start gap-2 p-3 cursor-pointer',
                        isOutOfStock && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <Check
                        className={cn(
                          'mt-1 h-4 w-4 flex-shrink-0',
                          isSelected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      
                      <div className="flex-1 space-y-1 overflow-hidden">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm truncate">
                            {item.itemName}
                          </span>
                          {showStockStatus && (
                            <Badge variant="outline" className={cn('text-xs flex-shrink-0', stockStatus.color)}>
                              {stockStatus.label}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="truncate">{item.itemCode}</span>
                          {showStockStatus && (
                            <span className="flex items-center gap-1 flex-shrink-0">
                              <Package className="h-3 w-3" />
                              {item.currentStock} {item.unit}
                            </span>
                          )}
                        </div>

                        {showPrice && price !== null && (
                          <div className="flex items-center gap-1 text-xs">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span className={stockStatus.textColor}>
                              {formatPrice(price)}/kg
                            </span>
                          </div>
                        )}

                        {isOutOfStock && (
                          <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                            <AlertCircle className="h-3 w-3" />
                            <span>Stok habis</span>
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

IngredientSelector.displayName = 'IngredientSelector'
