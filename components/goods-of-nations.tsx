"use client"
import { useState, useMemo } from "react"
import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Flag, Search, Package, Crown } from "lucide-react"
import type { Item, Nation } from "@/lib/database"

interface GoodsOfNationsProps {
  items: Item[]
  nations: Nation[]
  onTradeRequest?: (request: any) => void
  isPublicView?: boolean
}

export function GoodsOfNations({ items, nations, onTradeRequest, isPublicView = false }: GoodsOfNationsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRarity, setSelectedRarity] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [expandedNations, setExpandedNations] = useState<Set<number>>(new Set())

  // Group items by nation
  const itemsByNation = useMemo(() => {
    const filtered = items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRarity = selectedRarity === "all" || item.rarity === selectedRarity
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
      return matchesSearch && matchesRarity && matchesCategory && (!isPublicView || item.quantity > 0)
    })

    const grouped = new Map<number | null, Item[]>()

    filtered.forEach((item) => {
      const nationId = item.nationId
      if (!grouped.has(nationId)) {
        grouped.set(nationId, [])
      }
      grouped.get(nationId)!.push(item)
    })

    return grouped
  }, [items, nations, searchTerm, selectedRarity, selectedCategory, isPublicView])

  const categories = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.category).filter(Boolean)))
  }, [items])

  const toggleNationExpansion = (nationId: number | null) => {
    const newExpanded = new Set(expandedNations)
    if (newExpanded.has(nationId || 0)) {
      newExpanded.delete(nationId || 0)
    } else {
      newExpanded.add(nationId || 0)
    }
    setExpandedNations(newExpanded)
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

  const handleTradeRequest = (item: Item) => {
    if (onTradeRequest) {
      onTradeRequest({
        requestedItem: { ...item, nationId: item.nationId },
        requestedQuantity: 1,
        discordUser: "",
        offerMessage: "",
        status: "pending",
      })
    }
  }

  // Sort nations: put "Unassigned" last, then alphabetically
  const sortedNationEntries = Array.from(itemsByNation.entries()).sort(([nationIdA, itemsA], [nationIdB, itemsB]) => {
    const nationA = nations.find((n) => n.id === nationIdA)
    const nationB = nations.find((n) => n.id === nationIdB)

    if (!nationA && !nationB) return 0
    if (!nationA) return 1
    if (!nationB) return -1

    if (nationA.name === "Unassigned" && nationB.name !== "Unassigned") return 1
    if (nationB.name === "Unassigned" && nationA.name !== "Unassigned") return -1

    return nationA.name.localeCompare(nationB.name)
  })

  const totalItems = Array.from(itemsByNation.values()).reduce((sum, items) => sum + items.length, 0)

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Goods of Nations
            <Badge variant="secondary" className="ml-2">
              {totalItems} items across {itemsByNation.size} nations
            </Badge>
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search items across all nations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRarity} onValueChange={setSelectedRarity}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by rarity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarities</SelectItem>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {sortedNationEntries.length === 0 ? (
          <Card className="bg-card/80 backdrop-blur-sm border-2 border-border">
            <CardContent className="text-center py-12">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No items found matching your filters.</p>
            </CardContent>
          </Card>
        ) : (
          sortedNationEntries.map(([nationId, nationItems]) => {
            const nation = nations.find((n) => n.id === nationId)
            const isExpanded = expandedNations.has(nationId || 0)
            const displayItems = isExpanded ? nationItems : nationItems.slice(0, 6)

            return (
              <Card key={nationId || "unassigned"} className="bg-card/80 backdrop-blur-sm border-2 border-border">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {nation?.flag_url ? (
                        <img
                          src={nation.flag_url || "/placeholder.svg"}
                          alt={`${nation.name} flag`}
                          className="w-12 h-8 object-cover border rounded shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-8 bg-muted border rounded flex items-center justify-center">
                          <Flag className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-semibold">{nation?.name || "Unknown Nation"}</h3>
                        {nation?.description && <p className="text-sm text-muted-foreground">{nation.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {nationItems.length} items
                      </Badge>
                      {nationItems.length > 6 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleNationExpansion(nationId)}
                          className="bg-transparent"
                        >
                          {isExpanded ? "Show Less" : `Show All (${nationItems.length})`}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {displayItems.map((item) => (
                      <Dialog key={item.id}>
                        <DialogTrigger asChild>
                          <div
                            className="group relative bg-muted/30 rounded-lg p-3 border hover:bg-muted/50 transition-colors cursor-pointer"
                          >
                        <div
                          className={`minecraft-item-icon w-16 h-16 mx-auto mb-2 bg-gradient-to-br ${getRarityColor(item.rarity)}`}
                        >
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl || "/placeholder.svg"}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-stone-300 to-stone-500 flex items-center justify-center">
                              <span className="text-xs font-bold text-stone-700">
                                {item.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          {item.quantity > 1 && (
                            <div className="absolute -bottom-1 -right-1 bg-stone-800 text-white text-xs font-bold px-1 rounded-sm border border-stone-600">
                              {item.quantity}
                            </div>
                          )}
                        </div>

                        <div className="text-center">
                          <h4 className="font-medium text-sm truncate" title={item.name}>
                            {item.name}
                          </h4>
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <Badge
                              variant="secondary"
                              className={`text-xs bg-gradient-to-r ${getRarityColor(item.rarity)}`}
                            >
                              {item.rarity}
                            </Badge>
                          </div>
                          {item.category && <p className="text-xs text-muted-foreground mt-1">{item.category}</p>}
                        </div>

                        {isPublicView && onTradeRequest && item.quantity > 0 && (
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <Button size="sm" className="minecraft-button text-xs">
                              Request Trade
                            </Button>
                          </div>
                        )}

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                          <div className="bg-stone-800 text-white p-2 rounded border border-stone-600 text-xs whitespace-nowrap shadow-lg">
                            <div className="font-bold text-yellow-400">{item.name}</div>
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
                            <div className="text-gray-400 mt-1">Quantity: {item.quantity}</div>
                          </div>
                        </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="bg-card/95 backdrop-blur-sm border-2 border-border max-w-md">
                          <DialogHeader>
                            <DialogTitle>Make Trade Request</DialogTitle>
                          </DialogHeader>
                          <TradeRequestForm
                            item={item}
                            nations={nations}
                            onTradeRequest={onTradeRequest}
                            onClose={() => {}}
                          />
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>

                  {!isExpanded && nationItems.length > 6 && (
                    <div className="mt-4 text-center">
                      <Button
                        variant="outline"
                        onClick={() => toggleNationExpansion(nationId)}
                        className="bg-transparent"
                      >
                        Show {nationItems.length - 6} more items
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

function TradeRequestForm({
  item,
  nations,
  onTradeRequest,
  onClose,
}: {
  item: Item | null
  nations: Nation[]
  onTradeRequest: (request: any) => void
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

  const itemNation = nations.find((nation) => nation.id === item.nationId)

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
          quantity: formData.requestedQuantity,
          rarity: item.rarity,
          category: item.category,
          imageUrl: item.imageUrl,
          nationId: item.nationId,
          isPublic: (item as any).isPublic,
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
          You'll be redirected back shortly.
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
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg">{item.name}</h3>
            {itemNation && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded border border-blue-500/30">
                {itemNation.flag_url && (
                  <img
                    src={itemNation.flag_url || "/placeholder.svg"}
                    alt={`${itemNation.name} flag`}
                    className="w-4 h-4 object-cover border border-stone-500 rounded flex-shrink-0"
                  />
                )}
                <span className="text-xs text-blue-300 font-medium">{itemNation.name}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
          <div className="flex gap-2">
            <Badge variant="secondary">{item.rarity}</Badge>
            {item.category && <Badge variant="outline">{item.category}</Badge>}
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
          <div className="text-xs text-muted-foreground">Requesting {formData.requestedQuantity} of {item.quantity} available</div>
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
