export function useMenuOperations() {
  return {
    deleteMenu: async (id: string) => {
      console.log('Delete menu:', id)
    },
    updateMenu: async (id: string, data: any) => {
      console.log('Update menu:', id, data)
    },
    createMenu: async (data: any) => {
      console.log('Create menu:', data)
    },
    isLoading: false,
    error: null
  }
}
