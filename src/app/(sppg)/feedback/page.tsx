import { Suspense } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FeedbackList, 
  FeedbackForm, 
  FeedbackAnalytics 
} from '@/components/sppg/feedback'
import { 
  MessageSquare, 
  Plus, 
  BarChart3
} from 'lucide-react'

export default function FeedbackPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Feedback Management
        </h1>
        <p className="text-muted-foreground">
          Kelola feedback dari penerima manfaat dan tingkatkan kualitas layanan
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Daftar Feedback
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tambah Feedback
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Feedback List Tab */}
        <TabsContent value="list" className="space-y-4">
          <Suspense fallback={<FeedbackListSkeleton />}>
            <FeedbackList />
          </Suspense>
        </TabsContent>

        {/* Feedback Form Tab */}
        <TabsContent value="form" className="space-y-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Formulir Feedback Baru
              </h2>
              <p className="text-muted-foreground">
                Bantu penerima manfaat menyampaikan feedback mereka
              </p>
            </div>
            <FeedbackForm />
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Suspense fallback={<AnalyticsSkeleton />}>
            <FeedbackAnalytics />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ================================ LOADING COMPONENTS ================================

function FeedbackListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg" />
              <div className="flex-1">
                <div className="h-3 bg-muted rounded w-20 mb-2" />
                <div className="h-6 bg-muted rounded w-12" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* List Skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="flex gap-2">
                  <div className="h-5 bg-muted rounded w-16" />
                  <div className="h-5 bg-muted rounded w-20" />
                  <div className="h-5 bg-muted rounded w-12" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Key Metrics Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg" />
              <div className="flex-1">
                <div className="h-3 bg-muted rounded w-20 mb-2" />
                <div className="h-6 bg-muted rounded w-16" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-5 bg-muted rounded w-1/3 mb-6" />
            <div className="space-y-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-4 bg-muted rounded w-16" />
                  </div>
                  <div className="h-2 bg-muted rounded w-full" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}