'use client'

import { useState } from 'react'
import { useEmployees } from '../hooks/useEmployees'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, Plus, MoreHorizontal, Users, Building, UserCheck } from 'lucide-react'
import Link from 'next/link'
import type { Employee } from '../types'

export function EmployeeList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('')
  
  const {
    employees,
    isLoading,
    metrics,
    deleteEmployee
  } = useEmployees({ searchTerm, departmentFilter })

  const getEmploymentStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      ACTIVE: 'default',
      PROBATION: 'secondary',
      SUSPENDED: 'destructive',
      TERMINATED: 'outline',
      RESIGNED: 'outline',
      RETIRED: 'outline'
    }
    return variants[status] || 'outline'
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) {
      await deleteEmployee(employeeId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Metrics */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manajemen Karyawan</h1>
          <p className="text-muted-foreground mt-1">
            Kelola data karyawan dan informasi kepegawaian
          </p>
        </div>
        <Button asChild>
          <Link href="/hrd/employees/create">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Karyawan
          </Link>
        </Button>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Karyawan</p>
                  <p className="text-2xl font-bold text-foreground">{metrics.totalEmployees}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Karyawan Aktif</p>
                  <p className="text-2xl font-bold text-foreground">{metrics.activeEmployees}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Departemen</p>
                  <p className="text-2xl font-bold text-foreground">{metrics.totalDepartments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cari karyawan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setDepartmentFilter('')
              }}
            >
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Karyawan</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Karyawan</TableHead>
                  <TableHead>ID Karyawan</TableHead>
                  <TableHead>Departemen</TableHead>
                  <TableHead>Posisi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bergabung</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees?.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={employee.photoUrl || undefined} />
                          <AvatarFallback>
                            {employee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{employee.fullName}</p>
                          <p className="text-sm text-muted-foreground">{employee.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {employee.employeeId}
                    </TableCell>
                    <TableCell>
                      {employee.department?.name || 'Tidak ada'}
                    </TableCell>
                    <TableCell>
                      {employee.position?.title || 'Tidak ada'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getEmploymentStatusBadge(employee.employmentStatus)}>
                        {employee.employmentStatus.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(employee.joinDate).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/hrd/employees/${employee.id}`}>
                              Lihat Detail
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/hrd/employees/${employee.id}/edit`}>
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/hrd/attendance/${employee.id}`}>
                              Lihat Presensi
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {employees?.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada karyawan ditemukan
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}