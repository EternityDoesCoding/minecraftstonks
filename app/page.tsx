"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Package, Settings, Upload, Users, Webhook, Lock } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import { InventoryGrid } from "@/components/inventory-grid"
import { TradeNotifications } from "@/components/trade-notifications"
import { ItemUploadForm } from "@/components/item-upload-form"
import { PublicTradingInterface } from "@/components/public-trading-interface"
import { TradeManagement } from "@/components/trade-management"
import { AdminDashboard } from "@/components/admin-dashboard"
import { WebhookSettings } from "@/components/webhook-settings"
import { WebhookService } from "@/lib/webhook-service"
import {
  fetchItems,
  createItemAPI,
  updateItemAPI,
  deleteItemAPI,
  fetchTrades,
  createTradeAPI,
  updateTradeAPI,
  clearTradesAPI,
  fetchWebhookConfig,
  saveWebhookConfigAPI,
  fetchAdminPassword,
  saveAdminPasswordAPI,
} from "@/lib/api-client"
import type { Item, WebhookConfig } from "@/lib/database"

export interface TradeOffer {
  id: number
  fromPlayer: string
  toPlayer: string
  offeredItems: Item[]
  requestedItems: Item[]
  message: string
  status: "pending" | "accepted" | "declined"
  createdAt: Date
}

export type { WebhookConfig }

