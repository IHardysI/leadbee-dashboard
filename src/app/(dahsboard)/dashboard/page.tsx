import { ClientActivityChart } from "@/components/features/dashboard/components/client-activity-chart"
import { StatsList } from "@/components/features/dashboard/components/stats-list"

// Mock data
const statsData = [
  { title: "Клиент LeadBee", count: 7012 },
  { title: "Маркетинг, SMM, SEO", count: 226 },
  { title: "HR услуги", count: 133 },
  { title: "ИТ разработка, разработка сайтов, приложений", count: 97 },
  { title: "Услуги иммиграции, иммиграция за инвестиции", count: 45 },
  { title: "Услуги бухучета, налоговых консультаций и аудита", count: 32 },
  { title: "Дизайн, логотипы, баннеры, постеры", count: 28 },
]

const activityData = [
  { name: "Написали боты", value: 450 },
  { name: "Ответили ботам", value: 280 },
  { name: "Получили ссылку", value: 120 },
  { name: "Зарегистрировано", value: 180 },
  { name: "Написали менеджеру", value: 90 },
  { name: "Ответили менеджеру", value: 60 },
  { name: "Взяты в работу", value: 30 },
]

export default function DashboardPage() {
  return (
    <div className="">
      <div className="grid gap-8 md:grid-cols-2">
        <StatsList items={statsData} />
        <ClientActivityChart data={activityData} />
      </div>
    </div>
  )
}

