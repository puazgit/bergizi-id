/**
 * AI Forecasting Engine for Bergizi-ID
 * Real ML algorithms for budget, beneficiary, and quality predictions
 */

export interface HistoricalDataPoint {
  date: string
  value: number
  metadata?: Record<string, unknown>
}

export interface ForecastResult {
  prediction: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
  timeframe: string
  factors: string[]
  accuracy?: number
}

interface ForecastingConfig {
  algorithm: 'linear_regression' | 'exponential_smoothing' | 'arima' | 'ensemble'
  seasonality: boolean
  trendStrength: number
  confidenceLevel: number
}

/**
 * Linear Regression for trend analysis
 */
class LinearRegressionForecaster {
  private calculateSlope(data: HistoricalDataPoint[]): number {
    const n = data.length
    if (n < 2) return 0

    const xValues = data.map((_, i) => i)
    const yValues = data.map(d => d.value)
    
    const xMean = xValues.reduce((a, b) => a + b, 0) / n
    const yMean = yValues.reduce((a, b) => a + b, 0) / n
    
    const numerator = xValues.reduce((sum, x, i) => sum + (x - xMean) * (yValues[i] - yMean), 0)
    const denominator = xValues.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0)
    
    return denominator === 0 ? 0 : numerator / denominator
  }

  private calculateIntercept(data: HistoricalDataPoint[], slope: number): number {
    const n = data.length
    const xMean = (n - 1) / 2
    const yMean = data.reduce((sum, d) => sum + d.value, 0) / n
    
    return yMean - slope * xMean
  }

  private calculateR2(data: HistoricalDataPoint[], slope: number, intercept: number): number {
    const yMean = data.reduce((sum, d) => sum + d.value, 0) / data.length
    
    let ssRes = 0
    let ssTot = 0
    
    data.forEach((d, i) => {
      const predicted = slope * i + intercept
      ssRes += Math.pow(d.value - predicted, 2)
      ssTot += Math.pow(d.value - yMean, 2)
    })
    
    return ssTot === 0 ? 0 : 1 - (ssRes / ssTot)
  }

  forecast(data: HistoricalDataPoint[], periodsAhead: number = 1): ForecastResult {
    if (data.length < 2) {
      return {
        prediction: data[0]?.value || 0,
        confidence: 0.1,
        trend: 'stable',
        timeframe: '30 days',
        factors: ['Insufficient historical data']
      }
    }

    const slope = this.calculateSlope(data)
    const intercept = this.calculateIntercept(data, slope)
    const r2 = this.calculateR2(data, slope, intercept)
    
    const prediction = slope * (data.length + periodsAhead - 1) + intercept
    const confidence = Math.max(0.1, Math.min(0.95, r2))
    
    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (Math.abs(slope) > 0.01) {
      trend = slope > 0 ? 'up' : 'down'
    }

    const factors = []
    if (Math.abs(slope) > 0.05) factors.push('Strong trend detected')
    if (r2 > 0.7) factors.push('High predictability')
    if (data.length > 12) factors.push('Sufficient historical data')

    return {
      prediction: Math.max(0, prediction),
      confidence,
      trend,
      timeframe: `${periodsAhead * 30} days`,
      factors,
      accuracy: r2
    }
  }
}

/**
 * Exponential Smoothing for seasonal patterns
 */
class ExponentialSmoothingForecaster {
  private alpha: number = 0.3
  private beta: number = 0.1
  private gamma: number = 0.1

  private detectSeasonality(data: HistoricalDataPoint[]): { period: number; strength: number } {
    if (data.length < 12) return { period: 0, strength: 0 }

    const autocorrelations = []
    for (let lag = 1; lag <= Math.min(12, Math.floor(data.length / 2)); lag++) {
      let correlation = 0
      let count = 0
      
      for (let i = lag; i < data.length; i++) {
        correlation += data[i].value * data[i - lag].value
        count++
      }
      
      autocorrelations.push(count > 0 ? correlation / count : 0)
    }

    const maxCorr = Math.max(...autocorrelations)
    const period = autocorrelations.indexOf(maxCorr) + 1
    
    return { period, strength: maxCorr }
  }

