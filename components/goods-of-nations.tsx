"use client"
import { useState, useMemo, useCallback, memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Flag, Search, Package, Crown } from "lucide-react"
import type { Item, Nation } from "@/lib/database"

interface GoodsOfNationsProps {
  items: Item[]
  nations: Nation[]
  onTradeRequest?: (request: any) => void
  isPublicView?: boolean
}

export const GoodsOfNations = React.memo(function GoodsOfNations({ items, nations, onTradeRequest, isPublicView = false }: GoodsOfNationsProps) {
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

  const toggleNationExpansion = useCallback((nationId: number | null) => {
    setExpandedNations(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(nationId || 0)) {
        newExpanded.delete(nationId || 0)
      } else {
        newExpanded.add(nationId || 0)
      }
      return newExpanded
    })
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

  const handleTradeRequest = useCallback((item: Item) => {
    if (onTradeRequest) {
      // Prevent the parent from re-rendering this component by not triggering unnecessary updates
      onTradeRequest({
        requestedItem: item,
        requestedQuantity: 1,
        discordUser: "",
        offerMessage: "",
        status: "pending",
      })
    }
  }, [onTradeRequest])

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
                      <div
                        key={item.id}
                        className="group relative bg-muted/30 rounded-lg p-3 border hover:bg-muted/50 transition-colors"
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
                            <Button
                              size="sm"
                              className="minecraft-button text-xs"
                              onClick={() => handleTradeRequest(item)}
                            >
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
