"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Trash2, Search, Package } from "lucide-react"
import type { Item } from "@/app/page"

interface InventoryGridProps {
  items: Item[]
  onUpdateItem: (id: number, updates: Partial<Item>) => void
  onDeleteItem: (id: number) => void
}

export function InventoryGrid({ items, onUpdateItem, onDeleteItem }: InventoryGridProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 45 // 5 rows of 9 items

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [
    "all",
    ...Array.from(new Set(items.map((item) => item.category).filter((category) => category && category.trim() !== ""))),
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "from-yellow-400 to-yellow-600 border-yellow-500"
      case "epic":
        return "from-purple-400 to-purple-600 border-purple-500"
      case "rare":
        return "from-blue-400 to-blue-600 border-blue-500"
      default:
        return "from-gray-400 to-gray-600 border-gray-500"
    }
  }

  const handleEditItem = (updates: Partial<Item>) => {
    if (editingItem) {
      onUpdateItem(editingItem.id, updates)
      setEditingItem(null)
    }
  }

  const slotsPerRow = 9
  const minRows = 4
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = filteredItems.slice(startIndex, endIndex)

  const neededRows = Math.max(minRows, Math.ceil(paginatedItems.length / slotsPerRow))
  const totalSlots = neededRows * slotsPerRow

  const inventorySlots = Array.from({ length: totalSlots }, (_, index) => {
    const item = paginatedItems[index]
    return { item, index }
  })

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-2 border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Inventory ({items.length} total items, {filteredItems.length} filtered)
        </CardTitle>
        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="minecraft-inventory-grid grid grid-cols-9 gap-4">
          {inventorySlots.map(({ item, index }) => (
            <div
              key={index}
              className={`minecraft-slot group cursor-pointer relative ${selectedSlot === index ? "selected" : ""}`}
              onClick={() => setSelectedSlot(selectedSlot === index ? null : index)}
            >
              {item ? (
                <>
                  <div
                    className={`minecraft-item-icon bg-gradient-to-br ${getRarityColor(item.rarity)} ${item.quantity === 0 ? "opacity-50" : ""}`}
                  >
                    {item.imageUrl ? (
                      <>
                        <img
                          src={item.imageUrl || "/placeholder.svg"}
                          alt={item.name}
                          className={`w-full h-full object-cover ${item.quantity === 0 ? "grayscale" : ""}`}
                          onError={(e) => {
                            try {
                              const safeImageUrl = item.imageUrl || ""
                              const safePrefix =
                                safeImageUrl.length > 50 ? safeImageUrl.slice(0, 50) + "..." : safeImageUrl

                              console.error("[v0] Image failed to load for:", item.name, {
                                hasImageUrl: !!item.imageUrl,
                                imageUrlLength: safeImageUrl.length,
                                imageUrlPrefix: safePrefix,
                                isBase64: safeImageUrl.startsWith("data:image/"),
                              })
                            } catch (stringError) {
                              console.error("[v0] Image failed to load for:", item.name, "- string processing error")
                            }
                            // Fallback to placeholder on error
                            e.currentTarget.style.display = "none"
                            e.currentTarget.nextElementSibling?.classList.remove("hidden")
                          }}
                          onLoad={() => {
                            console.log("[v0] Image loaded successfully for:", item.name)
                          }}
                        />
                        <div className="hidden w-full h-full bg-gradient-to-br from-stone-300 to-stone-500 flex items-center justify-center">
                          <span className="text-xs font-bold text-stone-700">{item.name.charAt(0).toUpperCase()}</span>
                        </div>
                      </>
                    ) : (
                      <div
                        className={`w-full h-full bg-gradient-to-br from-stone-300 to-stone-500 flex items-center justify-center ${item.quantity === 0 ? "grayscale" : ""}`}
                      >
                        <span className="text-xs font-bold text-stone-700">{item.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    {item.quantity > 1 ? (
                      <div className="absolute -bottom-1 -right-1 bg-stone-800 text-white text-xs font-bold px-1 rounded-sm border border-stone-600">
                        {item.quantity}
                      </div>
                    ) : item.quantity === 0 ? (
                      <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-xs font-bold px-1 rounded-sm border border-red-500">
                        OUT
                      </div>
                    ) : null}
                    {item.quantity === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-red-400 text-xs font-bold bg-black/60 px-1 rounded">OUT OF STOCK</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                    <div className="bg-stone-800 text-white p-2 rounded border border-stone-600 text-xs whitespace-nowrap shadow-lg">
                      <div className="font-bold text-yellow-400">{item.name}</div>
                      {item.description && <div className="text-gray-300 mt-1">{item.description}</div>}
                      {item.quantity === 0 && <div className="text-red-400 mt-1 font-bold">OUT OF STOCK</div>}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={`text-xs bg-gradient-to-r ${getRarityColor(item.rarity)}`}
                        >
                          {item.rarity}
                        </Badge>
                        {item.category && <span className="text-gray-400">{item.category}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-6 h-6 p-0 bg-stone-700 border-stone-600 hover:bg-stone-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingItem(item)
                          }}
                        >
                          <Edit className="w-3 h-3 text-white" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent
                        className="bg-card/95 backdrop-blur-sm border-2 border-border"
                        aria-describedby="edit-item-description"
                      >
                        <DialogHeader>
                          <DialogTitle>Edit Item</DialogTitle>
                          <div id="edit-item-description" className="sr-only">
                            Edit the properties of the selected inventory item including name, description, quantity,
                            rarity, category, and image.
                          </div>
                        </DialogHeader>
                        <EditItemForm item={editingItem} onSave={handleEditItem} />
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-6 h-6 p-0 bg-red-700 border-red-600 hover:bg-red-600 text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteItem(item.id)
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="minecraft-item-icon opacity-30">
                  <div className="w-full h-full bg-gradient-to-br from-stone-400 to-stone-600"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} ({filteredItems.length} items)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="minecraft-button"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="minecraft-button"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EditItemForm({ item, onSave }: { item: Item | null; onSave: (updates: Partial<Item>) => void }) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    quantity: item?.quantity || 1,
    rarity: item?.rarity || ("common" as const),
    category: item?.category || "",
    imageUrl: item?.imageUrl || "",
  })

  const [imagePreview, setImagePreview] = useState<string>(item?.imageUrl || "")

  if (!item) return null

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const result = event.target?.result as string
          if (result && typeof result === "string") {
            setImagePreview(result)
            setFormData((prev) => ({ ...prev, imageUrl: result }))
          }
        } catch (error) {
          console.error("[v0] Error processing uploaded image:", error)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImagePreview("")
    setFormData((prev) => ({ ...prev, imageUrl: "" }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Item name"
        value={formData.name}
        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
      />
      <Textarea
        placeholder="Item description"
        value={formData.description}
        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
      />
      <Input
        type="number"
        placeholder="Quantity"
        min="1"
        value={formData.quantity}
        onChange={(e) => setFormData((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 1 }))}
      />
      <Select value={formData.rarity} onValueChange={(value) => setFormData((prev) => ({ ...prev, rarity: value }))}>
        <SelectTrigger>
          <SelectValue placeholder="Select rarity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="common">Common</SelectItem>
          <SelectItem value="rare">Rare</SelectItem>
          <SelectItem value="epic">Epic</SelectItem>
          <SelectItem value="legendary">Legendary</SelectItem>
        </SelectContent>
      </Select>
      <Input
        placeholder="Category"
        value={formData.category}
        onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">Item Image</label>
        {imagePreview && (
          <div className="relative w-20 h-20 border-2 border-border rounded">
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="Preview"
              className="w-full h-full object-cover rounded"
            />
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="absolute -top-2 -right-2 w-6 h-6 p-0"
              onClick={handleRemoveImage}
            >
              ×
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Input type="file" accept="image/*" onChange={handleImageUpload} className="flex-1" />
          {imagePreview && (
            <Button type="button" variant="outline" size="sm" onClick={handleRemoveImage}>
              Remove
            </Button>
          )}
        </div>
      </div>

      <Button type="submit" className="minecraft-button w-full">
        Save Changes
      </Button>
    </form>
  )
}
