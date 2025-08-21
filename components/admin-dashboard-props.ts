import type { Item, TradeRequest, WebhookConfig } from "@/app/page"
import type { Nation } from "@/lib/database"

export interface AdminDashboardProps {
  inventory: Item[]
  tradeRequests: TradeRequest[]
  webhookConfig: WebhookConfig
  onUpdateItem: (id: number, updates: Partial<Item>) => void
  onDeleteItem: (id: number) => void
  onUpdatePassword: (newPassword: string) => Promise<void>
  onClearTradeLog: () => void // Added onClearTradeLog prop
  nations: Nation[]
  onCreateNation: (nation: Omit<Nation, "id" | "created_at" | "updated_at">) => Promise<void>
  onUpdateNation: (id: number, updates: Partial<Omit<Nation, "id" | "created_at" | "updated_at">>) => Promise<void>
  onDeleteNation: (id: number) => Promise<void>
}
