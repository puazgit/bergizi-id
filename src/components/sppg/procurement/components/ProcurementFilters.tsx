'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Filter, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'

interface FilterState {
  status: string[]
  supplier: string[]
  category: string[]
  urgency: string[]
}

export function ProcurementFilters() {
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    supplier: [],
    category: [],
    urgency: []
  })

  const filterOptions = {
    status: [
      { value: 'DRAFT', label: 'Draft' },
      { value: 'PENDING', label: 'Menunggu Persetujuan' },
      { value: 'APPROVED', label: 'Disetujui' },
      { value: 'ORDERED', label: 'Dipesan' },
      { value: 'RECEIVED', label: 'Diterima' },
      { value: 'COMPLETED', label: 'Selesai' },
      { value: 'CANCELLED', label: 'Dibatalkan' }
    ],
    supplier: [
      { value: 'PT_BERAS_SEJAHTERA', label: 'PT Beras Sejahtera' },
      { value: 'CV_SAYUR_FRESH', label: 'CV Sayur Fresh' },
      { value: 'UD_PROTEIN_SEHAT', label: 'UD Protein Sehat' },
      { value: 'TOKO_BUMBU_NUSANTARA', label: 'Toko Bumbu Nusantara' }
    ],
    category: [
      { value: 'BERAS_GANDUM', label: 'Beras & Gandum' },
      { value: 'SAYURAN', label: 'Sayuran' },
      { value: 'PROTEIN_HEWANI', label: 'Protein Hewani' },
      { value: 'PROTEIN_NABATI', label: 'Protein Nabati' },
      { value: 'BUMBU_REMPAH', label: 'Bumbu & Rempah' },
      { value: 'MINYAK_LEMAK', label: 'Minyak & Lemak' }
    ],
    urgency: [
      { value: 'LOW', label: 'Rendah' },
      { value: 'MEDIUM', label: 'Sedang' },
      { value: 'HIGH', label: 'Tinggi' },
      { value: 'URGENT', label: 'Mendesak' }
    ]
  }

  const updateFilter = (category: keyof FilterState, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [category]: checked 
        ? [...prev[category], value]
        : prev[category].filter(item => item !== value)
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      status: [],
      supplier: [],
      category: [],
      urgency: []
    })
  }

  const activeFiltersCount = Object.values(filters).flat().length

  const getFilterLabel = (category: keyof FilterState, value: string) => {
    return filterOptions[category].find(option => option.value === value)?.label || value
  }

  return (
    <div className="flex items-center gap-2">
      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2">
          {Object.entries(filters).map(([category, values]) => 
            values.map((value: string) => (
              <Badge key={`${category}-${value}`} variant="secondary" className="text-xs">
                {getFilterLabel(category as keyof FilterState, value)}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                  onClick={() => updateFilter(category as keyof FilterState, value, false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))
          )}
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
      )}

      {/* Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filter
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 px-1 min-w-[1.25rem] h-5">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter Pengadaan
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Status Filter */}
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Status
          </DropdownMenuLabel>
          {filterOptions.status.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={filters.status.includes(option.value)}
              onCheckedChange={(checked) => updateFilter('status', option.value, checked)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
          
          <DropdownMenuSeparator />
          
          {/* Category Filter */}
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Kategori
          </DropdownMenuLabel>
          {filterOptions.category.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={filters.category.includes(option.value)}
              onCheckedChange={(checked) => updateFilter('category', option.value, checked)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
          
          <DropdownMenuSeparator />
          
          {/* Urgency Filter */}
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Prioritas
          </DropdownMenuLabel>
          {filterOptions.urgency.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={filters.urgency.includes(option.value)}
              onCheckedChange={(checked) => updateFilter('urgency', option.value, checked)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
          
          <DropdownMenuSeparator />
          
          {/* Supplier Filter */}
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Supplier
          </DropdownMenuLabel>
          {filterOptions.supplier.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={filters.supplier.includes(option.value)}
              onCheckedChange={(checked) => updateFilter('supplier', option.value, checked)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}