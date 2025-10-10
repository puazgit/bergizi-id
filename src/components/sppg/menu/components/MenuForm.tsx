'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { CreateMenuInput, MenuWithDetails } from '../types/menuTypes'
import { useProgramOptions } from '../hooks/usePrograms'

interface MenuFormProps {
  onSubmit: (data: CreateMenuInput) => void
  onCancel?: () => void
  initialData?: Partial<MenuWithDetails>
  isLoading?: boolean
}

export function MenuForm({ onSubmit, onCancel, initialData, isLoading }: MenuFormProps) {
  const { programOptions, isLoading: programsLoading } = useProgramOptions()
  
  const [formData, setFormData] = useState<CreateMenuInput>({
    programId: initialData?.programId || '',
    menuName: initialData?.menuName || '',
    menuCode: initialData?.menuCode || '',
    mealType: initialData?.mealType || 'MAKAN_SIANG',
    servingSize: initialData?.servingSize || 100,
    description: initialData?.description || '',
    
    // Nutrition values removed - now calculated automatically from ingredients
    
    // SPPG Cost Management - costPerServing calculated automatically
    budgetAllocation: initialData?.budgetAllocation || 0,
    
    // SPPG Operational
    preparationTime: initialData?.preparationTime || 0,
    cookingTime: initialData?.cookingTime || 0,
    batchSize: initialData?.batchSize || 50,
    recipeInstructions: initialData?.recipeInstructions || '',
    
    // SPPG Safety & Compliance
    allergens: initialData?.allergens || [],
    nutritionStandardCompliance: initialData?.nutritionStandardCompliance || false,
    recommendedAgeGroup: initialData?.recommendedAgeGroup || [],
    
    isVegetarian: initialData?.isVegetarian || false,
    isHalal: initialData?.isHalal || true,
    ingredients: []
  })

  const handleInputChange = (field: keyof CreateMenuInput, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation
    if (!formData.programId) {
      alert('Silakan pilih Program Gizi terlebih dahulu')
      return
    }
    
    if (!formData.menuName.trim()) {
      alert('Nama Menu wajib diisi')
      return
    }
    
    if (!formData.menuCode.trim()) {
      alert('Kode Menu wajib diisi')
      return
    }
    
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SPPG Program Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
          🎯 Pilih Program SPPG
        </h3>
        <div className="space-y-2">
          <Label htmlFor="programId">Program Gizi *</Label>
          <Select 
            value={formData.programId} 
            onValueChange={(value) => handleInputChange('programId', value)}
            disabled={programsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={programsLoading ? "Memuat program..." : "Pilih program gizi"} />
            </SelectTrigger>
            <SelectContent>
              {programOptions.map((program: { value: string; label: string; programType: string; targetGroup: string }) => (
                <SelectItem key={program.value} value={program.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{program.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {program.programType} • {program.targetGroup}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!programsLoading && programOptions.length === 0 && (
            <p className="text-sm text-red-600 dark:text-red-400">
              ⚠️ Tidak ada program aktif. Hubungi admin untuk membuat program terlebih dahulu.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="menuName">Nama Menu *</Label>
          <Input 
            id="menuName"
            placeholder="Contoh: Nasi Gudeg Ayam" 
            value={formData.menuName}
            onChange={(e) => handleInputChange('menuName', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="menuCode">Kode Menu *</Label>
          <Input 
            id="menuCode"
            placeholder="Contoh: MN-001" 
            value={formData.menuCode}
            onChange={(e) => handleInputChange('menuCode', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Kode menu harus unik dalam program yang dipilih
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mealType">Jenis Makanan</Label>
          <Select 
            value={formData.mealType} 
            onValueChange={(value) => handleInputChange('mealType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih jenis makanan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SARAPAN">Sarapan</SelectItem>
              <SelectItem value="MAKAN_SIANG">Makan Siang</SelectItem>
              <SelectItem value="SNACK_PAGI">Snack Pagi</SelectItem>
              <SelectItem value="SNACK_SORE">Snack Sore</SelectItem>
              <SelectItem value="MAKAN_MALAM">Makan Malam</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="servingSize">Ukuran Porsi (gram)</Label>
          <Input 
            id="servingSize"
            type="number" 
            placeholder="100"
            value={formData.servingSize}
            onChange={(e) => handleInputChange('servingSize', Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea 
          id="description"
          placeholder="Deskripsi menu..."
          className="min-h-[100px]"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
        />
      </div>

            {/* Nutrition Information - Calculated Automatically */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Informasi Gizi</h3>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <svg className="h-4 w-4 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                Perhitungan Otomatis
              </h4>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                Nilai gizi akan dihitung secara otomatis berdasarkan bahan-bahan yang ditambahkan ke menu. 
                Setelah menambahkan bahan, informasi kalori, protein, karbohidrat, lemak, dan serat akan muncul di sini.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SPPG Cost Management Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
          📊 Manajemen Anggaran SPPG
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="costPerServing">Biaya per Porsi (Rp)</Label>
            <div className="rounded border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              Akan dihitung otomatis dari bahan
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budgetAllocation">Alokasi Anggaran (Rp)</Label>
            <Input 
              id="budgetAllocation"
              type="number"
              placeholder="15000"
              value={formData.budgetAllocation}
              onChange={(e) => handleInputChange('budgetAllocation', Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* SPPG Operational Planning Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
          ⏱️ Perencanaan Operasional SPPG
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="preparationTime">Waktu Persiapan (menit)</Label>
            <Input 
              id="preparationTime"
              type="number"
              placeholder="30"
              value={formData.preparationTime}
              onChange={(e) => handleInputChange('preparationTime', Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cookingTime">Waktu Memasak (menit)</Label>
            <Input 
              id="cookingTime"
              type="number"
              placeholder="45"
              value={formData.cookingTime}
              onChange={(e) => handleInputChange('cookingTime', Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchSize">Ukuran Batch (porsi)</Label>
            <Input 
              id="batchSize"
              type="number"
              placeholder="50"
              value={formData.batchSize}
              onChange={(e) => handleInputChange('batchSize', Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipeInstructions">Instruksi Resep</Label>
          <Textarea 
            id="recipeInstructions"
            placeholder="1. Siapkan bahan-bahan...\n2. Panaskan minyak...\n3. Masak hingga matang..."
            className="min-h-[120px]"
            value={formData.recipeInstructions}
            onChange={(e) => handleInputChange('recipeInstructions', e.target.value)}
          />
        </div>
      </div>

      {/* SPPG Safety & Compliance Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">
          🛡️ Keamanan & Kepatuhan SPPG
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="allergens">Alergen</Label>
            <Input 
              id="allergens"
              placeholder="kacang, telur, susu (pisahkan dengan koma)"
              value={formData.allergens?.join(', ') || ''}
              onChange={(e) => handleInputChange('allergens', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendedAgeGroup">Grup Usia Direkomendasikan</Label>
            <Input 
              id="recommendedAgeGroup"
              placeholder="Balita, Anak SD, Dewasa (pisahkan dengan koma)"
              value={formData.recommendedAgeGroup?.join(', ') || ''}
              onChange={(e) => handleInputChange('recommendedAgeGroup', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
            />
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.nutritionStandardCompliance}
              onChange={(e) => handleInputChange('nutritionStandardCompliance', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Memenuhi Standar Gizi Pemerintah</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isHalal}
              onChange={(e) => handleInputChange('isHalal', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Halal</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isVegetarian}
              onChange={(e) => handleInputChange('isVegetarian', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Vegetarian</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isLoading || programsLoading || (!formData.programId && !initialData)}
        >
          {isLoading ? 'Menyimpan...' : initialData ? 'Update Menu SPPG' : 'Buat Menu SPPG'}
        </Button>
      </div>
    </form>
  )
}
