/**
 * AI Forecasting Service for SPPG Dashboard
 * Integrates ML algorithms with real SPPG data
 */

import db from '@/lib/db'
import { AIForecastingEngine, ForecastingUtils, type HistoricalDataPoint, type ForecastResult } from './forecasting'

export interface SPPGForecastingResult {
  budget: ForecastResult
  beneficiaries: ForecastResult
  quality: ForecastResult
  dataQuality: {
    budget: ReturnType<typeof ForecastingUtils.assessDataQuality>
    beneficiaries: ReturnType<typeof ForecastingUtils.assessDataQuality>
    quality: ReturnType<typeof ForecastingUtils.assessDataQuality>
  }
  insights: string[]
  lastUpdated: string
}

export class SPPGForecastingService {
  private engine: AIForecastingEngine
  private sppgId: string

  constructor(sppgId: string) {
    this.sppgId = sppgId
    this.engine = new AIForecastingEngine({
      algorithm: 'ensemble',
      seasonality: true,
      confidenceLevel: 0.8
    })
  }

  /**
   * Get comprehensive forecasting for SPPG dashboard
   */
  async getComprehensiveForecast(): Promise<SPPGForecastingResult> {
    const [budgetData, beneficiaryData, qualityData] = await Promise.all([
      this.getBudgetHistoricalData(),
      this.getBeneficiaryHistoricalData(),
      this.getQualityHistoricalData()
    ])

    // Assess data quality
    const dataQuality = {
      budget: ForecastingUtils.assessDataQuality(budgetData),
      beneficiaries: ForecastingUtils.assessDataQuality(beneficiaryData),
      quality: ForecastingUtils.assessDataQuality(qualityData)
    }

    // Get external factors
    const externalFactors = await this.getExternalFactors()

    // Generate forecasts
    const [budgetForecast, beneficiariesForecast, qualityForecast] = await Promise.all([
      this.engine.forecastBudget(budgetData, {
        inflationRate: externalFactors.inflationRate,
        seasonalMultiplier: externalFactors.seasonalMultiplier,
        programExpansion: externalFactors.programExpansion
      }),
      this.engine.forecastBeneficiaries(beneficiaryData, {
        populationGrowth: externalFactors.populationGrowth,
        enrollmentRate: externalFactors.enrollmentRate,
        dropoutRate: externalFactors.dropoutRate
      }),
      this.engine.forecastQuality(qualityData, {
        staffTraining: externalFactors.staffTraining,
        equipmentUpgrade: externalFactors.equipmentUpgrade,
        processImprovement: externalFactors.processImprovement
      })
    ])

    // Generate insights
    const insights = this.generateInsights({
      budget: budgetForecast,
      beneficiaries: beneficiariesForecast,
      quality: qualityForecast,
      dataQuality,
      externalFactors
    })

    return {
      budget: budgetForecast,
      beneficiaries: beneficiariesForecast,
      quality: qualityForecast,
      dataQuality,
      insights,
      lastUpdated: new Date().toISOString()
    }
  }

