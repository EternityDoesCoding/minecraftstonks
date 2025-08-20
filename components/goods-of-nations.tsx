// In your main PublicTradingInterface component, ensure these fixes:

export function PublicTradingInterface({ items, nations, onTradeRequest }: PublicTradingInterfaceProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedRarity, setSelectedRarity] = useState("all")
  const [selectedNation, setSelectedNation] = useState("all")
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  
  // CRITICAL: Keep this as "marketplace" to prevent switch to GoodsOfNations
  const [activeTab, setActiveTab] = useState("marketplace")
  
  // Prevent tab switching on trade request
  const handleTradeRequest = useCallback((request: Omit<TradeRequest, "id" | "createdAt">) => {
    onTradeRequest(request)
    // DON'T change activeTab here - this was causing the switch
  }, [onTradeRequest])

  // Prevent accidental tab changes during re-renders
  const handleTabChange = useCallback((newTab: string) => {
    // Only change tabs from explicit user clicks
    setActiveTab(newTab)
  }, [])

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

            {/* MARKETPLACE TAB - This is the compact view you want (Image 1) */}
            <TabsContent value="marketplace" className="space-y-6">
              {/* NO search filters here - keep it simple */}
              
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
                      {/* Items displayed horizontally, not in a grid */}
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {items.slice(0, 6).map((item) => ( // Limit to 6 items for compact view
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

            {/* NATIONS TAB - This uses your GoodsOfNations component (Image 2) */}
            <TabsContent value="nations" className="space-y-6">
              <GoodsOfNations 
                items={items} 
                nations={nations} 
                onTradeRequest={handleTradeRequest} 
                isPublicView={true} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// ALSO: Update your TradeRequestForm to NOT cause tab switches
function TradeRequestForm({ item, nations, onTradeRequest, onClose }) {
  // ... existing code ...

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
            quantity: formData.requestedQuantity,
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
        
        setFormData({
          playerName: "",
          discordUser: "",
          requestedQuantity: 1,
          offerMessage: "",
        })

        // Close dialog after success - this should NOT cause tab switching
        setTimeout(() => {
          setShowSuccess(false)
          onClose() // Only closes the dialog, doesn't change parent state
        }, 2000)
        
      } catch (error) {
        console.error('Trade request failed:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // ... rest of component
}
