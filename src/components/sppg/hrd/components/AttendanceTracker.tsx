'use client'

import { useState } from 'react'
import { useAttendance } from '../hooks/useAttendance'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar as CalendarIcon } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { id } from 'date-fns/locale'
import type { AttendanceSummary } from '../types'

interface AttendanceTrackerProps {
  employeeId?: string
}

export function AttendanceTracker({ employeeId }: AttendanceTrackerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('monthly')
  
  const {
    attendanceRecords,
    attendanceSummary,
    isLoading,
    updateAttendance
  } = useAttendance({
    employeeId,
    startDate: startOfMonth(selectedDate),
    endDate: endOfMonth(selectedDate)
  })

  const getAttendanceStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'LATE':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'ABSENT':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'SICK_LEAVE':
        return <AlertCircle className="w-4 h-4 text-blue-600" />
      case 'ANNUAL_LEAVE':
        return <Calendar className="w-4 h-4 text-purple-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getAttendanceStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      PRESENT: 'default',
      LATE: 'secondary',
      ABSENT: 'destructive',
      SICK_LEAVE: 'outline',
      ANNUAL_LEAVE: 'outline',
      HALF_DAY: 'secondary',
      OVERTIME: 'default'
    }
    return variants[status] || 'outline'
  }

  const formatTime = (date: Date | null) => {
    return date ? format(date, 'HH:mm') : '-'
  }

  const calculateWorkingHours = (clockIn: Date | null, clockOut: Date | null) => {
    if (!clockIn || !clockOut) return '-'
    const diff = clockOut.getTime() - clockIn.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}j ${minutes}m`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {employeeId ? 'Presensi Karyawan' : 'Rekap Presensi'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Pantau dan kelola data kehadiran karyawan
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={viewMode} onValueChange={(value: 'daily' | 'monthly') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Harian</SelectItem>
              <SelectItem value="monthly">Bulanan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      {attendanceSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Hadir</p>
                  <p className="text-2xl font-bold text-foreground">{attendanceSummary.presentDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Tidak Hadir</p>
                  <p className="text-2xl font-bold text-foreground">{attendanceSummary.absentDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Terlambat</p>
                  <p className="text-2xl font-bold text-foreground">{attendanceSummary.lateDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Jam Kerja</p>
                  <p className="text-2xl font-bold text-foreground">{attendanceSummary.totalWorkingHours}j</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Kalender</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              locale={id}
            />
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              Rekap Presensi - {format(selectedDate, 'MMMM yyyy', { locale: id })}
            </CardTitle>
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
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Masuk</TableHead>
                    <TableHead>Keluar</TableHead>
                    <TableHead>Jam Kerja</TableHead>
                    <TableHead>Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords?.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {format(record.attendanceDate, 'dd MMM', { locale: id })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getAttendanceStatusIcon(record.status)}
                          <Badge variant={getAttendanceStatusBadge(record.status)}>
                            {record.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatTime(record.clockIn ?? null)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatTime(record.clockOut ?? null)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {calculateWorkingHours(record.clockIn ?? null, record.clockOut ?? null)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {record.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {attendanceRecords?.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada data presensi untuk periode ini
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}