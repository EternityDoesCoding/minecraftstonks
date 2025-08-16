// Client-side API functions to replace direct database calls

export async function fetchItems() {
  const response = await fetch("/api/items")
  if (!response.ok) throw new Error("Failed to fetch items")
  return response.json()
}

export async function createItemAPI(item: any) {
  const response = await fetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  })
  if (!response.ok) throw new Error("Failed to create item")
  return response.json()
}

export async function updateItemAPI(id: number, updates: any) {
  const response = await fetch("/api/items", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...updates }),
  })
  if (!response.ok) throw new Error("Failed to update item")
  return response.json()
}

export async function deleteItemAPI(id: number) {
  const response = await fetch(`/api/items?id=${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete item")
  return response.json()
}

export async function fetchTrades() {
  const response = await fetch("/api/trades")
  if (!response.ok) throw new Error("Failed to fetch trades")
  return response.json()
}

export async function createTradeAPI(trade: any) {
  const response = await fetch("/api/trades", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trade),
  })
  if (!response.ok) throw new Error("Failed to create trade")
  return response.json()
}

export async function updateTradeAPI(id: number, status: string) {
  const response = await fetch("/api/trades", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  })
  if (!response.ok) throw new Error("Failed to update trade")
  return response.json()
}

export async function clearTradesAPI() {
  const response = await fetch("/api/trades/clear", {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to clear trades")
  return response.json()
}

export async function fetchWebhookConfig() {
  const response = await fetch("/api/config?type=webhook")
  if (!response.ok) throw new Error("Failed to fetch webhook config")
  return response.json()
}

export async function saveWebhookConfigAPI(config: any) {
  const response = await fetch("/api/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "webhook", ...config }),
  })
  if (!response.ok) throw new Error("Failed to save webhook config")
  return response.json()
}

export async function fetchAdminPassword() {
  const response = await fetch("/api/config?type=password")
  if (!response.ok) throw new Error("Failed to fetch admin password")
  return response.json()
}

export async function saveAdminPasswordAPI(password: string) {
  const response = await fetch("/api/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "password", password }),
  })
  if (!response.ok) throw new Error("Failed to save admin password")
  return response.json()
}

export async function fetchNations() {
  const response = await fetch("/api/nations")
  if (!response.ok) throw new Error("Failed to fetch nations")
  return response.json()
}

export async function createNationAPI(nation: any) {
  const response = await fetch("/api/nations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nation),
  })
  if (!response.ok) throw new Error("Failed to create nation")
  return response.json()
}

export async function updateNationAPI(id: number, updates: any) {
  const response = await fetch(`/api/nations?id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })
  if (!response.ok) throw new Error("Failed to update nation")
  return response.json()
}

export async function deleteNationAPI(id: number) {
  const response = await fetch(`/api/nations?id=${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete nation")
  return response.json()
}
