'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateEmployee, useUpdateEmployee } from '../hooks/useEmployees'
import { employeeFormSchema, type EmployeeFormDataSchema } from '../utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { CalendarIcon, Upload, ArrowLeft } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import Link from 'next/link'
import type { Employee } from '../types'

interface EmployeeFormProps {
  employee?: Employee
  mode: 'create' | 'edit'
}

export function EmployeeForm({ employee, mode }: EmployeeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createEmployee = useCreateEmployee()
  const updateEmployee = useUpdateEmployee()

  const form = useForm({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      fullName: employee?.fullName || '',
      nickname: employee?.nickname || '',
      nik: employee?.nik || '',
      dateOfBirth: employee?.dateOfBirth || new Date(),
      placeOfBirth: employee?.placeOfBirth || '',
      gender: employee?.gender || 'MALE',
      religion: employee?.religion || '',
      maritalStatus: employee?.maritalStatus || 'SINGLE',
      bloodType: employee?.bloodType || '',
      nationality: employee?.nationality || 'Indonesian',
      phone: employee?.phone || '',
      email: employee?.email || '',
      personalEmail: employee?.personalEmail || '',
      addressDetail: employee?.addressDetail || '',
      postalCode: employee?.postalCode || '',
      emergencyContactName: employee?.emergencyContactName || '',
      emergencyContactPhone: employee?.emergencyContactPhone || '',
      emergencyContactRelation: employee?.emergencyContactRelation || '',
      departmentId: employee?.departmentId || '',
      positionId: employee?.positionId || '',
      employmentType: employee?.employmentType || 'PERMANENT',
      employmentStatus: employee?.employmentStatus || 'PROBATION',
      joinDate: employee?.joinDate || new Date(),
      probationEndDate: employee?.probationEndDate || undefined,
      contractStartDate: employee?.contractStartDate || undefined,
      contractEndDate: employee?.contractEndDate || undefined,
      directSupervisor: employee?.directSupervisor || '',
      workLocation: employee?.workLocation || '',
      basicSalary: employee?.basicSalary || 0,
      currency: employee?.currency || 'IDR',
      salaryGrade: employee?.salaryGrade || '',
      taxId: employee?.taxId || '',
      bankAccount: employee?.bankAccount || '',
      bankName: employee?.bankName || '',
      bankBranch: employee?.bankBranch || '',
      biography: employee?.biography || '',
      skills: employee?.skills || [],
      languages: employee?.languages || []
    }
  })

  const onSubmit = async (data: EmployeeFormDataSchema) => {
    setIsSubmitting(true)
    try {
      if (mode === 'create') {
        await createEmployee.mutateAsync(data)
      } else if (employee) {
        await updateEmployee.mutateAsync({
          employeeId: employee.id,
          data
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/hrd/employees">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {mode === 'create' ? 'Tambah Karyawan Baru' : 'Edit Data Karyawan'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {mode === 'create' 
              ? 'Tambahkan karyawan baru ke sistem'
              : 'Perbarui informasi karyawan'
            }
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pribadi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap *</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama lengkap" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Panggilan</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama panggilan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nik"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIK *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Masukkan NIK (16 digit)" 
                          maxLength={16}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Lahir *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'dd MMMM yyyy', { locale: id })
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="placeOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tempat Lahir</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan tempat lahir" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Kelamin *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis kelamin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MALE">Laki-laki</SelectItem>
                          <SelectItem value="FEMALE">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Kontak</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nomor telepon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Kantor</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Masukkan email kantor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Kepegawaian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="employmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Kepegawaian *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis kepegawaian" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PERMANENT">Tetap</SelectItem>
                          <SelectItem value="CONTRACT">Kontrak</SelectItem>
                          <SelectItem value="TEMPORARY">Temporer</SelectItem>
                          <SelectItem value="INTERN">Magang</SelectItem>
                          <SelectItem value="FREELANCE">Freelance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="employmentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status Kepegawaian *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih status kepegawaian" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Aktif</SelectItem>
                          <SelectItem value="PROBATION">Masa Percobaan</SelectItem>
                          <SelectItem value="SUSPENDED">Suspensi</SelectItem>
                          <SelectItem value="TERMINATED">Diberhentikan</SelectItem>
                          <SelectItem value="RESIGNED">Mengundurkan Diri</SelectItem>
                          <SelectItem value="RETIRED">Pensiun</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="joinDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Bergabung *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd MMMM yyyy', { locale: id })
                            ) : (
                              <span>Pilih tanggal bergabung</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/hrd/employees">
                Batal
              </Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {mode === 'create' ? 'Menyimpan...' : 'Memperbarui...'}
                </>
              ) : (
                mode === 'create' ? 'Simpan Karyawan' : 'Perbarui Data'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}