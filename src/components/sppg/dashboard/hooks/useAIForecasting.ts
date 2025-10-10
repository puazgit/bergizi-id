import { useQuery } from '@tanstack/react-query'
import { getAIForecasting } from '@/actions/sppg/ai-forecasting'
import { toast } from 'sonner'

/**
 * Hook for AI Forecasting data
 */
export const useAIForecasting = (options?: {
  enabled?: boolean
  refetchInterval?: number
}) => {
  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['ai-forecasting'],
    queryFn: async () => {
      const result = await getAIForecasting()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch AI forecasting')
      }
      return result.data
    },
    enabled: options?.enabled ?? true,
    staleTime: 10 * 60 * 1000, // 10 minutes - AI data doesn't change frequently
    refetchInterval: options?.refetchInterval ?? 30 * 60 * 1000, // 30 minutes
    retry: 2
  })

  // Handle errors with toast notification
  if (error) {
    console.error('AI Forecasting error:', error)
    toast.error('Failed to load AI forecasting data')
  }

  return {
    forecastData: data,
    isLoading,
    error: error as Error | null,
    refetch,
    isRefetching
  }
}