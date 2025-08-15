import { type NextRequest, NextResponse } from "next/server"
import { getWebhookConfig, saveWebhookConfig, getAdminPassword, saveAdminPassword } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (type === "webhook") {
      const config = await getWebhookConfig()
      return NextResponse.json(config)
    } else if (type === "password") {
      const password = await getAdminPassword()
      console.log("[v0] API Config - Retrieved password from database:", password)
      console.log("[v0] API Config - Password length:", password?.length)
      console.log("[v0] API Config - Password type:", typeof password)
      return NextResponse.json({ password })
    }

    return NextResponse.json({ error: "Invalid config type" }, { status: 400 })
  } catch (error) {
    console.error("[v0] API Error getting config:", error)
    return NextResponse.json({ error: "Failed to get config" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, ...data } = await request.json()

    if (type === "webhook") {
      await saveWebhookConfig(data)
      return NextResponse.json({ success: true })
    } else if (type === "password") {
      await saveAdminPassword(data.password)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid config type" }, { status: 400 })
  } catch (error) {
    console.error("[v0] API Error saving config:", error)
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 })
  }
}
