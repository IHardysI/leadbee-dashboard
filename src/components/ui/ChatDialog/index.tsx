import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChatMessage {
  id: string
  content: string
  timestamp: string
  isBot: boolean
}

interface ChatDialogProps {
  username: string
  userId: string
  role: string
  messages: ChatMessage[]
}

export function ChatDialog({ username, userId, role, messages }: ChatDialogProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex flex-col h-[500px]">
      <div className="px-4 py-3 border-b flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={`https://avatar.vercel.sh/${username}`} />
          <AvatarFallback>{username[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium">{username}</span>
            <Badge variant="outline" className="text-xs">
              ID: {userId}
            </Badge>
          </div>
          <Badge
            variant="secondary"
            className={role === "manager" ? "bg-teal-100 text-teal-800" : "bg-pink-100 text-pink-800"}
          >
            {role === "manager" ? "Менеджер" : "Продавец"}
          </Badge>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        {" "}
        {/* Updated to take full remaining space */}
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
              <div className={`flex flex-col gap-1 max-w-[80%] ${message.isBot ? "items-start" : "items-end"}`}>
                <div
                  className={`rounded-lg px-3 py-2 ${
                    message.isBot ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {message.content}
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(message.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

