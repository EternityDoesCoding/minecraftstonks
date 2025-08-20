"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ShoppingCart, Star } from "lucide-react"
import type { Item, TradeRequest } from "@/app/page"

interface PublicTradingInterfaceProps {
  items: Item[]
  onTradeRequest: (request: Omit<TradeRequest, "id" | "createdAt">) => void
}

export function PublicTradingInterface({ items, onTradeRequest }: PublicTradingInterfaceProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedRarity, setSelectedRarity] = useState("all")
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 36 // 4 rows of 9 items for marketplace

  const publicItems = items.filter((item) => item.isPublic !== false && item.quantity > 0)

  const filteredItems = publicItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesRarity = selectedRarity === "all" || item.rarity === selectedRarity
    return matchesSearch && matchesCategory && matchesRarity
  })

  const categories = [
    "all",
    ...Array.from(
      new Set(publicItems.map((item) => item.category).filter((category) => category && category.trim() !== "")),
    ),
  ]
  const rarities = ["all", "common", "rare", "epic", "legendary"]

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = filteredItems.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, selectedRarity])

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

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Public Marketplace ({publicItems.length} total items, {filteredItems.length} available)
          </CardTitle>
          <CardDescription>
            Browse available items and make trade requests. Click on any item to open the trade request menu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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
            <Select value={selectedRarity} onValueChange={setSelectedRarity}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by rarity" />
              </SelectTrigger>
              <SelectContent>
                {rarities.map((rarity) => (
                  <SelectItem key={rarity} value={rarity}>
                    {rarity === "all" ? "All Rarities" : rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="minecraft-inventory-grid grid grid-cols-9 gap-4">
            {paginatedItems.map((item) => (
              <Dialog key={item.id}>
                <DialogTrigger asChild>
                  <div
                    className="minecraft-slot group cursor-pointer hover:scale-105 transition-transform relative"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className={`minecraft-item-icon bg-gradient-to-br ${getRarityColor(item.rarity)}`}>
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-stone-300 to-stone-500 flex items-center justify-center">
                          <span className="text-xs font-bold text-stone-700">{item.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      {item.quantity > 1 && (
                        <div className="absolute -bottom-1 -right-1 bg-stone-800 text-white text-xs font-bold px-1 rounded-sm border border-stone-600">
                          {item.quantity}
                        </div>
                      )}
                      {item.rarity === "legendary" && (
                        <Star className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 fill-current" />
                      )}
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                      <div className="bg-stone-800 text-white p-2 rounded border border-stone-600 text-xs whitespace-nowrap shadow-lg relative">
                        <div className="font-bold text-yellow-400 flex items-center justify-between">
                          <span>{item.name}</span>
                          {item.nationImageUrl && (
                            <div className="w-6 h-6 rounded border border-stone-500 overflow-hidden bg-stone-700 ml-2 flex-shrink-0">
                              <img
                                src={item.nationImageUrl || "/placeholder.svg"}
                                alt="Nation"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                        {item.description && <div className="text-gray-300 mt-1">{item.description}</div>}
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
                  </div>
                </DialogTrigger>
                <DialogContent className="bg-card/95 backdrop-blur-sm border-2 border-border max-w-md">
                  <DialogHeader>
                    <DialogTitle>Make Trade Request</DialogTitle>
                  </DialogHeader>
                  <TradeRequestForm item={item} onTradeRequest={onTradeRequest} onClose={() => setSelectedItem(null)} />
                </DialogContent>
              </Dialog>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {publicItems.length === 0
                  ? "No items available for trading yet. Check back later!"
                  : searchTerm || selectedCategory !== "all" || selectedRarity !== "all"
                    ? "No items found matching your search criteria. Try adjusting your filters."
                    : "No items available for trading."}
              </p>
              {items.filter((item) => item.quantity === 0).length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Note: Items that are out of stock are not shown in the marketplace.
                </p>
              )}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} of {filteredItems.length} items
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
                <span className="flex items-center px-3 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
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
    </div>
  )
}

function TradeRequestForm({
  item,
  onTradeRequest,
  onClose,
}: {
  item: Item | null
  onTradeRequest: (request: Omit<TradeRequest, "id" | "createdAt">) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    playerName: "",
    discordUser: "",
    requestedQuantity: 1,
    offerMessage: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  if (!item) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.playerName && formData.discordUser) {
      setIsSubmitting(true)

      onTradeRequest({
        playerName: formData.playerName,
        discordUser: formData.discordUser,
        requestedItem: {
          id: item.id,
          name: item.name,
          description: item.description,
          quantity: formData.requestedQuantity, // User's selected quantity
          rarity: item.rarity,
          category: item.category,
          imageUrl: item.imageUrl,
          nationId: item.nationId,
          isPublic: item.isPublic,
        },
        requestedQuantity: formData.requestedQuantity,
        offerMessage: formData.offerMessage,
        status: "pending",
      })

      setShowSuccess(true)
      setIsSubmitting(false)

      setFormData({
        playerName: "",
        discordUser: "",
        requestedQuantity: 1,
        offerMessage: "",
      })

      setTimeout(() => {
        setShowSuccess(false)
        onClose()
        const dialog = document.querySelector('[role="dialog"]') as HTMLElement
        if (dialog) {
          const closeButton = dialog.querySelector("[data-radix-collection-item]") as HTMLElement
          closeButton?.click()
        }
      }, 2000)
    }
  }

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

  if (showSuccess) {
    return (
      <div className="space-y-4 text-center py-8">
        <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-green-600">Trade Request Sent!</h3>
        <p className="text-muted-foreground">
          Your trade request for {formData.requestedQuantity}x {item.name} has been sent successfully.
          <br />
          You'll be redirected back to the marketplace shortly.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className={`minecraft-item-icon bg-gradient-to-br ${getRarityColor(item.rarity)}`}>
          {item.imageUrl ? (
            <img src={item.imageUrl || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-stone-300 to-stone-500 flex items-center justify-center">
              <span className="text-xs font-bold text-stone-700">{item.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
          {item.quantity > 1 && (
            <div className="absolute -bottom-1 -right-1 bg-stone-800 text-white text-xs font-bold px-1 rounded-sm">
              {item.quantity}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{item.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
          <div className="flex gap-2">
            <Badge variant="secondary">{item.rarity}</Badge>
            <Badge variant="outline">{item.category}</Badge>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Your Minecraft username"
          value={formData.playerName}
          onChange={(e) => setFormData((prev) => ({ ...prev, playerName: e.target.value }))}
          required
        />
        <Input
          placeholder="Your Discord username (e.g., username#1234)"
          value={formData.discordUser}
          onChange={(e) => setFormData((prev) => ({ ...prev, discordUser: e.target.value }))}
          required
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Quantity (max: {item.quantity})</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max={item.quantity}
              value={formData.requestedQuantity}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, requestedQuantity: Number.parseInt(e.target.value) || 1 }))
              }
              className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
            <Input
              type="number"
              min="1"
              max={item.quantity}
              value={formData.requestedQuantity}
              onChange={(e) => {
                const value = Number.parseInt(e.target.value) || 1
                const clampedValue = Math.max(1, Math.min(item.quantity, value))
                setFormData((prev) => ({ ...prev, requestedQuantity: clampedValue }))
              }}
              className="w-20"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Requesting {formData.requestedQuantity} of {item.quantity} available
          </div>
        </div>

        <Textarea
          placeholder="What are you offering in exchange? (e.g., 32 diamonds, enchanted sword, etc.)"
          value={formData.offerMessage}
          onChange={(e) => setFormData((prev) => ({ ...prev, offerMessage: e.target.value }))}
          rows={3}
          required
        />
        <Button type="submit" className="minecraft-button w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending Request..." : "Send Trade Request"}
        </Button>
      </form>
    </div>
  )
}
