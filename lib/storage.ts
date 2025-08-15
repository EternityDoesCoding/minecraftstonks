export interface Item {
  id: string
  name: string
  description: string
  category: string
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
  quantity: number
  image?: string
  createdAt: string
}

export interface TradeRequest {
  id: string
  itemId: string
  itemName: string
  quantityWanted: number
  discordUser: string
  offerMessage: string
  status: "pending" | "accepted" | "declined"
  createdAt: string
}

class LocalStorage {
  private getItems(): Item[] {
    if (typeof window === "undefined") return []
    const items = localStorage.getItem("minecraft-inventory-items")
    return items ? JSON.parse(items) : []
  }

  private setItems(items: Item[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem("minecraft-inventory-items", JSON.stringify(items))
  }

  private getTradeRequests(): TradeRequest[] {
    if (typeof window === "undefined") return []
    const requests = localStorage.getItem("minecraft-inventory-trades")
    return requests ? JSON.parse(requests) : []
  }

  private setTradeRequests(requests: TradeRequest[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem("minecraft-inventory-trades", JSON.stringify(requests))
  }

  // Item operations
  getAllItems(): Item[] {
    return this.getItems()
  }

  addItem(item: Omit<Item, "id" | "createdAt">): Item {
    const newItem: Item = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    const items = this.getItems()
    items.push(newItem)
    this.setItems(items)
    return newItem
  }

  updateItem(id: string, updates: Partial<Item>): Item | null {
    const items = this.getItems()
    const index = items.findIndex((item) => item.id === id)
    if (index === -1) return null

    items[index] = { ...items[index], ...updates }
    this.setItems(items)
    return items[index]
  }

  deleteItem(id: string): boolean {
    const items = this.getItems()
    const filteredItems = items.filter((item) => item.id !== id)
    if (filteredItems.length === items.length) return false

    this.setItems(filteredItems)
    return true
  }

  // Trade request operations
  getAllTradeRequests(): TradeRequest[] {
    return this.getTradeRequests()
  }

  addTradeRequest(request: Omit<TradeRequest, "id" | "createdAt" | "status">): TradeRequest {
    const newRequest: TradeRequest = {
      ...request,
      id: Date.now().toString(),
      status: "pending",
      createdAt: new Date().toISOString(),
    }
    const requests = this.getTradeRequests()
    requests.push(newRequest)
    this.setTradeRequests(requests)
    return newRequest
  }

  updateTradeRequest(id: string, updates: Partial<TradeRequest>): TradeRequest | null {
    const requests = this.getTradeRequests()
    const index = requests.findIndex((req) => req.id === id)
    if (index === -1) return null

    requests[index] = { ...requests[index], ...updates }
    this.setTradeRequests(requests)
    return requests[index]
  }

  deleteTradeRequest(id: string): boolean {
    const requests = this.getTradeRequests()
    const filteredRequests = requests.filter((req) => req.id !== id)
    if (filteredRequests.length === requests.length) return false

    this.setTradeRequests(filteredRequests)
    return true
  }
}

export const storage = new LocalStorage()
