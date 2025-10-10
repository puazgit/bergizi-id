'use server'

import { auth } from '@/auth'
import { SPPGForecastingService, type SPPGForecastingResult } from '@/lib/ml/sppg-forecasting'

/**
 * Server action to get AI forecasting for authenticated SPPG
 */
export async function getAIForecasting(): Promise<{
  success: boolean
  data?: SPPGForecastingResult
  error?: string
}> {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return { success: false, error: 'Unauthorized' }
    }

    const service = new SPPGForecastingService(session.user.sppgId)
    const forecast = await service.getComprehensiveForecast()

    return { success: true, data: forecast }
  } catch (error) {
    console.error('AI Forecasting error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}