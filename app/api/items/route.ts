import { type NextRequest, NextResponse } from "next/server"
import { getItems, createItem, updateItem, deleteItem } from "@/lib/database"

export async function GET() {
  try {
    console.log("[v0] GET - Starting to retrieve items from database")
    const items = await getItems()

    const transformedItems = items.map((item) => ({
      ...item,
      imageUrl: item.image_url || "", // Map image_url to imageUrl and ensure it's a string
    }))

    console.log("[v0] GET - Item image data:")
    transformedItems.forEach((item) => {
      const hasImage = !!item.imageUrl && item.imageUrl.length > 0
      const imagePrefix = hasImage ? item.imageUrl.substring(0, 30) + "..." : "NO IMAGE"
      console.log(
        `[v0] - ${item.name} (id:${item.id}): hasImage=${hasImage}, length=${item.imageUrl?.length || 0}, prefix="${imagePrefix}"`,
      )
    })

    console.log("[v0] GET - Returning", transformedItems.length, "items with imageUrl field")

    return NextResponse.json(transformedItems)
  } catch (error) {
    console.error("[v0] API Error getting items:", error)
    return NextResponse.json({ error: "Failed to get items" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const item = await request.json()

    console.log("[v0] POST - Creating item:", item.name, "with image data:", !!item.imageUrl)

    const dbItem = {
      ...item,
      image_url: item.imageUrl || "", // Map imageUrl to image_url
    }
    delete dbItem.imageUrl // Remove the camelCase version

    const newItem = await createItem(dbItem)

    const responseItem = {
      ...newItem,
      imageUrl: newItem.image_url || "",
    }

    console.log("[v0] POST - Created item:", responseItem.name, "with id:", responseItem.id)

    return NextResponse.json(responseItem)
  } catch (error) {
    console.error("[v0] API Error creating item:", error)
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json()

    console.log("[v0] PUT - Updating item:", id, "with image data:", !!updates.imageUrl)

    const dbUpdates = { ...updates }

    // Only map imageUrl to image_url if image data is being updated
    if (updates.imageUrl !== undefined) {
      dbUpdates.image_url = updates.imageUrl
      delete dbUpdates.imageUrl
    } else if (updates.image_url !== undefined) {
      // Keep existing image_url field if provided directly
    } else {
      // Don't include image_url field at all to preserve existing data
    }

    const updatedItem = await updateItem(id, dbUpdates)

    const responseItem = {
      ...updatedItem,
      imageUrl: updatedItem.image_url || "",
    }

    console.log("[v0] PUT - Updated item:", responseItem.name, "with image:", !!responseItem.imageUrl)

    return NextResponse.json(responseItem)
  } catch (error) {
    console.error("[v0] API Error updating item:", error)
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 })
    }
    await deleteItem(Number.parseInt(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] API Error deleting item:", error)
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
  }
}
