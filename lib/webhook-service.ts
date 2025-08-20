import type { Item, TradeRequest, WebhookConfig } from "@/app/page"

export class WebhookService {
  private config: WebhookConfig

  constructor(config: WebhookConfig) {
    this.config = config
  }

  async sendNotification(type: keyof WebhookConfig["events"], data: any) {
    if (!this.config.enabled || !this.config.url || !this.config.events[type]) {
      return
    }

    try {
      const payload = this.createPayload(type, data)

      const response = await fetch("/api/webhook/discord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          webhookUrl: this.config.url,
          ...payload,
        }),
      })

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`)
      }

      console.log(`[v0] Webhook notification sent for ${type}`)
    } catch (error) {
      console.error(`[v0] Webhook error for ${type}:`, error)
    }
  }

  private createPayload(type: keyof WebhookConfig["events"], data: any) {
    switch (type) {
      case "newTrade":
        return this.createNewTradePayload(data as TradeRequest)
      case "tradeAccepted":
        return this.createTradeAcceptedPayload(data as TradeRequest)
      case "tradeDeclined":
        return this.createTradeDeclinedPayload(data as TradeRequest)
      case "newItem":
        return this.createNewItemPayload(data as Item)
      default:
        return { message: "Unknown event type" }
    }
  }

  private createNewTradePayload(trade: TradeRequest) {
    console.log("[v0] Creating webhook payload for trade:", trade)

    return {
      embeds: [
        {
          title: "🔔 New Trade Offer!",
          description: `**${trade.discordUser || "Unknown User"}** wants to make a trade`,
          color: 0x0891b2, // Cyan color
          fields: [
            {
              name: "🎮 Minecraft User",
              value: trade.playerName || "Unknown Player",
              inline: true,
            },
            {
              name: "🎯 They Want",
              value: `${trade.requestedQuantity || 0}x ${trade.requestedItem?.name || "Unknown Item"}`,
              inline: true,
            },
            {
              name: "💬 They Offer",
              value: trade.offerMessage || "No offer details provided",
              inline: false,
            },
          ],
          footer: {
            text: "Minecraft Inventory Dashboard",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    }
  }

  private createTradeAcceptedPayload(trade: TradeRequest) {
    return {
      embeds: [
        {
          title: "✅ Trade Accepted!",
          description: `Trade with **${trade.discordUser}** has been completed`,
          color: 0x10b981, // Green color
          fields: [
            {
              name: "🎮 Minecraft User",
              value: trade.playerName || "Unknown Player",
              inline: true,
            },
            {
              name: "📤 Items Sent",
              value: `${trade.requestedQuantity}x ${trade.requestedItem?.name}`,
              inline: true,
            },
            {
              name: "📦 Items Received",
              value: trade.offerMessage || "As discussed",
              inline: true,
            },
          ],
          footer: {
            text: "Minecraft Inventory Dashboard",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    }
  }

  private createTradeDeclinedPayload(trade: TradeRequest) {
    return {
      embeds: [
        {
          title: "❌ Trade Declined",
          description: `Trade offer from **${trade.discordUser}** was declined`,
          color: 0xbe123c, // Red color
          fields: [
            {
              name: "🎮 Minecraft User",
              value: trade.playerName || "Unknown Player",
              inline: true,
            },
            {
              name: "Requested Item",
              value: `${trade.requestedQuantity}x ${trade.requestedItem?.name}`,
              inline: true,
            },
          ],
          footer: {
            text: "Minecraft Inventory Dashboard",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    }
  }

  private createNewItemPayload(item: Item) {
    const rarityEmoji = {
      common: "⚪",
      rare: "🔵",
      epic: "🟣",
      legendary: "🟡",
    }

    return {
      embeds: [
        {
          title: "📦 New Item Added!",
          description: `**${item.name}** has been added to the inventory`,
          color: 0x0891b2,
          fields: [
            {
              name: "Quantity",
              value: item.quantity.toString(),
              inline: true,
            },
            {
              name: "Rarity",
              value: `${rarityEmoji[item.rarity]} ${item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}`,
              inline: true,
            },
            {
              name: "Category",
              value: item.category.charAt(0).toUpperCase() + item.category.slice(1),
              inline: true,
            },
            {
              name: "Description",
              value: item.description || "No description provided",
              inline: false,
            },
          ],
          footer: {
            text: "Minecraft Inventory Dashboard",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    }
  }
}