export default function MinecraftDashboard() {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [activeTab, setActiveTab] = useState("public")
  const [adminPassword, setAdminPassword] = useState("Flugel")

  const [inventory, setInventory] = useState<Item[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(true)
  const [isLoadingRequests, setIsLoadingRequests] = useState(true)

  const [tradeRequests, setTradeRequests] = useState<any[]>([])

  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
    url: "",
    enabled: false,
    events: {
      newTrade: true,
      tradeAccepted: true,
      tradeDeclined: false,
      newItem: false,
    },
  })

  const [webhookService, setWebhookService] = useState<WebhookService | null>(null)

  useEffect(() => {
    const loadWebhookConfig = async () => {
      try {
        console.log(`[v0] Session ${sessionId}: Loading webhook config`)
        const [config, passwordData] = await Promise.all([fetchWebhookConfig(), fetchAdminPassword()])
        setWebhookConfig(config)
        setAdminPassword(passwordData.password)
        console.log(`[v0] Session ${sessionId}: Config loaded successfully`)
      } catch (error) {
        console.error(`[v0] Session ${sessionId}: Failed to load config:`, error)
      }
    }

    loadWebhookConfig()
  }, [sessionId])

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log(`[v0] Session ${sessionId}: Loading data`)
        setIsLoadingItems(true)
        setIsLoadingRequests(true)

        const [items, requests] = await Promise.all([fetchItems(), fetchTrades()])

        setInventory(items)

        const transformedRequests = requests.map((req) => ({
          id: req.id,
          playerName: req.discord_user,
          discordUser: req.discord_user,
          requestedItem: req.item || {
            id: req.item_id,
            name: "Unknown Item",
            description: "",
            quantity: 1,
            rarity: "common",
            category: "resource",
            imageUrl: "",
          },
          requestedQuantity: req.quantity_wanted,
          offerMessage: req.offer_message,
          status: req.status,
          createdAt: req.created_at,
        }))
        setTradeRequests(transformedRequests)
        console.log(`[v0] Session ${sessionId}: Data loaded successfully`)
      } catch (error) {
        console.error(`[v0] Session ${sessionId}: Failed to load data:`, error)
      } finally {
        setIsLoadingItems(false)
        setIsLoadingRequests(false)
      }
    }

    loadData()
  }, [sessionId])

  useEffect(() => {
    setWebhookService(new WebhookService(webhookConfig))
  }, [webhookConfig])

  const addItem = async (item: Omit<Item, "id" | "created_at" | "updated_at">) => {
    try {
      console.log(`[v0] Session ${sessionId}: Adding item`)
      const newItem = await createItemAPI(item)
      setInventory((prev) => [newItem, ...prev])

      if (webhookService) {
        await webhookService.sendNotification("newItem", newItem)
      }
      console.log(`[v0] Session ${sessionId}: Item added successfully`)
    } catch (error) {
      console.error(`[v0] Session ${sessionId}: Failed to add item:`, error)
    }
  }

  const updateItem = async (id: number, updates: Partial<Item>) => {
    try {
      console.log(`[v0] Session ${sessionId}: Updating item ${id}`)
      const updatedItem = await updateItemAPI(id, updates)
      setInventory((prev) => prev.map((item) => (item.id === id ? updatedItem : item)))
      console.log(`[v0] Session ${sessionId}: Item updated successfully`)
    } catch (error) {
      console.error(`[v0] Session ${sessionId}: Failed to update item:`, error)
    }
  }

  const deleteItem = async (id: number) => {
    try {
      console.log(`[v0] Session ${sessionId}: Deleting item ${id}`)
      await deleteItemAPI(id)
      setInventory((prev) => prev.filter((item) => item.id !== id))
      console.log(`[v0] Session ${sessionId}: Item deleted successfully`)
    } catch (error) {
      console.error(`[v0] Session ${sessionId}: Failed to delete item:`, error)
    }
  }

  const addTradeRequest = async (request: any) => {
    try {
      console.log(`[v0] Session ${sessionId}: Adding trade request with data:`, request)

      const dbRequest = {
        item_id: request.requestedItem.id,
        discord_user: request.discordUser,
        quantity_wanted: request.requestedQuantity,
        offer_message: request.offerMessage,
        status: request.status as "pending" | "accepted" | "declined",
      }

      const newRequest = await createTradeAPI(dbRequest)

      const requests = await fetchTrades()
      const transformedRequests = requests.map((req) => ({
        id: req.id,
        playerName: req.discord_user,
        discordUser: req.discord_user,
        requestedItem: req.item || {
          id: req.item_id,
          name: "Unknown Item",
          description: "",
          quantity: 1,
          rarity: "common",
          category: "resource",
          imageUrl: "",
        },
        requestedQuantity: req.quantity_wanted,
        offerMessage: req.offer_message,
        status: req.status,
        createdAt: req.created_at,
      }))
      setTradeRequests(transformedRequests)

      const appFormatRequest = {
        id: newRequest.id,
        playerName: request.playerName,
        discordUser: newRequest.discord_user,
        requestedItem: request.requestedItem,
        requestedQuantity: newRequest.quantity_wanted,
        offerMessage: newRequest.offer_message,
        status: newRequest.status,
        createdAt: newRequest.created_at,
      }

      if (webhookService) {
        console.log(`[v0] Session ${sessionId}: Sending webhook notification with data:`, appFormatRequest)
        await webhookService.sendNotification("newTrade", appFormatRequest)
      }
      console.log(`[v0] Session ${sessionId}: Trade request added successfully`)
    } catch (error) {
      console.error(`[v0] Session ${sessionId}: Failed to add trade request:`, error)
    }
  }

  const updateTradeRequest = async (id: number, updates: { status: "accepted" | "declined" }) => {
    try {
      console.log(`[v0] Session ${sessionId}: Updating trade request ${id} to ${updates.status}`)
      const updatedRequest = await updateTradeAPI(id, updates.status)

      const [requests, items] = await Promise.all([fetchTrades(), fetchItems()])

      const transformedRequests = requests.map((req) => ({
        id: req.id,
        playerName: req.discord_user,
        discordUser: req.discord_user,
        requestedItem: req.item || {
          id: req.item_id,
          name: "Unknown Item",
          description: "",
          quantity: 1,
          rarity: "common",
          category: "resource",
          imageUrl: "",
        },
        requestedQuantity: req.quantity_wanted,
        offerMessage: req.offer_message,
        status: req.status,
        createdAt: req.created_at,
      }))
      setTradeRequests(transformedRequests)
      setInventory(items)

      if (updates.status === "declined" && updatedRequest && webhookService) {
        const appFormatRequest = {
          id: updatedRequest.id,
          playerName: updatedRequest.discord_user,
          discordUser: updatedRequest.discord_user,
          requestedItem: updatedRequest.item || {
            id: updatedRequest.item_id,
            name: "Unknown Item",
            description: "",
            quantity: 1,
            rarity: "common",
            category: "resource",
            imageUrl: "",
          },
          requestedQuantity: updatedRequest.quantity_wanted,
          offerMessage: updatedRequest.offer_message,
          status: updatedRequest.status,
          createdAt: updatedRequest.created_at,
        }

        console.log(`[v0] Session ${sessionId}: Sending decline webhook notification`)
        await webhookService.sendNotification("tradeDeclined", appFormatRequest)
      }

      if (updates.status === "accepted" && updatedRequest) {
        console.log(`[v0] Session ${sessionId}: Trade accepted - processing inventory update`)
        console.log(`[v0] Session ${sessionId}: Updated request data:`, updatedRequest)

        const requestedItem = updatedRequest.item
        const requestedQuantity = updatedRequest.quantity_wanted || 1

        console.log(`[v0] Session ${sessionId}: Requested item:`, requestedItem)
        console.log(`[v0] Session ${sessionId}: Requested quantity:`, requestedQuantity)
        console.log(
          `[v0] Session ${sessionId}: Current inventory:`,
          inventory.map((item) => ({ id: item.id, name: item.name, quantity: item.quantity })),
        )

        if (requestedItem) {
          const inventoryItem = inventory.find((item) => item.name.toLowerCase() === requestedItem.name.toLowerCase())

          console.log(`[v0] Session ${sessionId}: Found inventory item:`, inventoryItem)

          if (inventoryItem && inventoryItem.quantity >= requestedQuantity) {
            const newQuantity = inventoryItem.quantity - requestedQuantity
            console.log(`[v0] Session ${sessionId}: Updating quantity from`, inventoryItem.quantity, "to", newQuantity)

            if (newQuantity <= 0) {
              console.log(`[v0] Session ${sessionId}: Deleting item completely (quantity would be 0 or less)`)
              await deleteItemAPI(inventoryItem.id)
              setInventory((prev) => prev.filter((item) => item.id !== inventoryItem.id))
            } else {
              console.log(`[v0] Session ${sessionId}: Updating item quantity to`, newQuantity)
              await updateItemAPI(inventoryItem.id, { quantity: newQuantity })
              setInventory((prev) =>
                prev.map((item) => (item.id === inventoryItem.id ? { ...item, quantity: newQuantity } : item)),
              )
            }
          } else {
            console.log(`[v0] Session ${sessionId}: Cannot update inventory - item not found or insufficient quantity`)
            console.log(`[v0] Session ${sessionId}: Item found:`, !!inventoryItem)
            console.log(
              `[v0] Session ${sessionId}: Has sufficient quantity:`,
              inventoryItem ? inventoryItem.quantity >= requestedQuantity : false,
            )
          }
        } else {
          console.log(`[v0] Session ${sessionId}: No requested item data in updated request`)
        }

        if (webhookService) {
          const appFormatRequest = {
            id: updatedRequest.id,
            playerName: updatedRequest.discord_user,
            discordUser: updatedRequest.discord_user,
            requestedItem: updatedRequest.item || {
              id: updatedRequest.item_id,
              name: "Unknown Item",
              description: "",
              quantity: 1,
              rarity: "common",
              category: "resource",
              imageUrl: "",
            },
            requestedQuantity: updatedRequest.quantity_wanted,
            offerMessage: updatedRequest.offer_message,
            status: updatedRequest.status,
            createdAt: updatedRequest.created_at,
          }

          console.log(`[v0] Session ${sessionId}: Sending accept webhook notification`)
          await webhookService.sendNotification("tradeAccepted", appFormatRequest)
        }
      }
      console.log(`[v0] Session ${sessionId}: Trade request updated successfully`)
    } catch (error) {
      console.error(`[v0] Session ${sessionId}: Failed to update trade request:`, error)
    }
  }

  const handleWebhookConfigUpdate = async (config: WebhookConfig) => {
    try {
      await saveWebhookConfigAPI(config)
      setWebhookConfig(config)
    } catch (error) {
      console.error("Failed to save webhook config:", error)
      setWebhookConfig(config)
    }
  }

  const updateAdminPassword = async (newPassword: string) => {
    try {
      await saveAdminPasswordAPI(newPassword)
      setAdminPassword(newPassword)
    } catch (error) {
      console.error("Failed to update admin password:", error)
    }
  }

  const clearTradeRequests = async () => {
    try {
      await clearTradesAPI()
      setTradeRequests([])
    } catch (error) {
      console.error("Failed to clear trade requests:", error)
    }
  }

  const refreshTrades = async () => {
    try {
      console.log(`[v0] Session ${sessionId}: Refreshing trade requests`)
      setIsLoadingRequests(true)
      const requests = await fetchTrades()
      const transformedRequests = requests.map((req) => ({
        id: req.id,
        playerName: req.discord_user,
        discordUser: req.discord_user,
        requestedItem: req.item || {
          id: req.item_id,
          name: "Unknown Item",
          description: "",
          quantity: 1,
          rarity: "common",
          category: "resource",
          imageUrl: "",
        },
        requestedQuantity: req.quantity_wanted,
        offerMessage: req.offer_message,
        status: req.status,
        createdAt: req.created_at,
      }))
      setTradeRequests(transformedRequests)
      console.log(`[v0] Session ${sessionId}: Trade requests refreshed successfully`)
    } catch (error) {
      console.error(`[v0] Session ${sessionId}: Failed to refresh trade requests:`, error)
    } finally {
      setIsLoadingRequests(false)
    }
  }

  if (showAdminLogin && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-xs text-muted-foreground mb-4 text-center">Session: {sessionId.slice(-8)}</div>
          <LoginForm onLogin={() => setIsAuthenticated(true)} currentPassword={adminPassword} />
          <Button variant="ghost" onClick={() => setShowAdminLogin(false)} className="w-full mt-4">
            Back to Public View
          </Button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 border-2 border-border shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Minecraft Trading Post</h1>
                  <p className="text-muted-foreground mt-2">Browse available items and make trade requests</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdminLogin(true)}
                  className="minecraft-button flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Admin
                </Button>
              </div>
            </div>
          </header>

          {isLoadingItems ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading items...</div>
            </div>
          ) : (
            <PublicTradingInterface items={inventory} onTradeRequest={addTradeRequest} />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 border-2 border-border shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Minecraft Inventory Dashboard</h1>
                <p className="text-muted-foreground mt-2">Manage your trades and get Discord notifications</p>
              </div>
              <div className="flex items-center gap-4">
                <TradeNotifications tradeRequests={tradeRequests} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAuthenticated(false)}
                  className="minecraft-button"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-card/80 backdrop-blur-sm border-2 border-border">
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="public" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Public
            </TabsTrigger>
            <TabsTrigger value="trades" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Trades
            </TabsTrigger>
            <TabsTrigger value="webhook" className="flex items-center gap-2">
              <Webhook className="w-4 h-4" />
              Webhook
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            {isLoadingItems ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading inventory...</div>
              </div>
            ) : (
              <InventoryGrid items={inventory} onUpdateItem={updateItem} onDeleteItem={deleteItem} />
            )}
          </TabsContent>

          <TabsContent value="upload">
            <ItemUploadForm onAddItem={addItem} />
          </TabsContent>

          <TabsContent value="public">
            {isLoadingItems ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading items...</div>
              </div>
            ) : (
              <PublicTradingInterface items={inventory} onTradeRequest={addTradeRequest} />
            )}
          </TabsContent>

          <TabsContent value="trades">
            {isLoadingRequests ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading trade requests...</div>
              </div>
            ) : (
              <TradeManagement
                tradeRequests={tradeRequests}
                onUpdateTradeRequest={updateTradeRequest}
                onRefreshTrades={refreshTrades}
              />
            )}
          </TabsContent>

          <TabsContent value="webhook">
            <WebhookSettings config={webhookConfig} onUpdateConfig={handleWebhookConfigUpdate} />
          </TabsContent>

          <TabsContent value="settings">
            <AdminDashboard
              inventory={inventory}
              tradeRequests={tradeRequests}
              webhookConfig={webhookConfig}
              onUpdateItem={updateItem}
              onDeleteItem={deleteItem}
              onUpdatePassword={updateAdminPassword}
              onClearTradeRequests={clearTradeRequests}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
