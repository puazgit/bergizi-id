'use client'

import { type FC, useState, useMemo, useCallback } from 'react'
import { Calendar as BigCalendar, dateFnsLocalizer, type Event, type View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, addMonths, subMonths } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Sparkles,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Note: react-big-calendar styles should be imported in global CSS or layout

// ============================================================================
// Types & Interfaces
// ============================================================================

interface MenuAssignment {
  id: string
  date: Date
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK_MORNING' | 'SNACK_AFTERNOON'
  menu: {
    id: string
    menuName: string
    calories: number
    protein: number
    costPerServing: number
  }
  quantity: number
}

interface CalendarEvent extends Event {
  id: string
  assignmentId: string
  mealType: MenuAssignment['mealType']
  menu: MenuAssignment['menu']
  quantity: number
}

interface MenuCalendarProps {
  assignments: MenuAssignment[]
  onAddAssignment?: (date: Date) => void
  onViewAssignment?: (assignment: MenuAssignment) => void
  onEditAssignment?: (assignment: MenuAssignment) => void
  onDeleteAssignment?: (assignmentId: string) => void
  onGeneratePlan?: () => void
  isLoading?: boolean
}

// ============================================================================
// Calendar Setup
// ============================================================================

const locales = {
  'id-ID': idLocale,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: idLocale }),
  getDay,
  locales,
})

// ============================================================================
// Helper Functions
// ============================================================================

function getMealTypeConfig(mealType: MenuAssignment['mealType']): {
  label: string
  color: string
  bgColor: string
  borderColor: string
} {
  switch (mealType) {
    case 'BREAKFAST':
      return {
        label: 'Sarapan',
        color: 'text-orange-700 dark:text-orange-300',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        borderColor: 'border-orange-300 dark:border-orange-700',
      }
    case 'LUNCH':
      return {
        label: 'Makan Siang',
        color: 'text-green-700 dark:text-green-300',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        borderColor: 'border-green-300 dark:border-green-700',
      }
    case 'DINNER':
      return {
        label: 'Makan Malam',
        color: 'text-blue-700 dark:text-blue-300',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        borderColor: 'border-blue-300 dark:border-blue-700',
      }
    case 'SNACK_MORNING':
      return {
        label: 'Snack Pagi',
        color: 'text-yellow-700 dark:text-yellow-300',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        borderColor: 'border-yellow-300 dark:border-yellow-700',
      }
    case 'SNACK_AFTERNOON':
      return {
        label: 'Snack Sore',
        color: 'text-purple-700 dark:text-purple-300',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        borderColor: 'border-purple-300 dark:border-purple-700',
      }
  }
}

function formatPrice(price: number): string {
  return `Rp ${price.toLocaleString('id-ID')}`
}

// ============================================================================
// Custom Event Component
// ============================================================================

interface CustomEventProps {
  event: CalendarEvent
}

const CustomEvent: FC<CustomEventProps> = ({ event }) => {
  const config = getMealTypeConfig(event.mealType)

  return (
    <div
      className={cn(
        'px-1.5 py-0.5 rounded text-xs border-l-2 truncate',
        config.bgColor,
        config.color,
        config.borderColor
      )}
    >
      <div className="font-medium truncate">{event.menu.menuName}</div>
      <div className="text-[10px] opacity-80">
        {config.label} • {event.menu.calories} kal
      </div>
    </div>
  )
}

// ============================================================================
// Custom Toolbar Component
// ============================================================================

interface CustomToolbarProps {
  date: Date
  view: View
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void
  onView: (view: View) => void
  onGeneratePlan?: () => void
}