  forecast(data: HistoricalDataPoint[], periodsAhead: number = 1): ForecastResult {
    if (data.length < 3) {
      const recent = data.slice(-1)[0]?.value || 0
      return {
        prediction: recent,
        confidence: 0.2,
        trend: 'stable',
        timeframe: `${periodsAhead * 30} days`,
        factors: ['Limited data for exponential smoothing']
      }
    }

    const { strength } = this.detectSeasonality(data)
    const values = data.map(d => d.value)
    
    // Simple exponential smoothing
    let level = values[0]
    let trend = values[1] - values[0]
    
    for (let i = 1; i < values.length; i++) {
      const prevLevel = level
      level = this.alpha * values[i] + (1 - this.alpha) * (prevLevel + trend)
      trend = this.beta * (level - prevLevel) + (1 - this.beta) * trend
    }

    const prediction = level + trend * periodsAhead
    const recentVariance = this.calculateVariance(values.slice(-6))
    const confidence = Math.max(0.2, Math.min(0.9, 1 - (recentVariance / Math.abs(level))))

    const trendDirection = trend > 0.01 ? 'up' : trend < -0.01 ? 'down' : 'stable'

    const factors = []
    if (strength > 0.3) factors.push('Seasonal pattern detected')
    if (Math.abs(trend) > 0.05) factors.push('Strong trend component')
    factors.push('Exponential smoothing applied')

    return {
      prediction: Math.max(0, prediction),
      confidence,
      trend: trendDirection,
      timeframe: `${periodsAhead * 30} days`,
      factors
    }
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    return Math.sqrt(variance)
  }
}

/**
 * Ensemble Forecaster - combines multiple algorithms
 */
class EnsembleForecaster {
  private linearRegression = new LinearRegressionForecaster()
  private exponentialSmoothing = new ExponentialSmoothingForecaster()

