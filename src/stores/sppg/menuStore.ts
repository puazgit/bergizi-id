// Menu Store - Zustand state management
// SPPG Menu domain state management
// src/stores/sppg/menuStore.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { 
  MenuWithDetails, 
  MenuFilters, 
  CreateMenuInput,
  UpdateMenuInput 
} from '@/components/sppg/menu/types'

interface MenuState {
  // Menu data
  menus: MenuWithDetails[]
  selectedMenu: MenuWithDetails | null
  
  // UI state
  loading: boolean
  error: string | null
  
  // Filters & pagination
  filters: MenuFilters
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  
  // Selection state
  selectedMenus: string[]
  
  // Form state
  formData: Partial<CreateMenuInput>
  formErrors: Record<string, string>
  isDirty: boolean
  
  // Actions
  setMenus: (menus: MenuWithDetails[]) => void
  setSelectedMenu: (menu: MenuWithDetails | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: MenuFilters) => void
  setPagination: (pagination: Partial<MenuState['pagination']>) => void
  setSelectedMenus: (menuIds: string[]) => void
  addSelectedMenu: (menuId: string) => void
  removeSelectedMenu: (menuId: string) => void
  clearSelection: () => void
  
  // Form actions
  setFormData: (data: Partial<CreateMenuInput>) => void
  updateFormField: (field: string, value: unknown) => void
  setFormErrors: (errors: Record<string, string>) => void
  setFormError: (field: string, error: string) => void
  clearFormError: (field: string) => void
  setIsDirty: (dirty: boolean) => void
  resetForm: () => void
  
  // Menu operations
  addMenu: (menu: MenuWithDetails) => void
  updateMenu: (id: string, updates: Partial<MenuWithDetails>) => void
  removeMenu: (id: string) => void
  toggleMenuStatus: (id: string) => void
  
  // Reset
  reset: () => void
}

const initialState = {
  menus: [],
  selectedMenu: null,
  loading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt' as const,
    sortOrder: 'desc' as const,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  selectedMenus: [],
  formData: {
    nutritionTargets: {
      calories: 400,
      protein: 20,
      carbohydrates: 50,
      fat: 15,
    },
    ingredients: [],
    allergenInfo: [],
    isHalal: true,
    isVegetarian: false,
  },
  formErrors: {},
  isDirty: false,
}

export const useMenuStore = create<MenuState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // Basic setters
      setMenus: (menus) => set({ menus }),
      setSelectedMenu: (selectedMenu) => set({ selectedMenu }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setFilters: (filters) => set({ filters }),
      setPagination: (pagination) => 
        set((state) => ({ 
          pagination: { ...state.pagination, ...pagination } 
        })),
      
      // Selection management
      setSelectedMenus: (selectedMenus) => set({ selectedMenus }),
      addSelectedMenu: (menuId) =>
        set((state) => ({
          selectedMenus: [...state.selectedMenus, menuId],
        })),
      removeSelectedMenu: (menuId) =>
        set((state) => ({
          selectedMenus: state.selectedMenus.filter(id => id !== menuId),
        })),
      clearSelection: () => set({ selectedMenus: [] }),
      
      // Form management
      setFormData: (formData) => set({ formData }),
      updateFormField: (field, value) =>
        set((state) => ({
          formData: { ...state.formData, [field]: value },
          isDirty: true,
        })),
      setFormErrors: (formErrors) => set({ formErrors }),
      setFormError: (field, error) =>
        set((state) => ({
          formErrors: { ...state.formErrors, [field]: error },
        })),
      clearFormError: (field) =>
        set((state) => {
          const { [field]: _, ...rest } = state.formErrors
          return { formErrors: rest }
        }),
      setIsDirty: (isDirty) => set({ isDirty }),
      resetForm: () => set({ 
        formData: initialState.formData,
        formErrors: {},
        isDirty: false,
      }),
      
      // Menu operations
      addMenu: (menu) =>
        set((state) => ({
          menus: [menu, ...state.menus],
          pagination: {
            ...state.pagination,
            total: state.pagination.total + 1,
          },
        })),
      
      updateMenu: (id, updates) =>
        set((state) => ({
          menus: state.menus.map(menu => 
            menu.id === id ? { ...menu, ...updates } : menu
          ),
          selectedMenu: state.selectedMenu?.id === id 
            ? { ...state.selectedMenu, ...updates }
            : state.selectedMenu,
        })),
      
      removeMenu: (id) =>
        set((state) => ({
          menus: state.menus.filter(menu => menu.id !== id),
          selectedMenu: state.selectedMenu?.id === id ? null : state.selectedMenu,
          selectedMenus: state.selectedMenus.filter(menuId => menuId !== id),
          pagination: {
            ...state.pagination,
            total: Math.max(0, state.pagination.total - 1),
          },
        })),
      
      toggleMenuStatus: (id) =>
        set((state) => ({
          menus: state.menus.map(menu => 
            menu.id === id 
              ? { ...menu, isActive: !menu.isActive }
              : menu
          ),
        })),
      
      // Reset all state
      reset: () => set(initialState),
    }),
    {
      name: 'menu-store',
    }
  )
)