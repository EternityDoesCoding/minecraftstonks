"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, User, MessageSquare, CheckCircle, XCircle, Hash, RefreshCw } from "lucide-react"
import type { TradeRequest, Nation } from "@/app/page"

interface TradeManagementProps {
  tradeRequests: TradeRequest[]
  nations?: Nation[]
  onUpdateTradeRequest: (id: number, updates: Partial<TradeRequest>) => void
  onRefreshTrades?: () => void
}

export function TradeManagement({
  tradeRequests,
  nations,
  onUpdateTradeRequest,
  onRefreshTrades,
}: TradeManagementProps) {
  const pendingRequests = tradeRequests.filter((request) => request.status === "pending")
  const completedRequests = tradeRequests.filter((request) => request.status !== "pending")

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "text-green-600 bg-green-100"
      case "declined":
        return "text-red-600 bg-red-100"
      default:
        return "text-yellow-600 bg-yellow-100"
    }
  }

  const formatTimeAgo = (date: Date | string | undefined) => {
    if (!date) return "Unknown time"

    let dateObj: Date
    if (typeof date === "string") {
      dateObj = new Date(date)
    } else {
      dateObj = date
    }

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid date"
    }

    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getNationForItem = (item: any) => {
    return (nations || []).find((nation) => nation.id === item.nationId)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm border-2 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Trade Requests ({pendingRequests.length})
              </CardTitle>
              <CardDescription>Review and respond to incoming trade requests</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No pending trade requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => {
                const itemNation = getNationForItem(request.requestedItem)

                return (
                  <div key={request.id} className="p-4 bg-secondary/10 rounded-lg border">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{request.playerName}</span>
                        <Badge variant="outline" className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{formatTimeAgo(request.createdAt)}</span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="w-4 h-4" />
                        <span className="font-medium">Discord:</span>
                        <span className="text-sm">{request.discordUser}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Wants:</h4>
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                        <div
                          className={`minecraft-item-icon bg-gradient-to-br ${getRarityColor(request.requestedItem.rarity)}`}
                        >
                          {request.requestedItem.imageUrl ? (
                            <img
                              src={request.requestedItem.imageUrl || "/placeholder.svg"}
                              alt={request.requestedItem.name}
                              className="w-full h-full object-cover"
                              onLoad={() =>
                                console.log("[v0] Trade image loaded successfully for:", request.requestedItem.name)
                              }
                              onError={(e) => {
                                console.log("[v0] Trade image failed to load for:", request.requestedItem.name)
                                console.log("[v0] Trade image URL length:", request.requestedItem.imageUrl?.length || 0)
                                console.log(
                                  "[v0] Trade image URL prefix:",
                                  request.requestedItem.imageUrl?.substring(0, 50) || "No URL",
                                )
                                e.currentTarget.style.display = "none"
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                if (fallback) fallback.style.display = "flex"
                              }}
                            />
                          ) : null}
                          <div
                            className="w-full h-full bg-gradient-to-br from-stone-300 to-stone-500 flex items-center justify-center"
                            style={{ display: request.requestedItem.imageUrl ? "none" : "flex" }}
                          >
                            <span className="text-xs font-bold text-stone-700">
                              {request.requestedItem.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {request.requestedQuantity > 1 && (
                            <div className="absolute -bottom-1 -right-1 bg-stone-800 text-white text-xs font-bold px-1 rounded-sm border border-stone-600">
                              {request.requestedQuantity}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{request.requestedItem.name}</span>
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
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">{request.requestedItem.rarity}</Badge>
                            <Badge variant="outline">{request.requestedItem.category}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {request.offerMessage && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4" />
                          <span className="font-medium">They're offering:</span>
                        </div>
                        <p className="text-sm bg-muted/50 p-2 rounded">{request.offerMessage}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="minecraft-button flex items-center gap-2"
                        onClick={() => onUpdateTradeRequest(request.id, { status: "accepted" })}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept Trade
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2 bg-transparent"
                        onClick={() => onUpdateTradeRequest(request.id, { status: "declined" })}
                      >
                        <XCircle className="w-4 h-4" />
                        Decline
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {onRefreshTrades && (
            <div className="flex justify-center mt-6 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefreshTrades}
                className="flex items-center gap-2 bg-transparent"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Trades
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm border-2 border-border">
        <CardHeader>
          <CardTitle>Complete Trade Log ({tradeRequests.length})</CardTitle>
          <CardDescription>Detailed history of all trade requests and their outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tradeRequests && tradeRequests.length > 0 ? (
              [...tradeRequests]
                .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                .map((trade, index) => (
                  <div key={`${trade.id}-${index}`} className="p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">{trade.discordUser}</h4>
                            <p className="text-sm text-muted-foreground">Minecraft: {trade.playerName || "Unknown"}</p>
                          </div>
                        </div>

                        <div className="ml-11 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Requested:</span>
                            <span className="text-sm">
                              {trade.requestedQuantity || trade.requestedItem?.quantity || 1}x{" "}
                              {trade.requestedItem?.name || "Unknown Item"}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {trade.requestedItem?.rarity || "common"}
                            </Badge>
                          </div>

                          {trade.offerMessage && (
                            <div className="flex items-start gap-2">
                              <span className="text-sm font-medium">Offered:</span>
                              <span className="text-sm text-muted-foreground italic">"{trade.offerMessage}"</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{trade.createdAt ? new Date(trade.createdAt).toLocaleString() : "Unknown time"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          className={`text-xs ${
                            trade.status === "accepted"
                              ? "bg-green-100 text-green-800"
                              : trade.status === "declined"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {trade.status === "accepted"
                            ? "✓ Completed"
                            : trade.status === "declined"
                              ? "✗ Declined"
                              : "⏳ Pending"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No trade requests yet</p>
                <p className="text-sm text-muted-foreground">
                  Trade history will appear here once users start making requests
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
