'use client'

import { useState } from 'react'
import { Calculator, TrendingUp, DollarSign, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export function ROICalculator() {
  const [beneficiaries, setBeneficiaries] = useState(1000)
  const [currentCostPerBeneficiary, setCurrentCostPerBeneficiary] = useState(50000)
  const [staffCount, setStaffCount] = useState(10)
  const [currentStaffCost, setCurrentStaffCost] = useState(5000000)

  // Calculations
  const monthlyCurrentCost = (beneficiaries * currentCostPerBeneficiary) + (staffCount * currentStaffCost)
  
  // Bergizi-ID benefits (conservative estimates)
  const operationalEfficiency = 0.25 // 25% efficiency gain
  const costReduction = 0.15 // 15% cost reduction
  const staffProductivity = 0.30 // 30% staff productivity increase
  
  const monthlyBergizi = beneficiaries <= 100 ? 0 : 
                       beneficiaries <= 5000 ? 2500000 : 5000000 // Professional plan

  const monthlyBenefits = 
    (monthlyCurrentCost * costReduction) + // Direct cost savings
    (staffCount * currentStaffCost * staffProductivity * 0.5) // Staff productivity value

  const monthlySavings = monthlyBenefits - monthlyBergizi
  const annualSavings = monthlySavings * 12
  const roiPercentage = monthlyBergizi > 0 ? ((annualSavings / (monthlyBergizi * 12)) * 100) : 0

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4">
          <Calculator className="h-6 w-6 text-primary" />
          <Badge variant="secondary">ROI Calculator</Badge>
        </div>
        <h2 className="text-3xl font-bold mb-4">Hitung ROI Bergizi-ID untuk SPPG Anda</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Masukkan data operasional SPPG Anda dan lihat proyeksi penghematan dan ROI dengan Bergizi-ID.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
        {/* Input Form */}
        <Card className="p-8">
          <h3 className="text-xl font-semibold mb-6">Data Operasional Saat Ini</h3>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="beneficiaries">Jumlah Beneficiaries</Label>
              <Input
                id="beneficiaries"
                type="number"
                value={beneficiaries}
                onChange={(e) => setBeneficiaries(Number(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Total anak/ibu yang dilayani per bulan
              </p>
            </div>

            <div>
              <Label htmlFor="cost-per-beneficiary">Biaya per Beneficiary (Rp)</Label>
              <Input
                id="cost-per-beneficiary"
                type="number"
                value={currentCostPerBeneficiary}
                onChange={(e) => setCurrentCostPerBeneficiary(Number(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Rata-rata biaya operasional per beneficiary per bulan
              </p>
            </div>

            <div>
              <Label htmlFor="staff-count">Jumlah Staff</Label>
              <Input
                id="staff-count"
                type="number"
                value={staffCount}
                onChange={(e) => setStaffCount(Number(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Total staff operasional (admin, ahli gizi, cook, etc)
              </p>
            </div>

            <div>
              <Label htmlFor="staff-cost">Rata-rata Gaji Staff per Bulan (Rp)</Label>
              <Input
                id="staff-cost"
                type="number"
                value={currentStaffCost}
                onChange={(e) => setCurrentStaffCost(Number(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Rata-rata total compensation per staff per bulan
              </p>
            </div>
          </div>
        </Card>

        {/* Results */}
        <Card className="p-8 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
          <h3 className="text-xl font-semibold mb-6">Proyeksi ROI & Penghematan</h3>
          
          <div className="space-y-6">
            {/* Current Costs */}
            <div className="p-4 bg-background/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Biaya Operasional Saat Ini</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                Rp {monthlyCurrentCost.toLocaleString('id-ID')}/bulan
              </div>
            </div>

            {/* Bergizi Cost */}
            <div className="p-4 bg-background/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Biaya Bergizi-ID</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                Rp {monthlyBergizi.toLocaleString('id-ID')}/bulan
              </div>
              {beneficiaries <= 100 && (
                <Badge className="mt-2">Trial Gratis 14 Hari</Badge>
              )}
            </div>

            {/* Savings */}
            <div className="p-4 bg-background/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Penghematan per Bulan</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                Rp {Math.max(0, monthlySavings).toLocaleString('id-ID')}
              </div>
            </div>

            {/* Annual ROI */}
            <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">ROI Tahunan</span>
              </div>
              <div className="text-3xl font-bold text-primary mb-2">
                {roiPercentage > 0 ? `${Math.round(roiPercentage)}%` : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">
                Penghematan tahunan: Rp {Math.max(0, annualSavings).toLocaleString('id-ID')}
              </div>
            </div>

            {/* Benefits Breakdown */}
            <div className="space-y-2 text-sm">
              <h4 className="font-medium">Sumber Penghematan:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 25% efisiensi operasional</li>
                <li>• 15% pengurangan biaya procurement</li>
                <li>• 30% peningkatan produktivitas staff</li>
                <li>• Automasi proses manual</li>
                <li>• Optimasi inventory & waste reduction</li>
              </ul>
            </div>

            <Button className="w-full">
              Request Detailed ROI Analysis
            </Button>
          </div>
        </Card>
      </div>

      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          * Kalkulasi berdasarkan data rata-rata penghematan yang dicapai klien existing. 
          Hasil aktual dapat bervariasi tergantung kondisi operasional masing-masing SPPG.
        </p>
      </div>
    </section>
  )
}