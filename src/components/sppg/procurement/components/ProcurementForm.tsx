// ProcurementForm Component - Enterprise SPPG Procurement Management
// Bergizi-ID: Create/Edit Procurement Form

'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
// import { useProcurementOperations } from '../hooks/useProcurementServerActions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  Trash2, 
  Calculator,
  Save,
  ArrowLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
// import {
//   createProcurementSchema
//   // updateProcurementSchema // TODO: Use in edit mode
// } from '@/domains/procurement/validators'
// import type { 
//   ProcurementInput,
//   Procurement
// } from '@/types/domains/procurement'

// Temporary types
type ProcurementInput = any
type Procurement = any

interface ProcurementFormProps {
  mode: 'create' | 'edit'
  procurement?: Procurement
  onSuccess?: (procurement: Procurement) => void
  onCancel?: () => void
}

export function ProcurementForm({ 
  mode, 
  // procurement, // TODO: Use for edit mode
  // onSuccess, // TODO: Implement success callback
  onCancel 
}: ProcurementFormProps) {
  const [isCalculating, setIsCalculating] = useState(false)
  const router = useRouter()
  
  // const { mutate: createProcurement, isPending: isCreating } = useCreateProcurement()
  const isCreating = false
  // const { mutate: updateProcurement, isPending: isUpdating } = useUpdateProcurement() // TODO: Use in edit mode
  // const { data: procurementPlans } = useProcurementPlans() // TODO: Use for plan selection

  // Use any for now to avoid complex type issues
  const form = useForm<any>({
    // resolver: zodResolver(createProcurementSchema),
    defaultValues: {
      procurementCode: '',
      supplierName: '',
      supplierContact: '',
      supplierAddress: '',
      purchaseMethod: 'CASH',
      paymentTerms: 'CASH_ON_DELIVERY',
      subtotalAmount: 0,
      taxAmount: 0,
      discountAmount: 0,
      shippingCost: 0,
      totalAmount: 0,
      expectedDelivery: undefined,
      deliveryMethod: 'DELIVERY',
      items: []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items'
  })

  // Calculate totals
  const calculateTotals = () => {
    setIsCalculating(true)
    
    const items = form.getValues('items')
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0)
    
    const taxAmount = form.getValues('taxAmount') || 0
    const discountAmount = form.getValues('discountAmount') || 0  
    const shippingCost = form.getValues('shippingCost') || 0
    
    const total = subtotal + taxAmount - discountAmount + shippingCost
    
    form.setValue('subtotalAmount', subtotal)
    form.setValue('totalAmount', total)
    
    setTimeout(() => setIsCalculating(false), 500)
  }

  // Add new item
  const addItem = () => {
    append({
      inventoryItemId: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      description: '',
      qualityNotes: ''
    })
  }

  // Calculate item total
  const calculateItemTotal = (index: number) => {
    const quantity = form.getValues(`items.${index}.quantity`) || 0
    const unitPrice = form.getValues(`items.${index}.unitPrice`) || 0
    const total = quantity * unitPrice
    
    form.setValue(`items.${index}.totalPrice`, total)
    calculateTotals()
  }

  // Generate procurement code
  const generateProcurementCode = () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    
    const code = `PRO-${year}${month}${day}-${random}`
    form.setValue('procurementCode', code)
  }

  // Submit handler
  const onSubmit = (data: any) => {
    if (mode === 'create') {
      // createProcurement(data, {
      //   onSuccess: () => {
      //     router.push('/procurement')
      //   }
      // })
      console.log('Create procurement:', data)
      router.push('/procurement')
    } else {
      // TODO: Implement edit mode
      console.log('Edit mode not implemented yet')
    }
  }

  const isLoading = isCreating // || isUpdating

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {mode === 'create' ? 'Buat Procurement Baru' : 'Edit Procurement'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'create' 
              ? 'Buat procurement baru untuk SPPG Anda' 
              : 'Perbarui data procurement'
            }
          </p>
        </div>
        
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold">Informasi Dasar</h2>
              {mode === 'create' && (
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={generateProcurementCode}
                >
                  Generate Code
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="procurementCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Procurement *</FormLabel>
                    <FormControl>
                      <Input placeholder="PRO-240101-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedDelivery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Pengiriman</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local"
                        {...field}
                        value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplierName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Supplier *</FormLabel>
                    <FormControl>
                      <Input placeholder="PT. Supplier ABC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplierContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kontak Supplier</FormLabel>
                    <FormControl>
                      <Input placeholder="08123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchaseMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metode Pembelian *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih metode pembelian" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="TRANSFER">Transfer</SelectItem>
                        <SelectItem value="CREDIT">Credit</SelectItem>
                        <SelectItem value="BARTER">Barter</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term Pembayaran</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih term pembayaran" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CASH_ON_DELIVERY">Cash on Delivery</SelectItem>
                        <SelectItem value="NET_15">Net 15 Days</SelectItem>
                        <SelectItem value="NET_30">Net 30 Days</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="supplierAddress"
              render={({ field }) => (
                <FormItem className="mt-6">
                  <FormLabel>Alamat Supplier</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Alamat lengkap supplier"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          {/* Items */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Item Procurement</h2>
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={addItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Item
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4 border-l-4 border-l-primary/20">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="outline">Item {index + 1}</Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jumlah *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) => {
                                field.onChange(Number(e.target.value))
                                setTimeout(() => calculateItemTotal(index), 100)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Harga Satuan *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) => {
                                field.onChange(Number(e.target.value))
                                setTimeout(() => calculateItemTotal(index), 100)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.totalPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Harga</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="0"
                              {...field}
                              readOnly
                              className="bg-muted"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => calculateItemTotal(index)}
                        className="w-full"
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Hitung
                      </Button>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Deskripsi Item</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Deskripsi detail item"
                            className="min-h-[60px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>
              ))}

              {fields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada item. Klik &ldquo;Tambah Item&rdquo; untuk menambahkan item procurement.
                </div>
              )}
            </div>
          </Card>

          {/* Financial Summary */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Ringkasan Keuangan</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={calculateTotals}
                disabled={isCalculating}
              >
                <Calculator className={cn(
                  'h-4 w-4 mr-2',
                  isCalculating && 'animate-spin'
                )} />
                Hitung Total
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="subtotalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtotal</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="0"
                        {...field}
                        readOnly
                        className="bg-muted font-semibold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pajak</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value))
                          setTimeout(calculateTotals, 100)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diskon</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value))
                          setTimeout(calculateTotals, 100)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shippingCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biaya Pengiriman</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value))
                          setTimeout(calculateTotals, 100)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-6" />

            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Total Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="0"
                      {...field}
                      readOnly
                      className="bg-primary/10 border-primary/20 font-bold text-lg h-12"
                    />
                  </FormControl>
                  <FormDescription>
                    Total keseluruhan procurement ini
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Batal
              </Button>
            )}
            
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading 
                ? (mode === 'create' ? 'Membuat...' : 'Memperbarui...') 
                : (mode === 'create' ? 'Buat Procurement' : 'Perbarui Procurement')
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}