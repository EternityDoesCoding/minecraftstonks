"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ShoppingCart, Star, Globe, Flag } from "lucide-react"
import type { Item, TradeRequest, Nation } from "@/lib/database"

interface PublicTradingInterfaceProps {
  items: Item[]
  nations: Nation[]
  onTradeRequest: (request: Omit<TradeRequest, "id" | "createdAt">) => void
}

export function PublicTradingInterface({ items, nations, onTradeRequest }: PublicTradingInterfaceProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedRarity, setSelectedRarity] = useState("all")
  const [selectedNation, setSelectedNation] = useState("all")
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  
  // KEEP this as "marketplace" to maintain the compact view (Image 1)
  const [activeTab, setActiveTab] = useState("marketplace")
  
  const itemsPerPage = 36

  const publicItems = items.filter((item) => item.isPublic !== false && item.quantity > 0)

  const filteredItems = publicItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesRarity = selectedRarity === "all" || item.rarity === selectedRarity
    const matchesNation = selectedNation === "all" || item.nationId?.toString() === selectedNation
    return matchesSearch && matchesCategory && matchesRarity && matchesNation
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

  const itemsByNation = (nations || []).reduce(
    (acc, nation) => {
      const nationItems = publicItems.filter((item) => item.nationId === nation.id)
      if (nationItems.length > 0) {
        acc[nation.id] = {
          nation,
          items: nationItems,
          totalItems: nationItems.length,
          categories: [...new Set(nationItems.map((item) => item.category).filter(Boolean))],
        }
      }
      return acc
    },
    {} as Record<number, { nation: Nation; items: Item[]; totalItems: number; categories: string[] }>,
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, selectedRarity, selectedNation])

  // Use useCallback to prevent unnecessary re-renders that might cause tab switching
  const handleTradeRequest = useCallback((request: Omit<TradeRequest, "id" | "createdAt">) => {
    onTradeRequest(request)
    // Do NOT change activeTab here - keep it as is
  }, [onTradeRequest])

  // Memoize the tab change handler to prevent accidental switches
  const handleTabChange = useCallback((newTab: string) => {
    // Only allow tab changes from user interaction, not from re-renders
    setActiveTab(newTab)
  }, [])

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

  const getNationForItem = (item: Item) => {
    return (nations || []).find((nation) => nation.id === item.nationId)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Public Trading Hub ({publicItems.length} total items, {filteredItems.length} available)
          </CardTitle>
          <CardDescription>
            Browse available items and make trade requests. Click on any item to open the trade request menu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="marketplace" className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Marketplace
              </TabsTrigger>
              <TabsTrigger value="nations" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Goods of Nations
              </TabsTrigger>
            </TabsList>

            {/* MARKETPLACE TAB - This is the compact view (Image 1) */}
            <TabsContent value="marketplace" className="space-y-6">
              {/* Nations displayed as compact cards */}
              <div className="space-y-6">
                {Object.values(itemsByNation).map(({ nation, items, totalItems, categories }) => (
                  <Card key={nation.id} className="bg-card/60 backdrop-blur-sm border border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        {nation.flag_url && (
                          <div className="w-8 h-8 rounded border border-border overflow-hidden">
                            <img
                              src={nation.flag_url || "/placeholder.svg"}
                              alt={nation.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <Flag className="w-4 h-4" />
                            {nation.name}
                          </div>
                          <div className="text-sm text-muted-foreground font-normal">
                            {totalItems} items available • {categories.length} categories
                          </div>
                        </div>
                      </CardTitle>
                      {nation.description && <CardDescription>{nation.description}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                      {/* Items displayed horizontally like in Image 1 */}
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {items.map((item) => (
                          <Dialog key={item.id}>
                            <DialogTrigger asChild>
                              <div className="minecraft-slot group cursor-pointer hover:scale-105 transition-transform relative flex-shrink-0">
                                <div className={`minecraft-item-icon bg-gradient-to-br ${getRarityColor(item.rarity)}`}>
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
                              </div>
                            </DialogTrigger>
                            <DialogContent className="bg-card/95 backdrop-blur-sm border-2 border-border max-w-md">
                              <DialogHeader>
                                <DialogTitle>Make Trade Request</DialogTitle>
                              </DialogHeader>
                              <TradeRequestForm
                                item={item}
                                nations={nations}
                                onTradeRequest={handleTradeRequest}
                                onClose={() => setSelectedItem(null)}
                              />
                            </DialogContent>
                          </Dialog>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* NATIONS TAB - This is the expanded view (Image 2) */}
            <TabsContent value="nations" className="space-y-6">
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

              <div className="grid gap-6">
                {Object.values(itemsByNation).map(({ nation, items, totalItems, categories }) => (
                  <Card key={nation.id} className="bg-card/60 backdrop-blur-sm border border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        {nation.flag_url && (
                          <div className="w-8 h-8 rounded border border-border overflow-hidden">
                            <img
                              src={nation.flag_url || "/placeholder.svg"}
                              alt={nation.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <Flag className="w-4 h-4" />
                            {nation.name}
                          </div>
                          <div className="text-sm text-muted-foreground font-normal">
                            {totalItems} items available • {categories.length} categories
                          </div>
                        </div>
                      </CardTitle>
                      {nation.description && <CardDescription>{nation.description}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-6 md:grid-cols-9 gap-3">
                        {items.slice(0, 18).map((item) => (
                          <Dialog key={item.id}>
                            <DialogTrigger asChild>
                              <div className="minecraft-slot group cursor-pointer hover:scale-105 transition-transform relative">
                                <div className={`minecraft-item-icon bg-gradient-to-br ${getRarityColor(item.rarity)}`}>
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
                              </div>
                            </DialogTrigger>
                            <DialogContent className="bg-card/95 backdrop-blur-sm border-2 border-border max-w-md">
                              <DialogHeader>
                                <DialogTitle>Make Trade Request</DialogTitle>
                              </DialogHeader>
                              <TradeRequestForm
                                item={item}
                                nations={nations}
                                onTradeRequest={handleTradeRequest}
                                onClose={() => setSelectedItem(null)}
                              />
                            </DialogContent>
                          </Dialog>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
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

  const itemNation = nations.find((nation) => nation.id === item.nationId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.playerName && formData.discordUser) {
      setIsSubmitting(true)

      try {
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
            isPublic: item.isPublic,
          },
          requestedQuantity: formData.requestedQuantity,
          offerMessage: formData.offerMessage,
          status: "pending",
        })

        setShowSuccess(true)
        
        // Reset form data but don't close dialog immediately
        setFormData({
          playerName: "",
          discordUser: "",
          requestedQuantity: 1,
          offerMessage: "",
        })

        // Close dialog after showing success message, but preserve parent state
        setTimeout(() => {
          setShowSuccess(false)
          onClose() // This should only close the dialog, not reset parent state
        }, 2000)
        
      } catch (error) {
        console.error('Trade request failed:', error)
      } finally {
        setIsSubmitting(false)
      }
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

// EXPORTS - ADD THESE LINES
export { PublicTradingInterface, TradeRequestForm }
export default PublicTradingInterface
