import { neon } from "@neondatabase/serverless"

let useLocalStorage = false
let sql: any = null
let connectionInitialized = false

const initializeDatabase = () => {
  if (connectionInitialized) return

  const isServer =
    typeof process !== "undefined" &&
    process.env &&
    (process.env.NODE_ENV !== undefined || process.env.VERCEL !== undefined)

  console.log("[v0] Server environment detected:", isServer)
  console.log("[v0] NODE_ENV:", process.env?.NODE_ENV)
  console.log("[v0] VERCEL:", process.env?.VERCEL)

  if (!isServer) {
    console.log("[v0] Client-side detected, using localStorage")
    useLocalStorage = true
    connectionInitialized = true
    return
  }

  try {
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL
    console.log("[v0] Server-side database initialization...")
    console.log("[v0] Database URL available:", !!dbUrl)

    if (dbUrl) {
      sql = neon(dbUrl)
      useLocalStorage = false
      console.log("[v0] Database connection established successfully")
    } else {
      console.warn("[v0] No database URL found on server, falling back to localStorage")
      useLocalStorage = true
    }
  } catch (error) {
    console.warn("[v0] Database connection failed, falling back to localStorage:", error)
    useLocalStorage = true
  }

  connectionInitialized = true
}

const ensureWebhookConfigTable = async () => {
  if (!sql) return
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS webhook_config (
        id SERIAL PRIMARY KEY,
        webhook_url TEXT DEFAULT '',
        enabled BOOLEAN DEFAULT false,
        events JSONB DEFAULT '{"newTrade": true, "tradeAccepted": true, "tradeDeclined": true, "newItem": true}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("[v0] Webhook config table ensured")
  } catch (error) {
    console.error("[v0] Failed to create webhook_config table:", error)
  }
}

const ensureAdminConfigTable = async () => {
  if (!sql) return
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS admin_config (
        id SERIAL PRIMARY KEY,
        password TEXT DEFAULT 'Flugel',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    // Insert default password if table is empty
    await sql`
      INSERT INTO admin_config (password) 
      SELECT 'Flugel' 
      WHERE NOT EXISTS (SELECT 1 FROM admin_config)
    `
    console.log("[v0] Admin config table ensured")
  } catch (error) {
    console.error("[v0] Failed to create admin_config table:", error)
  }
}

const getDatabaseUrl = () => {
  if (typeof window !== "undefined") return null
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL
  return url
}

const getFromStorage = (key: string) => {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

const saveToStorage = (key: string, data: any) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error("[v0] Failed to save to localStorage:", error)
  }
}

export interface Item {
  id: number
  name: string
  description: string
  category: string
  rarity: string
  quantity: number
  image_url?: string
  created_at: string
  updated_at: string
}

export interface TradeRequest {
  id: number
  item_id: number
  discord_user: string
  quantity_wanted: number
  offer_message: string
  status: "pending" | "accepted" | "declined"
  created_at: string
  item?: Item
}

export interface WebhookConfig {
  url: string
  enabled: boolean
  events: {
    newTrade: boolean
    tradeAccepted: boolean
    tradeDeclined: boolean
    newItem: boolean
  }
}

export async function getItems(): Promise<Item[]> {
  initializeDatabase()

  const isServer =
    typeof process !== "undefined" &&
    process.env &&
    (process.env.NODE_ENV !== undefined || process.env.VERCEL !== undefined)

  if (!isServer || useLocalStorage) {
    return getFromStorage("minecraft-items")
  }

  try {
    console.log("[v0] Executing database query: SELECT * FROM items ORDER BY created_at DESC")
    const items = await sql`
      SELECT 
        id,
        name,
        description,
        category,
        rarity,
        quantity,
        COALESCE(image_url, '') as image_url,
        created_at,
        updated_at
      FROM items 
      ORDER BY created_at DESC
    `
    console.log("[v0] Raw database query returned", items.length, "items")
    console.log("[v0] Item IDs returned:", items.map((item) => `${item.id}:${item.name}`).join(", "))

    const countResult = await sql`SELECT COUNT(*) as total FROM items`
    console.log("[v0] Total items in database:", countResult[0].total)

    console.log("[v0] Successfully retrieved", items.length, "items from database")
    return items as Item[]
  } catch (error) {
    console.error("[v0] Database error, falling back to localStorage:", error)
    return getFromStorage("minecraft-items")
  }
}

