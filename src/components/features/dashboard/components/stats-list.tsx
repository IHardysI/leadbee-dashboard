import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

interface StatsItem {
  title: string
  count: number
  isDivider?: boolean
}

interface StatsListProps {
  items: StatsItem[]
  isLoading?: boolean
}

export function StatsList({ items, isLoading = false }: StatsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Статистика лидов</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-2 p-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-12" />
                </div>
              ))}
            </div>
          ) : (
            // Actual data
            <div className="space-y-0.5">
              {items.map((item, index) => (
                item.isDivider ? (
                  <div 
                    key={index} 
                    className="px-4 py-2 bg-muted font-semibold text-xs uppercase tracking-wide"
                  >
                    {item.title}
                  </div>
                ) : (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm font-medium">{item.title}</span>
                    <Badge variant="secondary" className="font-mono">
                      {(item.count ?? 0).toLocaleString()}
                    </Badge>
                  </div>
                )
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

