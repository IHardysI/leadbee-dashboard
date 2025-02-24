import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface StatsItem {
  title: string
  count: number
}

interface StatsListProps {
  items: StatsItem[]
}

export function StatsList({ items }: StatsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Список найденых сообщений по категориях</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-0.5">
            {items.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm font-medium">{item.title}</span>
                <Badge variant="secondary" className="font-mono">
                  {item.count.toLocaleString()}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

