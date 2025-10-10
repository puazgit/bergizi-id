'use client'

import React from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, Target, Zap, Brain } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useDashboardAdvancedMetrics } from '../hooks'

interface AdvancedMetricsDisplayProps {
  enabled?: boolean
  className?: string
}

interface ForecastData {
  trend: 'up' | 'down' | 'stable'
  confidence: number
  prediction: number
  timeframe: string
}

interface AIInsight {
  type: 'warning' | 'opportunity' | 'trend' | 'efficiency'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  confidence: number
}

export const AdvancedMetricsDisplay: React.FC<AdvancedMetricsDisplayProps> = ({
  enabled = false,
  className = ""
}) => {
  const { advancedMetrics, isLoading, error } = useDashboardAdvancedMetrics(enabled)

  // Type guard and data extraction
  const metricsData = React.useMemo(() => {
    if (!advancedMetrics || typeof advancedMetrics !== 'object') {
      return null
    }

    const data = advancedMetrics as {
      forecasting?: {
        budget?: ForecastData
        beneficiaries?: ForecastData
        quality?: ForecastData
      }
      aiInsights?: AIInsight[]
      efficiency?: {
        score: number
        improvements: string[]
      }
      trends?: {
        period: string
        metrics: Array<{
          name: string
          change: number
          trend: 'up' | 'down' | 'stable'
        }>
      }
    }

    return data
  }, [advancedMetrics])

  if (!enabled) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">AI Analytics Disabled</p>
            <p className="text-sm">Enable advanced analytics in dashboard settings to view AI-powered insights</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2 animate-pulse" />
            Loading AI Insights...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>AI Analytics Error</AlertTitle>
        <AlertDescription>{error?.message || 'Unknown error occurred'}</AlertDescription>
      </Alert>
    )
  }

  if (!metricsData) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>No advanced metrics available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { forecasting, aiInsights, efficiency, trends } = metricsData

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Insights */}
      {aiInsights && aiInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              AI Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiInsights.map((insight, index) => (
              <Alert
                key={index}
                variant={insight.type === 'warning' ? 'destructive' : 'default'}
                className="border-l-4 border-l-primary"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <AlertTitle className="flex items-center gap-2">
                      {insight.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                      {insight.type === 'opportunity' && <Target className="h-4 w-4" />}
                      {insight.type === 'trend' && <TrendingUp className="h-4 w-4" />}
                      {insight.type === 'efficiency' && <Zap className="h-4 w-4" />}
                      {insight.title}
                    </AlertTitle>
                    <AlertDescription className="mt-1">
                      {insight.description}
                    </AlertDescription>
                  </div>
                  <div className="ml-4 flex flex-col items-end gap-1">
                    <Badge variant={
                      insight.priority === 'high' ? 'destructive' :
                      insight.priority === 'medium' ? 'default' : 'secondary'
                    }>
                      {insight.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(insight.confidence)}% confidence
                    </span>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Forecasting */}
      {forecasting && (
        <Card>
          <CardHeader>
            <CardTitle>AI Forecasting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {forecasting.budget && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Budget Forecast</span>
                    {forecasting.budget.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : forecasting.budget.trend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <div className="h-4 w-4 bg-muted rounded-full" />
                    )}
                  </div>
                  <div className="text-2xl font-bold">
                    Rp {forecasting.budget.prediction.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {forecasting.budget.timeframe} • {Math.round(forecasting.budget.confidence)}% confidence
                  </div>
                  <Progress value={forecasting.budget.confidence} className="h-1" />
                </div>
              )}

              {forecasting.beneficiaries && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Beneficiaries</span>
                    {forecasting.beneficiaries.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : forecasting.beneficiaries.trend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <div className="h-4 w-4 bg-muted rounded-full" />
                    )}
                  </div>
                  <div className="text-2xl font-bold">
                    {forecasting.beneficiaries.prediction.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {forecasting.beneficiaries.timeframe} • {Math.round(forecasting.beneficiaries.confidence)}% confidence
                  </div>
                  <Progress value={forecasting.beneficiaries.confidence} className="h-1" />
                </div>
              )}

              {forecasting.quality && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quality Score</span>
                    {forecasting.quality.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : forecasting.quality.trend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <div className="h-4 w-4 bg-muted rounded-full" />
                    )}
                  </div>
                  <div className="text-2xl font-bold">
                    {forecasting.quality.prediction.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {forecasting.quality.timeframe} • {Math.round(forecasting.quality.confidence)}% confidence
                  </div>
                  <Progress value={forecasting.quality.confidence} className="h-1" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Efficiency Score */}
      {efficiency && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Operational Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Overall Score</span>
                <div className="text-3xl font-bold text-primary">
                  {efficiency.score}%
                </div>
              </div>
              <Progress value={efficiency.score} className="h-2" />
              
              {efficiency.improvements && efficiency.improvements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Improvement Opportunities:</h4>
                  <ul className="space-y-1">
                    {efficiency.improvements.map((improvement, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start">
                        <span className="text-primary mr-2">•</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trends Analysis */}
      {trends && trends.metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Trend Analysis</CardTitle>
            <p className="text-sm text-muted-foreground">
              Performance trends for {trends.period}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trends.metrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : metric.trend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <div className="h-4 w-4 bg-muted rounded-full" />
                    )}
                    <span className="font-medium">{metric.name}</span>
                  </div>
                  <div className={`font-mono text-sm ${
                    metric.change > 0 ? 'text-green-600' :
                    metric.change < 0 ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}