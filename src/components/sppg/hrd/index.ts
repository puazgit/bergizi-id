// HRD Main Index
// src/components/sppg/hrd/index.ts

// Components
export {
  HRDDashboard,
  EmployeeList,
  EmployeeForm,
  AttendanceTracker,
  TrainingManagement
} from './components'

// Hooks
export {
  useEmployees,
  useAttendance,
  usePerformanceReviews
} from './hooks'

// Types (from domain)
export type * from './types'

// Utils and Validators
export {
  employeeFormSchema,
  attendanceFormSchema,
  trainingFormSchema,
  performanceReviewFormSchema,
  formatEmployeeId,
  getEmploymentStatusColor,
  getAttendanceStatusColor,
  calculateWorkingHours,
  calculateAttendanceRate
} from './utils'