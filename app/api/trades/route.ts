import { type NextRequest, NextResponse } from "next/server"
import { getTradeRequests, createTradeRequest, updateTradeRequestStatus } from "@/lib/database"

export async function GET() {
  try {
    const trades = await getTradeRequests()

    const transformedTrades = trades.map((trade) => ({
      ...trade,
      item: trade.item
        ? {
            ...trade.item,
            imageUrl: trade.item.image_url || "",
            nationId: (trade.item as any).nation_id ?? trade.item.nation_id ?? null,
          }
        : undefined,
    }))

    return NextResponse.json(transformedTrades)
  } catch (error) {
    console.error("[v0] API Error getting trades:", error)
    return NextResponse.json({ error: "Failed to get trades" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const trade = await request.json()

    const dbTradeRequest = {
      item_id: trade.requestedItem?.id || trade.item_id,
      discord_user: trade.discordUser || trade.discord_user,
      quantity_wanted: trade.requestedQuantity || trade.quantity_wanted,
      offer_message: trade.offerMessage || trade.offer_message,
      status: trade.status || "pending",
    }

    console.log("[v0] Creating trade request with item_id:", dbTradeRequest.item_id)
    const newTrade = await createTradeRequest(dbTradeRequest)
    return NextResponse.json(newTrade)
  } catch (error) {
    console.error("[v0] API Error creating trade:", error)
    return NextResponse.json({ error: "Failed to create trade" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json()
    const updatedTrade = await updateTradeRequestStatus(id, status)

    const transformed = updatedTrade
      ? {
          ...updatedTrade,
          item: updatedTrade.item
            ? {
                ...updatedTrade.item,
                imageUrl: (updatedTrade.item as any).image_url || "",
                nationId: (updatedTrade.item as any).nation_id ?? null,
              }
            : undefined,
        }
      : updatedTrade

    return NextResponse.json(transformed)
  } catch (error) {
    console.error("[v0] API Error updating trade:", error)
    return NextResponse.json({ error: "Failed to update trade" }, { status: 500 })
  }
}
