"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Webhook, Send, CheckCircle, XCircle, Bell, AlertCircle } from "lucide-react"
import type { WebhookConfig } from "@/app/page"

interface WebhookSettingsProps {
  config: WebhookConfig
  onUpdateConfig: (config: WebhookConfig) => void
}

export function WebhookSettings({ config, onUpdateConfig }: WebhookSettingsProps) {
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle")

  const handleTestWebhook = async () => {
    if (!config.url) return

    setTestStatus("testing")

    try {
      const response = await fetch("/api/webhook/discord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          webhookUrl: config.url,
          embeds: [
            {
              title: "🧪 Webhook Test",
              description: "This is a test message from your Minecraft Inventory Dashboard!",
              color: 0x0891b2,
              fields: [
                {
                  name: "Status",
                  value: "✅ Webhook is working correctly",
                  inline: false,
                },
              ],
              footer: {
                text: "Minecraft Inventory Dashboard",
              },
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      })

      if (response.ok) {
        setTestStatus("success")
      } else {
        setTestStatus("error")
      }
    } catch (error) {
      console.error("[v0] Webhook test error:", error)
      setTestStatus("error")
    }

    setTimeout(() => setTestStatus("idle"), 3000)
  }

  const updateConfig = (updates: Partial<WebhookConfig>) => {
    onUpdateConfig({ ...config, ...updates })
  }

  const updateEvents = (event: keyof WebhookConfig["events"], enabled: boolean) => {
    onUpdateConfig({
      ...config,
      events: { ...config.events, [event]: enabled },
    })
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="w-5 h-5" />
            Discord Webhook Configuration
          </CardTitle>
          <CardDescription>Configure Discord notifications for trade events and system updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Webhook URL</label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://discord.com/api/webhooks/..."
                  value={config.url}
                  onChange={(e) => updateConfig({ url: e.target.value })}
                />
                <Button
                  onClick={handleTestWebhook}
                  disabled={!config.url || testStatus === "testing"}
                  className="minecraft-button flex items-center gap-2"
                >
                  {testStatus === "testing" ? (
                    <>Testing...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Test
                    </>
                  )}
                </Button>
              </div>
              {testStatus === "success" && (
                <div className="flex items-center gap-2 mt-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Webhook test successful! Check your Discord channel.</span>
                </div>
              )}
              {testStatus === "error" && (
                <div className="flex items-center gap-2 mt-2 text-red-600">
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm">Webhook test failed. Check your URL and try again.</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Webhook</p>
                <p className="text-sm text-muted-foreground">Turn on Discord notifications</p>
              </div>
              <Switch checked={config.enabled} onCheckedChange={(enabled) => updateConfig({ enabled })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Event Notifications
          </CardTitle>
          <CardDescription>Choose which events trigger Discord notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
              <div>
                <p className="font-medium">New Trade Offers</p>
                <p className="text-sm text-muted-foreground">When someone makes a trade offer</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={config.events.newTrade ? "default" : "secondary"}>
                  {config.events.newTrade ? "Enabled" : "Disabled"}
                </Badge>
                <Switch
                  checked={config.events.newTrade}
                  onCheckedChange={(enabled) => updateEvents("newTrade", enabled)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
              <div>
                <p className="font-medium">Trade Accepted</p>
                <p className="text-sm text-muted-foreground">When you accept a trade offer</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={config.events.tradeAccepted ? "default" : "secondary"}>
                  {config.events.tradeAccepted ? "Enabled" : "Disabled"}
                </Badge>
                <Switch
                  checked={config.events.tradeAccepted}
                  onCheckedChange={(enabled) => updateEvents("tradeAccepted", enabled)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
              <div>
                <p className="font-medium">Trade Declined</p>
                <p className="text-sm text-muted-foreground">When you decline a trade offer</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={config.events.tradeDeclined ? "default" : "secondary"}>
                  {config.events.tradeDeclined ? "Enabled" : "Disabled"}
                </Badge>
                <Switch
                  checked={config.events.tradeDeclined}
                  onCheckedChange={(enabled) => updateEvents("tradeDeclined", enabled)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
              <div>
                <p className="font-medium">New Items Added</p>
                <p className="text-sm text-muted-foreground">When new items are added to inventory</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={config.events.newItem ? "default" : "secondary"}>
                  {config.events.newItem ? "Enabled" : "Disabled"}
                </Badge>
                <Switch
                  checked={config.events.newItem}
                  onCheckedChange={(enabled) => updateEvents("newItem", enabled)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm border-2 border-border">
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium mb-2">How to get your Discord Webhook URL:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Go to your Discord server settings</li>
                  <li>Navigate to Integrations → Webhooks</li>
                  <li>Click "New Webhook" or select an existing one</li>
                  <li>Copy the webhook URL and paste it above</li>
                  <li>Click "Test" to verify it works</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm border-2 border-border">
        <CardHeader>
          <CardTitle>Webhook Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
            <div>
              <p className="font-medium">Current Status</p>
              <p className="text-sm text-muted-foreground">
                {config.enabled && config.url ? "Active and configured" : "Inactive or not configured"}
              </p>
            </div>
            <Badge variant={config.enabled && config.url ? "default" : "secondary"} className="bg-secondary">
              {config.enabled && config.url ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
