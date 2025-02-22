import { CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function EmailVerified() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-sm w-full bg-white rounded-lg shadow-md">
        <CardContent className="p-6 space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-cYellow rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-center text-gray-800">Электронная почта подтверждена</h2>
          <Button
            asChild
            className="w-full bg-cYelllow/90 hover:bg-cYelllow text-white transition-colors duration-300"
          >
            <Link href="/">Вернуться на главную</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

