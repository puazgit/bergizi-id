// Procurement Utils - Component-Level Utilities

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount)
}

export function calculateTotal(items: any[]): number {
  return items.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('id-ID')
}

// Simple filter function without type issues
export function filterProcurements(procurements: any[], searchTerm?: string): any[] {
  if (!searchTerm) return procurements
  
  return procurements.filter(p => 
    p.procurementCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
  )
}
