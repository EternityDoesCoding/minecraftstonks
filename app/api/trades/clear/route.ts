import { NextResponse } from "next/server"
import { clearTradeRequests } from "@/lib/database"

export async function DELETE() {
  try {
    await clearTradeRequests()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] API Error clearing trades:", error)
    return NextResponse.json({ error: "Failed to clear trades" }, { status: 500 })
  }
}
