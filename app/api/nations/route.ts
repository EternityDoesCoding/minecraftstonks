import { type NextRequest, NextResponse } from "next/server"
import { getNations, createNation, updateNation, deleteNation } from "@/lib/database"

export async function GET() {
  try {
    const nations = await getNations()
    return NextResponse.json(nations)
  } catch (error) {
    console.error("Error in GET /api/nations:", error)
    return NextResponse.json({ error: "Failed to fetch nations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const nation = await createNation(body)

    if (!nation) {
      return NextResponse.json({ error: "Failed to create nation" }, { status: 500 })
    }

    return NextResponse.json(nation)
  } catch (error) {
    console.error("Error in POST /api/nations:", error)
    return NextResponse.json({ error: "Failed to create nation" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = Number.parseInt(searchParams.get("id") || "0")

    if (!id) {
      return NextResponse.json({ error: "Nation ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const nation = await updateNation(id, body)

    if (!nation) {
      return NextResponse.json({ error: "Failed to update nation" }, { status: 500 })
    }

    return NextResponse.json(nation)
  } catch (error) {
    console.error("Error in PUT /api/nations:", error)
    return NextResponse.json({ error: "Failed to update nation" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = Number.parseInt(searchParams.get("id") || "0")

    if (!id) {
      return NextResponse.json({ error: "Nation ID is required" }, { status: 400 })
    }

    const success = await deleteNation(id)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete nation" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/nations:", error)
    return NextResponse.json({ error: "Failed to delete nation" }, { status: 500 })
  }
}
