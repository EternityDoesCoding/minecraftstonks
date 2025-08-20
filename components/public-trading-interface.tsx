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
