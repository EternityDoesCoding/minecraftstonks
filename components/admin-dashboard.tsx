"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import {
  BarChart3,
  Users,
  Package,
  TrendingUp,
  Shield,
  Database,
  Activity,
  Settings,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react"
import type { AdminDashboardProps } from "./admin-dashboard-props" // Declare AdminDashboardProps

export function AdminDashboard({
  inventory,
  tradeRequests,
  webhookConfig,
  onUpdateItem,
  onDeleteItem,
  onUpdatePassword,
  onClearTradeLog, // Added onClearTradeLog prop
}: AdminDashboardProps) {
  const [adminPassword, setAdminPassword] = useState("")
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false)

  const totalItems = inventory?.length || 0
  const publicItems = inventory?.filter((item) => item.isPublic).length || 0
  const privateItems = totalItems - publicItems
  const pendingTrades = tradeRequests?.filter((request) => request.status === "pending").length || 0
  const completedTrades = tradeRequests?.filter((request) => request.status === "accepted").length || 0

  const rarityData = [
    { name: "Common", value: inventory?.filter((item) => item.rarity === "common").length || 0, color: "#6b7280" },
    { name: "Rare", value: inventory?.filter((item) => item.rarity === "rare").length || 0, color: "#3b82f6" },
    { name: "Epic", value: inventory?.filter((item) => item.rarity === "epic").length || 0, color: "#8b5cf6" },
    {
      name: "Legendary",
      value: inventory?.filter((item) => item.rarity === "legendary").length || 0,
      color: "#eab308",
    },
  ]

  const categoryData = Array.from(new Set(inventory?.map((item) => item.category) || [])).map((category) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: inventory?.filter((item) => item.category === category).length || 0,
  }))

  const tradeActivityData = [
    { name: "12am", trades: 2 },
    { name: "1am", trades: 1 },
    { name: "2am", trades: 0 },
    { name: "3am", trades: 1 },
    { name: "4am", trades: 0 },
    { name: "5am", trades: 0 },
    { name: "6am", trades: 3 },
    { name: "7am", trades: 5 },
    { name: "8am", trades: 8 },
    { name: "9am", trades: 12 },
    { name: "10am", trades: 15 },
    { name: "11am", trades: 18 },
    { name: "12pm", trades: 22 },
    { name: "1pm", trades: 25 },
    { name: "2pm", trades: 20 },
    { name: "3pm", trades: 28 },
    { name: "4pm", trades: 24 },
    { name: "5pm", trades: 30 },
    { name: "6pm", trades: 26 },
    { name: "7pm", trades: 22 },
    { name: "8pm", trades: 18 },
    { name: "9pm", trades: 15 },
    { name: "10pm", trades: 10 },
    { name: "11pm", trades: 6 },
  ]

  const toggleItemVisibility = (id: number, isPublic: boolean) => {
    onUpdateItem(id, { isPublic: !isPublic })
  }

  const handlePasswordUpdate = async () => {
    if (adminPassword.trim()) {
      await onUpdatePassword(adminPassword.trim())
      setAdminPassword("")
      setPasswordUpdateSuccess(true)
      setTimeout(() => setPasswordUpdateSuccess(false), 3000)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Admin Dashboard Overview
          </CardTitle>
          <CardDescription>System statistics and management controls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-primary" />
                <span className="font-medium">Total Items</span>
              </div>
              <p className="text-2xl font-bold">{totalItems}</p>
              <p className="text-sm text-muted-foreground">
                {publicItems} public, {privateItems} private
              </p>
            </div>
            <div className="p-4 bg-secondary/10 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                <span className="font-medium">Pending Trades</span>
              </div>
              <p className="text-2xl font-bold">{pendingTrades}</p>
              <p className="text-sm text-muted-foreground">{completedTrades} completed</p>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-accent" />
                <span className="font-medium">Active Players</span>
              </div>
              <p className="text-2xl font-bold">
                {Array.from(new Set(tradeRequests?.map((request) => request.discord_user) || [])).length}
              </p>
              <p className="text-sm text-muted-foreground">Unique traders</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5" />
                <span className="font-medium">Webhook Status</span>
              </div>
              <p className="text-2xl font-bold">{webhookConfig.enabled ? "Active" : "Inactive"}</p>
              <p className="text-sm text-muted-foreground">Discord integration</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-card/80 backdrop-blur-sm border-2 border-border">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Control</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/80 backdrop-blur-sm border-2 border-border">
              <CardHeader>
                <CardTitle>Items by Rarity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={rarityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {rarityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-2 border-border">
              <CardHeader>
                <CardTitle>Items by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0891b2" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/80 backdrop-blur-sm border-2 border-border">
            <CardHeader>
              <CardTitle>Trade Activity (Today)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={tradeActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="trades" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card className="bg-card/80 backdrop-blur-sm border-2 border-border">
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>Control item visibility and manage your inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventory?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/20 rounded flex items-center justify-center">
                        <span className="font-bold text-sm">{item.quantity}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {item.rarity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          {item.isPublic ? (
                            <Badge className="text-xs bg-green-100 text-green-800">Public</Badge>
                          ) : (
                            <Badge className="text-xs bg-red-100 text-red-800">Private</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleItemVisibility(item.id, item.isPublic || false)}
                        className="bg-transparent"
                      >
                        {item.isPublic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                        onClick={() => onDeleteItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )) || <p className="text-muted-foreground">No items in inventory</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="bg-card/80 backdrop-blur-sm border-2 border-border">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Overview of trading activity and user statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-primary/10 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="font-medium">Total Traders</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {Array.from(new Set(tradeRequests?.map((request) => request.discordUser) || [])).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Unique users</p>
                  </div>
                  <div className="p-4 bg-secondary/10 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-secondary" />
                      <span className="font-medium">Total Trades</span>
                    </div>
                    <p className="text-2xl font-bold">{tradeRequests?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">All time</p>
                  </div>
                  <div className="p-4 bg-accent/10 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-accent" />
                      <span className="font-medium">Success Rate</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {tradeRequests?.length ? Math.round((completedTrades / tradeRequests.length) * 100) : 0}%
                    </p>
                    <p className="text-sm text-muted-foreground">Accepted trades</p>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        Trade Log Management
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Clear all trade history and start fresh. This action cannot be undone.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                      onClick={onClearTradeLog}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Trade Log
                    </Button>
                  </div>
                </div>

                {tradeRequests && tradeRequests.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Recent Activity</h4>
                    {tradeRequests
                      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                      .slice(0, 5)
                      .map((trade, index) => (
                        <div
                          key={`${trade.id}-${index}`}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                              <Users className="w-3 h-3" />
                            </div>
                            <div>
                              <span className="text-sm font-medium">{trade.discordUser}</span>
                              <p className="text-xs text-muted-foreground">
                                Requested {trade.requestedQuantity || 1}x {trade.requestedItem?.name}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={`text-xs ${
                              trade.status === "accepted"
                                ? "bg-green-100 text-green-800"
                                : trade.status === "declined"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {trade.status}
                          </Badge>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card className="bg-card/80 backdrop-blur-sm border-2 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Settings
              </CardTitle>
              <CardDescription>Configure dashboard and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Security Settings
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Change Admin Password</label>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="New admin password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                      />
                      <Button className="minecraft-button" onClick={handlePasswordUpdate}>
                        Update
                      </Button>
                    </div>
                    {passwordUpdateSuccess && (
                      <p className="text-green-600 text-sm mt-2">Password updated successfully!</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Data Management
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                    <div>
                      <p className="font-medium">Export Data</p>
                      <p className="text-sm text-muted-foreground">Download all inventory and trade data</p>
                    </div>
                    <Button variant="outline" className="bg-transparent">
                      Export JSON
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                    <div>
                      <p className="font-medium">Clear Trade History</p>
                      <p className="text-sm text-muted-foreground">Remove all completed and declined trades</p>
                    </div>
                    <Button
                      variant="outline"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                    >
                      Clear History
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