const CustomToolbar: FC<CustomToolbarProps> = ({
  date,
  view,
  onNavigate,
  onView,
  onGeneratePlan,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 p-4 bg-muted/30 dark:bg-muted/10 rounded-lg border">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('PREV')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('TODAY')}
        >
          Hari Ini
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('NEXT')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Current Date */}
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-lg font-semibold">
          {format(date, 'MMMM yyyy', { locale: idLocale })}
        </span>
      </div>

      {/* View Toggle & Actions */}
      <div className="flex items-center gap-2">
        <div className="flex border rounded-md">
          <Button
            variant={view === 'month' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onView('month')}
            className="rounded-r-none"
          >
            Bulan
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onView('week')}
            className="rounded-l-none"
          >
            Minggu
          </Button>
        </div>

        {onGeneratePlan && (
          <Button size="sm" onClick={onGeneratePlan} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate
          </Button>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export const MenuCalendar: FC<MenuCalendarProps> = ({
  assignments,
  onAddAssignment,
  onViewAssignment,
  onEditAssignment,
  onDeleteAssignment,
  onGeneratePlan,
  isLoading = false,
}) => {
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState<Date>(new Date())
  const [selectedAssignment, setSelectedAssignment] = useState<MenuAssignment | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Convert assignments to calendar events
  const events = useMemo<CalendarEvent[]>(() => {
    return assignments.map((assignment) => ({
      id: assignment.id,
      assignmentId: assignment.id,
      title: assignment.menu.menuName,
      start: assignment.date,
      end: assignment.date,
      mealType: assignment.mealType,
      menu: assignment.menu,
      quantity: assignment.quantity,
    }))
  }, [assignments])

  // Handle event click
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    const assignment = assignments.find((a) => a.id === event.assignmentId)
    if (assignment) {
      setSelectedAssignment(assignment)
      setDetailDialogOpen(true)
    }
  }, [assignments])

  // Handle date slot click
  const handleSelectSlot = useCallback((slotInfo: { start: Date }) => {
    if (onAddAssignment) {
      onAddAssignment(slotInfo.start)
    }
  }, [onAddAssignment])

  // Handle navigation
  const handleNavigate = useCallback((action: 'PREV' | 'NEXT' | 'TODAY') => {
    switch (action) {
      case 'PREV':
        setDate((prev) => (view === 'month' ? subMonths(prev, 1) : new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000)))
        break
      case 'NEXT':
        setDate((prev) => (view === 'month' ? addMonths(prev, 1) : new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000)))
        break
      case 'TODAY':
        setDate(new Date())
        break
    }
  }, [view])

  // Handle view assignment actions
  const handleViewDetail = () => {
    if (selectedAssignment && onViewAssignment) {
      onViewAssignment(selectedAssignment)
    }
    setDetailDialogOpen(false)
  }

  const handleEdit = () => {
    if (selectedAssignment && onEditAssignment) {
      onEditAssignment(selectedAssignment)
    }
    setDetailDialogOpen(false)
  }

  const handleDelete = () => {
    if (selectedAssignment && onDeleteAssignment) {
      if (confirm(`Hapus penugasan menu "${selectedAssignment.menu.menuName}"?`)) {
        onDeleteAssignment(selectedAssignment.id)
        setDetailDialogOpen(false)
      }
    }
  }

  // Event style getter
  const eventStyleGetter = useCallback(() => {
    return {
      style: {
        backgroundColor: 'transparent',
        border: 'none',
        padding: 0,
        margin: '1px 0',
      },
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* Legend */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">
            Jenis Makanan:
          </span>
          {(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK_MORNING', 'SNACK_AFTERNOON'] as const).map(
            (type) => {
              const config = getMealTypeConfig(type)
              return (
                <Badge
                  key={type}
                  variant="outline"
                  className={cn(config.bgColor, config.color, config.borderColor)}
                >
                  {config.label}
                </Badge>
              )
            }
          )}
        </div>
      </Card>

      {/* Calendar */}
      <Card className="p-4">
        <CustomToolbar
          date={date}
          view={view}
          onNavigate={handleNavigate}
          onView={setView}
          onGeneratePlan={onGeneratePlan}
        />

        <div className={cn(
          'menu-calendar-wrapper',
          isLoading && 'opacity-50 pointer-events-none'
        )}>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: view === 'month' ? 600 : 400 }}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            popup
            culture="id-ID"
            messages={{
              today: 'Hari Ini',
              previous: 'Sebelumnya',
              next: 'Selanjutnya',
              month: 'Bulan',
              week: 'Minggu',
              day: 'Hari',
              agenda: 'Agenda',
              date: 'Tanggal',
              time: 'Waktu',
              event: 'Acara',
              noEventsInRange: 'Tidak ada penugasan menu pada periode ini.',
              showMore: (total) => `+${total} lainnya`,
            }}
            components={{
              event: CustomEvent,
              toolbar: () => null, // Use custom toolbar instead
            }}
            eventPropGetter={eventStyleGetter}
          />
        </div>
      </Card>

      {/* Assignment Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedAssignment && (
            <>
              <DialogHeader>
                <DialogTitle>Detail Penugasan Menu</DialogTitle>
                <DialogDescription>
                  {format(selectedAssignment.date, 'EEEE, dd MMMM yyyy', {
                    locale: idLocale,
                  })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Meal Type Badge */}
                <div>
                  <Badge
                    variant="outline"
                    className={cn(
                      getMealTypeConfig(selectedAssignment.mealType).bgColor,
                      getMealTypeConfig(selectedAssignment.mealType).color,
                      getMealTypeConfig(selectedAssignment.mealType).borderColor
                    )}
                  >
                    {getMealTypeConfig(selectedAssignment.mealType).label}
                  </Badge>
                </div>

                {/* Menu Name */}
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedAssignment.menu.menuName}
                  </h3>
                </div>

                {/* Nutrition Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Kalori</span>
                    <p className="font-medium">
                      {selectedAssignment.menu.calories} kal
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Protein</span>
                    <p className="font-medium">
                      {selectedAssignment.menu.protein}g
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Biaya/Porsi</span>
                    <p className="font-medium">
                      {formatPrice(selectedAssignment.menu.costPerServing)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Jumlah</span>
                    <p className="font-medium">
                      {selectedAssignment.quantity} porsi
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                {onViewAssignment && (
                  <Button variant="outline" onClick={handleViewDetail}>
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat Menu
                  </Button>
                )}
                {onEditAssignment && (
                  <Button variant="outline" onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
                {onDeleteAssignment && (
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Custom Calendar Styles */}
      <style jsx global>{`
        .menu-calendar-wrapper .rbc-calendar {
          font-family: inherit;
        }

        .menu-calendar-wrapper .rbc-header {
          padding: 8px 4px;
          font-weight: 600;
          font-size: 0.875rem;
          border-bottom: 2px solid hsl(var(--border));
        }

        .menu-calendar-wrapper .rbc-today {
          background-color: hsl(var(--primary) / 0.05);
        }

        .menu-calendar-wrapper .rbc-off-range-bg {
          background-color: hsl(var(--muted) / 0.3);
        }

        .menu-calendar-wrapper .rbc-date-cell {
          padding: 4px 8px;
          text-align: right;
          font-size: 0.875rem;
        }

        .menu-calendar-wrapper .rbc-event {
          background-color: transparent !important;
          border: none !important;
          padding: 0 !important;
        }

        .menu-calendar-wrapper .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid hsl(var(--border));
        }

        .menu-calendar-wrapper .rbc-time-content {
          border-top: 2px solid hsl(var(--border));
        }

        .menu-calendar-wrapper .rbc-current-time-indicator {
          background-color: hsl(var(--primary));
        }

        .menu-calendar-wrapper .rbc-slot-selection {
          background-color: hsl(var(--primary) / 0.2);
        }

        .dark .menu-calendar-wrapper .rbc-header {
          border-bottom-color: hsl(var(--border));
          background-color: hsl(var(--muted) / 0.3);
        }

        .dark .menu-calendar-wrapper .rbc-today {
          background-color: hsl(var(--primary) / 0.1);
        }

        .dark .menu-calendar-wrapper .rbc-off-range-bg {
          background-color: hsl(var(--muted) / 0.1);
        }
      `}</style>
    </div>
  )
}