  /**
   * Get historical budget data from procurement and expenses
   */
  private async getBudgetHistoricalData(): Promise<HistoricalDataPoint[]> {
    // Get monthly procurement spending
    const procurementData = await db.$queryRaw<Array<{
      month: string
      total_spending: number
    }>>`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM("totalAmount") as total_spending
      FROM "procurements"
      WHERE "sppgId" = ${this.sppgId}
        AND "deliveryStatus" = 'DELIVERED'
        AND "createdAt" >= NOW() - INTERVAL '24 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `

    // Get operational expenses if available
    const operationalData = await db.$queryRaw<Array<{
      month: string
      operational_cost: number
    }>>`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM("actualCost") as operational_cost
      FROM "food_productions"
      WHERE "sppgId" = ${this.sppgId}
        AND "actualCost" IS NOT NULL
        AND "createdAt" >= NOW() - INTERVAL '24 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `

    // Combine procurement and operational costs
    const combinedData = new Map<string, number>()
    
    procurementData.forEach((item: { month: string; total_spending: number }) => {
      const monthKey = new Date(item.month).toISOString().substring(0, 7) // YYYY-MM
      const spending = Number(item.total_spending)
      if (isFinite(spending) && !isNaN(spending) && spending >= 0) {
        combinedData.set(monthKey, (combinedData.get(monthKey) || 0) + spending)
      }
    })

    operationalData.forEach((item: { month: string; operational_cost: number }) => {
      const monthKey = new Date(item.month).toISOString().substring(0, 7)
      const cost = Number(item.operational_cost)
      if (isFinite(cost) && !isNaN(cost) && cost >= 0) {
        combinedData.set(monthKey, (combinedData.get(monthKey) || 0) + cost)
      }
    })

    return Array.from(combinedData.entries())
      .map(([month, value]) => ({
        date: `${month}-01`,
        value,
        metadata: { type: 'monthly_spending' }
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  /**
   * Get historical beneficiary count data
   */
  private async getBeneficiaryHistoricalData(): Promise<HistoricalDataPoint[]> {
    const beneficiaryData = await db.$queryRaw<Array<{
      month: string
      active_beneficiaries: number
      new_registrations: number
    }>>`
      SELECT 
        DATE_TRUNC('month', sb."createdAt") as month,
        COUNT(*) as active_beneficiaries,
        COUNT(CASE WHEN DATE_TRUNC('month', sb."createdAt") = DATE_TRUNC('month', sb."updatedAt") THEN 1 END) as new_registrations
      FROM "school_beneficiaries" sb
      JOIN "nutrition_programs" np ON sb."programId" = np.id
      WHERE np."sppgId" = ${this.sppgId}
        AND sb."isActive" = true
        AND sb."createdAt" >= NOW() - INTERVAL '24 months'
      GROUP BY DATE_TRUNC('month', sb."createdAt")
      ORDER BY month ASC
    `

    return beneficiaryData
      .map((item: { month: string; active_beneficiaries: number; new_registrations: number }) => {
        const beneficiaries = Number(item.active_beneficiaries)
        const registrations = Number(item.new_registrations)
        
        // Only include valid data points
        if (!isFinite(beneficiaries) || isNaN(beneficiaries) || beneficiaries < 0) {
          return null
        }
        
        return {
          date: new Date(item.month).toISOString().substring(0, 10),
          value: beneficiaries,
          metadata: { 
            type: 'beneficiary_count',
            new_registrations: isFinite(registrations) && !isNaN(registrations) ? registrations : 0
          }
        }
      })
      .filter(item => item !== null) as HistoricalDataPoint[]
  }

  /**
   * Get historical quality score data
   */
  private async getQualityHistoricalData(): Promise<HistoricalDataPoint[]> {
    // Get quality control scores
    const qualityData = await db.$queryRaw<Array<{
      month: string
      avg_quality_score: number
      quality_checks: number
    }>>`
      SELECT 
        DATE_TRUNC('month', qc."createdAt") as month,
        AVG(CASE WHEN qc."passed" THEN 100 ELSE 50 END) as avg_quality_score,
        COUNT(*) as quality_checks
      FROM "quality_controls" qc
      JOIN "food_productions" fp ON qc."productionId" = fp.id
      WHERE fp."sppgId" = ${this.sppgId}
        AND qc."createdAt" >= NOW() - INTERVAL '24 months'
      GROUP BY DATE_TRUNC('month', qc."createdAt")
      ORDER BY month ASC
    `

    // If no quality data, use feedback satisfaction as proxy
    if (qualityData.length === 0) {
      const feedbackData = await db.$queryRaw<Array<{
        month: string
        avg_satisfaction: number
        feedback_count: number
      }>>`
        SELECT 
          DATE_TRUNC('month', bf."createdAt") as month,
          AVG("rating") as avg_satisfaction,
          COUNT(*) as feedback_count
        FROM "beneficiary_feedback" bf
        JOIN "school_beneficiaries" sb ON bf."beneficiaryId" = sb.id
        JOIN "nutrition_programs" np ON sb."programId" = np.id
        WHERE np."sppgId" = ${this.sppgId}
          AND bf."rating" IS NOT NULL
          AND bf."createdAt" >= NOW() - INTERVAL '24 months'
        GROUP BY DATE_TRUNC('month', bf."createdAt")
        ORDER BY month ASC
      `

      return feedbackData
        .map((item: { month: string; avg_satisfaction: number; feedback_count: number }) => {
          const satisfaction = Number(item.avg_satisfaction)
          const count = Number(item.feedback_count)
          
          // Only include valid satisfaction scores
          if (!isFinite(satisfaction) || isNaN(satisfaction) || satisfaction <= 0) {
            return null
          }
          
          return {
            date: new Date(item.month).toISOString().substring(0, 10),
            value: satisfaction * 20, // Convert 1-5 scale to 1-100
            metadata: { 
              type: 'satisfaction_score',
              feedback_count: isFinite(count) && !isNaN(count) ? count : 0
            }
          }
        })
        .filter(item => item !== null) as HistoricalDataPoint[]
    }

    return qualityData
      .map((item: { month: string; avg_quality_score: number; quality_checks: number }) => {
        const quality = Number(item.avg_quality_score)
        const checks = Number(item.quality_checks)
        
        // Only include valid quality scores
        if (!isFinite(quality) || isNaN(quality) || quality < 0) {
          return null
        }
        
        return {
          date: new Date(item.month).toISOString().substring(0, 10),
          value: quality,
          metadata: { 
            type: 'quality_score',
            quality_checks: isFinite(checks) && !isNaN(checks) ? checks : 0
          }
        }
      })
      .filter(item => item !== null) as HistoricalDataPoint[]
  }

  /**
   * Get external factors that might affect forecasting
   */
  private async getExternalFactors(): Promise<{
    inflationRate: number
    seasonalMultiplier: number
    programExpansion: number
    populationGrowth: number
    enrollmentRate: number
    dropoutRate: number
    staffTraining: number
    equipmentUpgrade: number
    processImprovement: number
  }> {
    // Get SPPG-specific factors
    const sppg = await db.sPPG.findUnique({
      where: { id: this.sppgId },
      select: {
        targetRecipients: true,
        subscription: {
          select: {
            tier: true
          }
        },
        _count: {
          select: {
            nutritionPrograms: true,
            users: true
          }
        }
      }
    })

    // Get recent program activity
    const recentActivity = await db.nutritionProgram.count({
      where: {
        sppgId: this.sppgId,
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
        }
      }
    })

    // Base external factors (could be enhanced with real economic data APIs)
    const currentMonth = new Date().getMonth()
    const seasonalMultiplier = this.getSeasonalMultiplier(currentMonth)

    return {
      inflationRate: 0.03, // 3% annual inflation estimate
      seasonalMultiplier,
      programExpansion: recentActivity > 0 ? 0.1 : 0, // 10% expansion if new programs
      populationGrowth: 0.012, // 1.2% Indonesia population growth
      enrollmentRate: sppg?.subscription?.tier === 'PRO' || sppg?.subscription?.tier === 'ENTERPRISE' ? 0.05 : 0.02,
      dropoutRate: 0.03, // 3% estimated dropout
      staffTraining: (sppg?._count.users || 0) > 5 ? 0.8 : 0.3,
      equipmentUpgrade: sppg?.subscription?.tier === 'PRO' || sppg?.subscription?.tier === 'ENTERPRISE' ? 0.6 : 0.2,
      processImprovement: 0.4 // Moderate process improvement
    }
  }

  /**
   * Get seasonal multiplier based on month
   */
  private getSeasonalMultiplier(month: number): number {
    // Indonesian school calendar considerations
    // Higher demand during school terms, lower during holidays
    const seasonalPattern = [
      1.1, // January - New school year
      1.2, // February - Peak term
      1.1, // March - Term continues
      1.0, // April - Normal
      0.9, // May - Mid-year
      0.8, // June - School holidays
      0.7, // July - Holiday season
      1.0, // August - New semester
      1.1, // September - Peak activity
      1.1, // October - Continued activity
      1.0, // November - Normal
      0.9  // December - Year end
    ]

    return seasonalPattern[month] || 1.0
  }

  /**
   * Generate actionable insights from forecasting results
   */
  private generateInsights(data: {
    budget: ForecastResult
    beneficiaries: ForecastResult
    quality: ForecastResult
    dataQuality: SPPGForecastingResult['dataQuality']
    externalFactors: {
      inflationRate: number
      seasonalMultiplier: number
      programExpansion: number
      populationGrowth: number
      enrollmentRate: number
      dropoutRate: number
      staffTraining: number
      equipmentUpgrade: number
      processImprovement: number
    }
  }): string[] {
    const insights: string[] = []

    // Budget insights
    if (data.budget.trend === 'up' && data.budget.confidence > 0.7) {
      insights.push(`Budget expected to increase by ${((data.budget.prediction - 1) * 100).toFixed(1)}% - consider cost optimization strategies`)
    } else if (data.budget.trend === 'down') {
      insights.push('Budget trending downward - potential efficiency gains or reduced program scope')
    }

    // Beneficiary insights
    if (data.beneficiaries.trend === 'up' && data.beneficiaries.confidence > 0.6) {
      insights.push(`Beneficiary count projected to grow - prepare for ${Math.round(data.beneficiaries.prediction)} participants`)
    }

    // Quality insights
    if (data.quality.trend === 'down' && data.quality.confidence > 0.5) {
      insights.push('Quality scores declining - recommend staff training and process review')
    } else if (data.quality.prediction > 85) {
      insights.push('Excellent quality trajectory - maintain current standards')
    }

    // Data quality recommendations
    if (data.dataQuality.budget.completeness < 0.7) {
      insights.push('Budget forecasting limited by insufficient historical data - collect more spending records')
    }

    if (data.dataQuality.quality.recency < 0.5) {
      insights.push('Quality data outdated - increase frequency of quality assessments')
    }

    // Correlation insights
    const budgetPerBeneficiary = data.budget.prediction / data.beneficiaries.prediction
    if (budgetPerBeneficiary > 50000) { // Rp 50k per beneficiary per month
      insights.push('High cost per beneficiary detected - review procurement efficiency')
    }

    // Seasonal insights
    if (data.externalFactors.seasonalMultiplier > 1.1) {
      insights.push('Entering high-demand season - prepare for increased operational requirements')
    }

    return insights.slice(0, 5) // Limit to top 5 insights
  }
}

// Remove the server action from this file since it needs to be in actions folder