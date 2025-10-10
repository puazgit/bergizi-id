import { Metadata } from 'next'
import { 
  Building2, 
  Users, 
  CreditCard, 
  BarChart3, 
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Platform Admin Dashboard | Bergizi-ID',
  description: 'Platform administration dashboard for managing SPPG tenants and system operations'
}

// Mock data untuk demo
const dashboardStats = {
  totalSppg: 127,
  activeSppg: 115,
  totalUsers: 2843,
  monthlyRevenue: 'Rp 2.4M',
  pendingRequests: 8,
  systemHealth: 99.8
}

const recentActivity = [
  {
    id: 1,
    type: 'sppg_onboarding',
    message: 'SPPG Bandung Timur completed onboarding',
    timestamp: '2 hours ago'
  },
  {
    id: 2,
    type: 'subscription',
    message: 'SPPG Jakarta Selatan upgraded to Professional plan',
    timestamp: '4 hours ago'
  },
  {
    id: 3,
    type: 'support',
    message: 'Support ticket #1247 resolved',
    timestamp: '6 hours ago'
  }
]

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Platform Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage the Bergizi-ID SaaS platform
          </p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          System Healthy
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SPPG</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalSppg}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.activeSppg} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.monthlyRevenue}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.systemHealth}%</div>
            <p className="text-xs text-muted-foreground">
              99.9% uptime SLA
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest platform activities and events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Pending Requests
              <Badge variant="destructive">{dashboardStats.pendingRequests}</Badge>
            </CardTitle>
            <CardDescription>
              Items requiring admin attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Demo Requests</span>
                </div>
                <Badge variant="secondary">5</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Support Tickets</span>
                </div>
                <Badge variant="destructive">3</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">SPPG Approvals</span>
                </div>
                <Badge variant="outline">2</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Frequently used admin operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <Building2 className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Manage SPPG</h3>
              <p className="text-sm text-muted-foreground">
                View and manage all SPPG tenants
              </p>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <Users className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">User Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage platform users and roles
              </p>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <BarChart3 className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Analytics</h3>
              <p className="text-sm text-muted-foreground">
                View platform usage analytics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}