export async function createItem(item: Omit<Item, "id" | "created_at" | "updated_at">): Promise<Item> {
  initializeDatabase()

  const isServer =
    typeof process !== "undefined" &&
    process.env &&
    (process.env.NODE_ENV !== undefined || process.env.VERCEL !== undefined)
  const newItem: Item = {
    ...item,
    id: Date.now(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  if (!isServer || useLocalStorage) {
    const items = getFromStorage("minecraft-items")
    items.unshift(newItem)
    saveToStorage("minecraft-items", items)
    return newItem
  }

  try {
    console.log("[v0] Creating item with data:", { name: item.name, hasImageUrl: !!item.image_url })
    const [dbItem] = await sql`
      INSERT INTO items (name, description, category, rarity, quantity, image_url)
      VALUES (${item.name}, ${item.description}, ${item.category}, ${item.rarity}, ${item.quantity}, ${item.image_url})
      RETURNING *
    `
    console.log("[v0] Successfully created item in database:", dbItem.name, "with id:", dbItem.id)

    const verification = await sql`SELECT COUNT(*) as count FROM items WHERE id = ${dbItem.id}`
    console.log("[v0] Verification - Item exists in database:", verification[0].count > 0)

    return dbItem as Item
  } catch (error) {
    console.error("[v0] Database error, saving to localStorage:", error)
    const items = getFromStorage("minecraft-items")
    items.unshift(newItem)
    saveToStorage("minecraft-items", items)
    return newItem
  }
}

export async function updateItem(
  id: number,
  updates: Partial<Omit<Item, "id" | "created_at" | "updated_at">>,
): Promise<Item> {
  initializeDatabase()

  const isServer =
    typeof process !== "undefined" &&
    process.env &&
    (process.env.NODE_ENV !== undefined || process.env.VERCEL !== undefined)
  const newItem: Item = {
    ...updates,
    updated_at: new Date().toISOString(),
  }

  if (!isServer || useLocalStorage) {
    const items = getFromStorage("minecraft-items")
    const index = items.findIndex((item: Item) => item.id === id)
    if (index !== -1) {
      items[index] = { ...items[index], ...newItem }
      saveToStorage("minecraft-items", items)
      return items[index]
    }
    throw new Error("Item not found")
  }

  try {
    const [updatedItem] = await sql`
      UPDATE items 
      SET 
        name = COALESCE(${updates.name}, name),
        description = COALESCE(${updates.description}, description),
        category = COALESCE(${updates.category}, category),
        rarity = COALESCE(${updates.rarity}, rarity),
        quantity = COALESCE(${updates.quantity}, quantity),
        image_url = COALESCE(${updates.image_url}, image_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return updatedItem as Item
  } catch (error) {
    console.error("[v0] Database error, updating in localStorage:", error)
    const items = getFromStorage("minecraft-items")
    const index = items.findIndex((item: Item) => item.id === id)
    if (index !== -1) {
      items[index] = { ...items[index], ...newItem }
      saveToStorage("minecraft-items", items)
      return items[index]
    }
    throw new Error("Item not found")
  }
}

export async function deleteItem(id: number): Promise<void> {
  initializeDatabase()

  const isServer =
    typeof process !== "undefined" &&
    process.env &&
    (process.env.NODE_ENV !== undefined || process.env.VERCEL !== undefined)

  if (!isServer || useLocalStorage) {
    const items = getFromStorage("minecraft-items")
    const filtered = items.filter((item: Item) => item.id !== id)
    saveToStorage("minecraft-items", filtered)
    return
  }

  try {
    await sql`DELETE FROM items WHERE id = ${id}`
  } catch (error) {
    console.error("[v0] Database error, deleting from localStorage:", error)
    const items = getFromStorage("minecraft-items")
    const filtered = items.filter((item: Item) => item.id !== id)
    saveToStorage("minecraft-items", filtered)
  }
}

export async function getTradeRequests(): Promise<TradeRequest[]> {
  initializeDatabase()

  const isServer =
    typeof process !== "undefined" &&
    process.env &&
    (process.env.NODE_ENV !== undefined || process.env.VERCEL !== undefined)

  if (!isServer || useLocalStorage) {
    const requests = getFromStorage("minecraft-trade-requests")
    const items = getFromStorage("minecraft-items")
    return requests.map((req: TradeRequest) => ({
      ...req,
      item: items.find((item: Item) => item.id === req.item_id),
    }))
  }

  try {
    const requests = await sql`
      SELECT 
        tr.*,
        json_build_object(
          'id', i.id,
          'name', i.name,
          'description', i.description,
          'category', i.category,
          'rarity', i.rarity,
          'quantity', i.quantity,
          'image_url', i.image_url
        ) as item
      FROM trade_requests tr
      JOIN items i ON tr.item_id = i.id
      ORDER BY tr.created_at DESC
    `
    console.log("[v0] Successfully retrieved", requests.length, "trade requests from database")
    return requests as TradeRequest[]
  } catch (error) {
    console.error("[v0] Database error, falling back to localStorage:", error)
    const requests = getFromStorage("minecraft-trade-requests")
    const items = getFromStorage("minecraft-items")
    return requests.map((req: TradeRequest) => ({
      ...req,
      item: items.find((item: Item) => item.id === req.item_id),
    }))
  }
}

export async function createTradeRequest(
  request: Omit<TradeRequest, "id" | "created_at" | "item">,
): Promise<TradeRequest> {
  initializeDatabase()

  const isServer =
    typeof process !== "undefined" &&
    process.env &&
    (process.env.NODE_ENV !== undefined || process.env.VERCEL !== undefined)
  const newRequest: TradeRequest = {
    ...request,
    id: Date.now(),
    created_at: new Date().toISOString(),
  }

  if (!isServer || useLocalStorage) {
    const requests = getFromStorage("minecraft-trade-requests")
    requests.unshift(newRequest)
    saveToStorage("minecraft-trade-requests", requests)
    return newRequest
  }

  try {
    const [dbRequest] = await sql`
      INSERT INTO trade_requests (item_id, discord_user, quantity_wanted, offer_message, status)
      VALUES (${request.item_id}, ${request.discord_user}, ${request.quantity_wanted}, ${request.offer_message}, ${request.status})
      RETURNING *
    `
    console.log("[v0] Successfully created trade request in database")
    return dbRequest as TradeRequest
  } catch (error) {
    console.error("[v0] Database error, saving to localStorage:", error)
    const requests = getFromStorage("minecraft-trade-requests")
    requests.unshift(newRequest)
    saveToStorage("minecraft-trade-requests", requests)
    return newRequest
  }
}

export async function updateTradeRequestStatus(id: number, status: "accepted" | "declined"): Promise<TradeRequest> {
  initializeDatabase()

  const isServer =
    typeof process !== "undefined" &&
    process.env &&
    (process.env.NODE_ENV !== undefined || process.env.VERCEL !== undefined)
  const newRequest: TradeRequest = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (!isServer || useLocalStorage) {
    const requests = getFromStorage("minecraft-trade-requests")
    const items = getFromStorage("minecraft-items")
    const index = requests.findIndex((req: TradeRequest) => req.id === id)
    if (index !== -1) {
      requests[index] = { ...requests[index], ...newRequest }
      saveToStorage("minecraft-trade-requests", requests)
      return {
        ...requests[index],
        item: items.find((item: Item) => item.id === requests[index].item_id),
      }
    }
    throw new Error("Trade request not found")
  }

  try {
    const [updatedRequest] = await sql`
      UPDATE trade_requests 
      SET status = ${status}
      FROM items
      WHERE trade_requests.id = ${id} AND items.id = trade_requests.item_id
      RETURNING 
        trade_requests.*,
        json_build_object(
          'id', items.id,
          'name', items.name,
          'description', items.description,
          'category', items.category,
          'rarity', items.rarity,
          'quantity', items.quantity,
          'image_url', items.image_url
        ) as item
    `
    return updatedRequest as TradeRequest
  } catch (error) {
    console.error("[v0] Database error, updating in localStorage:", error)
    const requests = getFromStorage("minecraft-trade-requests")
    const items = getFromStorage("minecraft-items")
    const index = requests.findIndex((req: TradeRequest) => req.id === id)
    if (index !== -1) {
      requests[index] = { ...requests[index], ...newRequest }
      saveToStorage("minecraft-trade-requests", requests)
      return {
        ...requests[index],
        item: items.find((item: Item) => item.id === requests[index].item_id),
      }
    }
    throw new Error("Trade request not found")
  }
}

export async function getWebhookConfig(): Promise<WebhookConfig> {
  initializeDatabase()

  const defaultConfig: WebhookConfig = {
    url: "",
    enabled: false,
    events: {
      newTrade: true,
      tradeAccepted: true,
      tradeDeclined: true,
      newItem: true,
    },
  }

  const isServer =
    typeof process !== "undefined" &&
    process.env &&
    (process.env.NODE_ENV !== undefined || process.env.VERCEL !== undefined)

  if (!isServer || useLocalStorage) {
    const config = getFromStorage("minecraft-webhook-config")
    return config.length > 0 ? config[0] : defaultConfig
  }

  try {
    await ensureWebhookConfigTable()

    const [config] = await sql`
      SELECT * FROM webhook_config 
      ORDER BY updated_at DESC 
      LIMIT 1
    `
    console.log("[v0] Successfully retrieved webhook config from database")
    return config
      ? {
          url: config.webhook_url,
          enabled: config.enabled,
          events: config.events,
        }
      : defaultConfig
  } catch (error) {
    console.error("[v0] Database error, falling back to localStorage:", error)
    const config = getFromStorage("minecraft-webhook-config")
    return config.length > 0 ? config[0] : defaultConfig
  }
}

export async function saveWebhookConfig(config: WebhookConfig): Promise<WebhookConfig> {
  initializeDatabase()

  const isServer =
    typeof process !== "undefined" &&
    process.env &&
    (process.env.NODE_ENV !== undefined || process.env.VERCEL !== undefined)

  if (!isServer || useLocalStorage) {
    saveToStorage("minecraft-webhook-config", [config])
    return config
  }

  try {
    await ensureWebhookConfigTable()

    const [savedConfig] = await sql`
      INSERT INTO webhook_config (webhook_url, enabled, events, updated_at)
      VALUES (${config.url}, ${config.enabled}, ${JSON.stringify(config.events)}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        webhook_url = EXCLUDED.webhook_url,
        enabled = EXCLUDED.enabled,
        events = EXCLUDED.events,
        updated_at = EXCLUDED.updated_at
      RETURNING *
    `
    return {
      url: savedConfig.webhook_url,
      enabled: savedConfig.enabled,
      events: savedConfig.events,
    }
  } catch (error) {
    console.error("[v0] Database error, saving to localStorage:", error)
    saveToStorage("minecraft-webhook-config", [config])
    return config
  }
}

export async function getAdminPassword(): Promise<string> {
  initializeDatabase()

  const defaultPassword = "Flugel"

  const isServer =
    typeof process !== "undefined" &&
    process.env &&
    (process.env.NODE_ENV !== undefined || process.env.VERCEL !== undefined)

  if (!isServer || useLocalStorage) {
    const password = getFromStorage("minecraft-admin-password")
    return password.length > 0 ? password[0] : defaultPassword
  }

  try {
    await ensureAdminConfigTable()

    const [config] = await sql`
      SELECT password FROM admin_config 
      ORDER BY updated_at DESC 
      LIMIT 1
    `
    return config ? config.password : defaultPassword
  } catch (error) {
    console.error("[v0] Database error, falling back to localStorage:", error)
    const password = getFromStorage("minecraft-admin-password")
    return password.length > 0 ? password[0] : defaultPassword
  }
}

export async function saveAdminPassword(password: string): Promise<void> {
  initializeDatabase()

  const isServer =
    typeof process !== "undefined" &&
    process.env &&
    (process.env.NODE_ENV !== undefined || process.env.VERCEL !== undefined)

  if (!isServer || useLocalStorage) {
    saveToStorage("minecraft-admin-password", [password])
    return
  }

  try {
    await ensureAdminConfigTable()

    await sql`
      INSERT INTO admin_config (password, updated_at)
      VALUES (${password}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        password = EXCLUDED.password,
        updated_at = EXCLUDED.updated_at
    `
  } catch (error) {
    console.error("[v0] Database error, saving to localStorage:", error)
    saveToStorage("minecraft-admin-password", [password])
  }
}

export async function clearTradeRequests(): Promise<void> {
  initializeDatabase()

  const isServer =
    typeof process !== "undefined" &&
    process.env &&
    (process.env.NODE_ENV !== undefined || process.env.VERCEL !== undefined)

  if (!isServer || useLocalStorage) {
    saveToStorage("minecraft-trade-requests", [])
    return
  }

  try {
    await sql`DELETE FROM trade_requests`
    console.log("[v0] Successfully cleared all trade requests from database")
  } catch (error) {
    console.error("[v0] Database error, clearing localStorage:", error)
    saveToStorage("minecraft-trade-requests", [])
  }
}
