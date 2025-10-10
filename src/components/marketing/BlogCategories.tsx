import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

const categories = [
  { name: 'All Posts', count: 24, active: true },
  { name: 'Nutrition', count: 8 },
  { name: 'Procurement', count: 6 },
  { name: 'Production', count: 5 },
  { name: 'Case Study', count: 3 },
  { name: 'Quality Control', count: 2 }
]

export function BlogCategories() {
  return (
    <Card className="p-6 mb-8">
      <h3 className="font-semibold mb-4">Kategori</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <div 
            key={category.name}
            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
              category.active ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
            }`}
          >
            <span className="text-sm font-medium">{category.name}</span>
            <Badge variant="secondary" className="text-xs">
              {category.count}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}