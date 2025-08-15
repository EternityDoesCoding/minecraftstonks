import type { Item, TradeRequest, WebhookConfig } from "@/app/page"

export interface AdminDashboardProps {
  inventory: Item[]
  tradeRequests: TradeRequest[]
  webhookConfig: WebhookConfig
  onUpdateItem: (id: number, updates: Partial<Item>) => void
  onDeleteItem: (id: number) => void
  onUpdatePassword: (newPassword: string) => Promise<void>
  onClearTradeLog: () => void // Added onClearTradeLog prop
}
