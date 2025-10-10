'use client'

import { useState } from 'react'
import { Calendar, Clock, Users, Building } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function DemoRequestForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    position: '',
    sppgSize: '',
    currentChallenges: '',
    preferredDate: '',
    preferredTime: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Demo request submitted:', formData)
  }

  return (
    <Card className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Request Demo Gratis</h2>
        <p className="text-muted-foreground">
          Isi form di bawah dan tim ahli kami akan menghubungi Anda untuk menjadwalkan demo personal.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="name">Nama Lengkap *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="phone">Nomor Telepon *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="position">Posisi/Jabatan *</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
              required
              className="mt-1"
            />
          </div>
        </div>

        {/* Organization Info */}
        <div>
          <Label htmlFor="organization">Nama SPPG/Organisasi *</Label>
          <Input
            id="organization"
            value={formData.organization}
            onChange={(e) => setFormData({...formData, organization: e.target.value})}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="sppg-size">Ukuran SPPG *</Label>
          <Select>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Pilih ukuran SPPG Anda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Kecil (&lt; 500 beneficiaries)</SelectItem>
              <SelectItem value="medium">Menengah (500 - 2,000 beneficiaries)</SelectItem>
              <SelectItem value="large">Besar (2,000 - 10,000 beneficiaries)</SelectItem>
              <SelectItem value="enterprise">Enterprise (&gt; 10,000 beneficiaries)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Demo Preferences */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="preferred-date">Tanggal Preferred</Label>
            <Input
              id="preferred-date"
              type="date"
              value={formData.preferredDate}
              onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="preferred-time">Waktu Preferred</Label>
            <Select>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Pilih waktu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Pagi (09:00 - 12:00)</SelectItem>
                <SelectItem value="afternoon">Siang (13:00 - 16:00)</SelectItem>
                <SelectItem value="evening">Sore (16:00 - 18:00)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="challenges">Tantangan Operasional Saat Ini</Label>
          <Textarea
            id="challenges"
            placeholder="Ceritakan tantangan utama yang dihadapi SPPG Anda saat ini..."
            value={formData.currentChallenges}
            onChange={(e) => setFormData({...formData, currentChallenges: e.target.value})}
            rows={4}
            className="mt-1"
          />
        </div>

        <Button type="submit" className="w-full" size="lg">
          Request Demo Sekarang
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          Dengan mengirim form ini, Anda setuju dengan{' '}
          <a href="/privacy" className="text-primary hover:underline">
            Kebijakan Privasi
          </a>{' '}
          kami.
        </div>
      </form>

      {/* Contact Alternatives */}
      <div className="mt-8 pt-6 border-t">
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Atau hubungi kami langsung:
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <a 
            href="tel:+622112345678" 
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <Clock className="h-4 w-4" />
            +62 21-1234-5678
          </a>
          <a 
            href="mailto:demo@bergizi.id" 
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <Calendar className="h-4 w-4" />
            demo@bergizi.id
          </a>
        </div>
      </div>
    </Card>
  )
}