  forecast(data: HistoricalDataPoint[], periodsAhead: number = 1): ForecastResult {
    const lrResult = this.linearRegression.forecast(data, periodsAhead)
    const esResult = this.exponentialSmoothing.forecast(data, periodsAhead)

    // Weight by confidence
    const totalConfidence = lrResult.confidence + esResult.confidence
    const lrWeight = totalConfidence > 0 ? lrResult.confidence / totalConfidence : 0.5
    const esWeight = totalConfidence > 0 ? esResult.confidence / totalConfidence : 0.5

    const prediction = lrResult.prediction * lrWeight + esResult.prediction * esWeight
    const confidence = Math.max(lrResult.confidence, esResult.confidence) * 0.9 // Slight penalty for ensemble

    // Determine trend by majority vote
    const trends = [lrResult.trend, esResult.trend]
    const trendCounts = trends.reduce((acc, trend) => {
      acc[trend] = (acc[trend] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const dominantTrend = Object.entries(trendCounts)
      .sort(([,a], [,b]) => b - a)[0][0] as 'up' | 'down' | 'stable'

    const factors = [
      'Ensemble of linear regression and exponential smoothing',
      ...new Set([...lrResult.factors, ...esResult.factors])
    ]

    return {
      prediction: Math.max(0, prediction),
      confidence,
      trend: dominantTrend,
      timeframe: `${periodsAhead * 30} days`,
      factors
    }
  }
}

/**
 * Main Forecasting Engine
 */
export class AIForecastingEngine {
  private config: ForecastingConfig

  constructor(config: Partial<ForecastingConfig> = {}) {
    this.config = {
      algorithm: 'ensemble',
      seasonality: true,
      trendStrength: 0.5,
      confidenceLevel: 0.8,
      ...config
    }
  }

  /**
   * Budget forecasting with cost factor analysis
   */
  async forecastBudget(
    historicalSpending: HistoricalDataPoint[],
    externalFactors?: {
      inflationRate?: number
      seasonalMultiplier?: number
      programExpansion?: number
    }
  ): Promise<ForecastResult> {
    const forecaster = this.getForecaster()
    const baseResult = forecaster.forecast(historicalSpending)

    // Apply external factors
    let adjustedPrediction = baseResult.prediction
    const adjustmentFactors = []

    if (externalFactors?.inflationRate) {
      adjustedPrediction *= (1 + externalFactors.inflationRate)
      adjustmentFactors.push(`Inflation adjustment: ${(externalFactors.inflationRate * 100).toFixed(1)}%`)
    }

    if (externalFactors?.seasonalMultiplier) {
      adjustedPrediction *= externalFactors.seasonalMultiplier
      adjustmentFactors.push(`Seasonal factor: ${(externalFactors.seasonalMultiplier * 100).toFixed(0)}%`)
    }

    if (externalFactors?.programExpansion) {
      adjustedPrediction *= (1 + externalFactors.programExpansion)
      adjustmentFactors.push(`Program expansion: ${(externalFactors.programExpansion * 100).toFixed(1)}%`)
    }

    return {
      ...baseResult,
      prediction: adjustedPrediction,
      factors: [...baseResult.factors, ...adjustmentFactors]
    }
  }

  /**
   * Beneficiary count forecasting
   */
  async forecastBeneficiaries(
    historicalCounts: HistoricalDataPoint[],
    demographicTrends?: {
      populationGrowth?: number
      enrollmentRate?: number
      dropoutRate?: number
    }
  ): Promise<ForecastResult> {
    const forecaster = this.getForecaster()
    const baseResult = forecaster.forecast(historicalCounts)

    let adjustedPrediction = baseResult.prediction
    const adjustmentFactors = []

    if (demographicTrends?.populationGrowth) {
      adjustedPrediction *= (1 + demographicTrends.populationGrowth)
      adjustmentFactors.push(`Population growth: ${(demographicTrends.populationGrowth * 100).toFixed(1)}%`)
    }

    if (demographicTrends?.enrollmentRate) {
      adjustedPrediction *= (1 + demographicTrends.enrollmentRate)
      adjustmentFactors.push(`Enrollment rate change: ${(demographicTrends.enrollmentRate * 100).toFixed(1)}%`)
    }

    if (demographicTrends?.dropoutRate) {
      adjustedPrediction *= (1 - demographicTrends.dropoutRate)
      adjustmentFactors.push(`Dropout rate: ${(demographicTrends.dropoutRate * 100).toFixed(1)}%`)
    }

    return {
      ...baseResult,
      prediction: Math.round(adjustedPrediction),
      factors: [...baseResult.factors, ...adjustmentFactors]
    }
  }

  /**
   * Quality score forecasting
   */
  async forecastQuality(
    historicalScores: HistoricalDataPoint[],
    qualityFactors?: {
      staffTraining?: number
      equipmentUpgrade?: number
      processImprovement?: number
    }
  ): Promise<ForecastResult> {
    const forecaster = this.getForecaster()
    const baseResult = forecaster.forecast(historicalScores)

    let adjustedPrediction = baseResult.prediction
    const adjustmentFactors = []

    if (qualityFactors?.staffTraining) {
      adjustedPrediction += qualityFactors.staffTraining * 5 // Training impact
      adjustmentFactors.push(`Staff training impact: +${qualityFactors.staffTraining * 5} points`)
    }

    if (qualityFactors?.equipmentUpgrade) {
      adjustedPrediction += qualityFactors.equipmentUpgrade * 3 // Equipment impact
      adjustmentFactors.push(`Equipment upgrade: +${qualityFactors.equipmentUpgrade * 3} points`)
    }

    if (qualityFactors?.processImprovement) {
      adjustedPrediction += qualityFactors.processImprovement * 4 // Process impact
      adjustmentFactors.push(`Process improvement: +${qualityFactors.processImprovement * 4} points`)
    }

    // Cap quality score at 100
    adjustedPrediction = Math.min(100, adjustedPrediction)

    return {
      ...baseResult,
      prediction: adjustedPrediction,
      factors: [...baseResult.factors, ...adjustmentFactors]
    }
  }

  /**
   * Multi-variate forecasting for complex scenarios
   */
  async forecastMultivariate(
    datasets: {
      budget: HistoricalDataPoint[]
      beneficiaries: HistoricalDataPoint[]
      quality: HistoricalDataPoint[]
    },
    correlationFactors?: {
      budgetBeneficiaryCorr?: number
      budgetQualityCorr?: number
      beneficiaryQualityCorr?: number
    }
  ): Promise<{
    budget: ForecastResult
    beneficiaries: ForecastResult
    quality: ForecastResult
    correlationInsights: string[]
  }> {
    const budgetForecast = await this.forecastBudget(datasets.budget)
    const beneficiariesForecast = await this.forecastBeneficiaries(datasets.beneficiaries)
    const qualityForecast = await this.forecastQuality(datasets.quality)

    const correlationInsights = []

    if (correlationFactors?.budgetBeneficiaryCorr && Math.abs(correlationFactors.budgetBeneficiaryCorr) > 0.3) {
      correlationInsights.push(
        `Strong correlation between budget and beneficiaries (${(correlationFactors.budgetBeneficiaryCorr * 100).toFixed(0)}%)`
      )
    }

    if (correlationFactors?.budgetQualityCorr && Math.abs(correlationFactors.budgetQualityCorr) > 0.3) {
      correlationInsights.push(
        `Budget investment impacts quality (${(correlationFactors.budgetQualityCorr * 100).toFixed(0)}%)`
      )
    }

    return {
      budget: budgetForecast,
      beneficiaries: beneficiariesForecast,
      quality: qualityForecast,
      correlationInsights
    }
  }

  private getForecaster() {
    switch (this.config.algorithm) {
      case 'linear_regression':
        return new LinearRegressionForecaster()
      case 'exponential_smoothing':
        return new ExponentialSmoothingForecaster()
      case 'ensemble':
      default:
        return new EnsembleForecaster()
    }
  }
}

/**
 * Utility functions for data preparation
 */
export class ForecastingUtils {
  /**
   * Convert database records to historical data points
   */
  static prepareHistoricalData(
    records: Array<{ date: Date | string; value: number; [key: string]: unknown }>,
    valueField: string = 'value'
  ): HistoricalDataPoint[] {
    return records
      .map(record => ({
        date: typeof record.date === 'string' ? record.date : record.date.toISOString(),
        value: Number(record[valueField] || record.value || 0),
        metadata: record
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  /**
   * Calculate data quality metrics with robust NaN handling
   */
  static assessDataQuality(data: HistoricalDataPoint[]): {
    completeness: number
    consistency: number
    recency: number
    recommendation: string
  } {
    // Handle empty data case
    if (!data || data.length === 0) {
      return {
        completeness: 0,
        consistency: 0,
        recency: 0,
        recommendation: 'No historical data available'
      }
    }

    // Calculate completeness (0-1 scale)
    const completeness = Math.min(1, data.length / 6)
    
    // Calculate consistency - handle NaN values
    const validValues = data
      .map(d => Number(d.value))
      .filter(val => !isNaN(val) && isFinite(val))
    
    let consistency = 0
    if (validValues.length > 1) {
      const mean = validValues.reduce((a, b) => a + b, 0) / validValues.length
      if (mean > 0) {
        const variance = validValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validValues.length
        consistency = variance === 0 ? 1 : Math.max(0, 1 - (Math.sqrt(variance) / mean))
        
        // Ensure consistency is a valid number
        if (!isFinite(consistency) || isNaN(consistency)) {
          consistency = 0.5 // Default moderate consistency
        }
      } else {
        consistency = 0.3 // Low consistency for zero/negative mean
      }
    } else {
      consistency = 0.5 // Single data point gets moderate consistency
    }
    
    // Calculate recency
    const latestDate = new Date(data[data.length - 1]?.date || 0)
    const daysSinceLatest = (Date.now() - latestDate.getTime()) / (1000 * 60 * 60 * 24)
    let recency = Math.max(0, 1 - (daysSinceLatest / 30))
    
    // Ensure recency is valid
    if (!isFinite(recency) || isNaN(recency)) {
      recency = 0
    }

    // Generate recommendation
    let recommendation = 'Good'
    if (completeness < 0.3) {
      recommendation = 'Insufficient historical data - need at least 2 months'
    } else if (completeness < 0.5) {
      recommendation = 'Need more historical data for better accuracy'
    } else if (consistency < 0.3) {
      recommendation = 'Data too volatile - consider data smoothing'
    } else if (recency < 0.3) {
      recommendation = 'Data outdated - needs recent updates'
    } else if (recency < 0.5) {
      recommendation = 'Data needs more frequent updates'
    }

    return { 
      completeness: Math.max(0, Math.min(1, completeness)), 
      consistency: Math.max(0, Math.min(1, consistency)), 
      recency: Math.max(0, Math.min(1, recency)), 
      recommendation 
    }
  }
}