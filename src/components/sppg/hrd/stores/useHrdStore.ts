// HRD Store - Pattern 2 Implementation
// Self-contained HRD domain state management
// src/components/sppg/hrd/stores/useHrdStore.ts

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { 
  EmployeeWithDetails,
  EmploymentStatus
} from '../types'

// Store Implementation
export interface HrdState {
  employees: EmployeeWithDetails[]
  selectedEmployee: EmployeeWithDetails | null
  loading: boolean
  error: string | null
  filters: {
    globalSearch: string
    statusFilter: EmploymentStatus[]
    positionFilter: string[]
    departmentFilter: string[]
  }
}

export interface HrdActions {
  setEmployees: (employees: EmployeeWithDetails[]) => void
  addEmployee: (employee: EmployeeWithDetails) => void
  updateEmployee: (id: string, updates: Partial<EmployeeWithDetails>) => void
  removeEmployee: (id: string) => void
  setSelectedEmployee: (employee: EmployeeWithDetails | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<HrdState['filters']>) => void
}

export type HrdStore = HrdState & HrdActions

export const useHrdStore = create<HrdStore>()(
  immer((set) => ({
    // Initial State
    employees: [],
    selectedEmployee: null,
    loading: false,
    error: null,
    filters: {
      globalSearch: '',
      statusFilter: [],
      positionFilter: [],
      departmentFilter: []
    },
    
    // Actions
    setEmployees: (employees) =>
      set((state) => {
        state.employees = employees
      }),
      
    addEmployee: (employee) =>
      set((state) => {
        state.employees.push(employee)
      }),
      
    updateEmployee: (id, updates) =>
      set((state) => {
        const employee = state.employees.find(e => e.id === id)
        if (employee) {
          Object.assign(employee, updates)
        }
      }),
      
    removeEmployee: (id) =>
      set((state) => {
        state.employees = state.employees.filter(e => e.id !== id)
      }),
      
    setSelectedEmployee: (employee) =>
      set((state) => {
        state.selectedEmployee = employee
      }),
      
    setLoading: (loading) =>
      set((state) => {
        state.loading = loading
      }),
      
    setError: (error) =>
      set((state) => {
        state.error = error
      }),
      
    setFilters: (filters) =>
      set((state) => {
        Object.assign(state.filters, filters)
      })
  }))
)