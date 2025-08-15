"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { TradeRequest } from "@/lib/database"

interface TradeNotificationsProps {
  tradeRequests: TradeRequest[]
}

export function TradeNotifications({ tradeRequests }: TradeNotificationsProps) {
  const [notifications, setNotifications] = useState<
    Array<{
      id: number
      message: string
      time: string
      type: "new" | "accepted" | "declined"
    }>
  >([])

  useEffect(() => {
    const newNotifications = tradeRequests
      .filter((request) => request.status === "pending") // Only show pending requests as "new"
      .slice(0, 10) // Limit to 10 most recent
      .map((request) => ({
        id: request.id,
        message: `${request.discordUser} (${request.playerName}) wants ${request.requestedItem?.quantity || 0}x ${request.requestedItem?.name || "Unknown Item"}`,
        time: formatTimeAgo(request.created_at),
        type: "new" as const,
      }))

    setNotifications(newNotifications)
  }, [tradeRequests])

  const formatTimeAgo = (dateString: string | Date | undefined): string => {
    if (!dateString) return "Unknown time"

    try {
      const date = typeof dateString === "string" ? new Date(dateString) : dateString
      if (isNaN(date.getTime())) return "Unknown time"

      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

      if (diffInSeconds < 60) return "Just now"
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`
      return `${Math.floor(diffInSeconds / 86400)} days ago`
    } catch (error) {
      return "Unknown time"
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative bg-transparent">
          <Bell className="w-4 h-4" />
          {notifications.length > 0 && (
            <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-secondary">
              {notifications.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-card/95 backdrop-blur-sm border-2 border-border">
        <div className="space-y-2">
          <h4 className="font-medium">Trade Notifications</h4>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending trade requests</p>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="p-2 bg-secondary/10 rounded border">
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-muted-foreground">{notification.time}</p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
