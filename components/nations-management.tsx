"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Flag, Plus, Edit, Trash2, X } from "lucide-react"
import type { Nation } from "@/lib/database"

interface NationsManagementProps {
  nations: Nation[]
  onCreateNation: (nation: Omit<Nation, "id" | "created_at" | "updated_at">) => Promise<void>
  onUpdateNation: (id: number, updates: Partial<Omit<Nation, "id" | "created_at" | "updated_at">>) => Promise<void>
  onDeleteNation: (id: number) => Promise<void>
}

export function NationsManagement({ nations, onCreateNation, onUpdateNation, onDeleteNation }: NationsManagementProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingNation, setEditingNation] = useState<Nation | null>(null)

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-2 border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="w-5 h-5" />
          Nations Management
        </CardTitle>
        <CardDescription>Manage nations and their flags for item organization</CardDescription>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="minecraft-button w-fit">
              <Plus className="w-4 h-4 mr-2" />
              Add Nation
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card/95 backdrop-blur-sm border-2 border-border">
            <DialogHeader>
              <DialogTitle>Create New Nation</DialogTitle>
            </DialogHeader>
            <NationForm
              onSave={async (nationData) => {
                await onCreateNation(nationData)
                setIsCreateDialogOpen(false)
              }}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nations.map((nation) => (
            <div key={nation.id} className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {nation.flag_url ? (
                    <img
                      src={nation.flag_url || "/placeholder.svg"}
                      alt={`${nation.name} flag`}
                      className="w-12 h-8 object-cover border rounded"
                    />
                  ) : (
                    <div className="w-12 h-8 bg-muted border rounded flex items-center justify-center">
                      <Flag className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{nation.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      ID: {nation.id}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-8 h-8 p-0 bg-transparent"
                        onClick={() => setEditingNation(nation)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card/95 backdrop-blur-sm border-2 border-border">
                      <DialogHeader>
                        <DialogTitle>Edit Nation</DialogTitle>
                      </DialogHeader>
                      <NationForm
                        nation={editingNation}
                        onSave={async (nationData) => {
                          if (editingNation) {
                            await onUpdateNation(editingNation.id, nationData)
                            setEditingNation(null)
                          }
                        }}
                        onCancel={() => setEditingNation(null)}
                      />
                    </DialogContent>
                  </Dialog>
                  {nation.name !== "Unassigned" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-8 h-8 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                      onClick={() => onDeleteNation(nation.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
              {nation.description && <p className="text-sm text-muted-foreground">{nation.description}</p>}
            </div>
          ))}
        </div>
        {nations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No nations created yet. Add your first nation to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function NationForm({
  nation,
  onSave,
  onCancel,
}: {
  nation?: Nation | null
  onSave: (nation: Omit<Nation, "id" | "created_at" | "updated_at">) => Promise<void>
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: nation?.name || "",
    flag_url: nation?.flag_url || "",
    description: nation?.description || "",
  })
  const [flagPreview, setFlagPreview] = useState<string>(nation?.flag_url || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFlagUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setFlagPreview(result)
        setFormData((prev) => ({ ...prev, flag_url: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveFlag = () => {
    setFlagPreview("")
    setFormData((prev) => ({ ...prev, flag_url: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsSubmitting(true)
    try {
      await onSave(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Nation name *"
        value={formData.name}
        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        required
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">Flag Image</label>
        {flagPreview ? (
          <div className="relative w-24 h-16 border-2 border-border rounded">
            <img
              src={flagPreview || "/placeholder.svg"}
              alt="Flag preview"
              className="w-full h-full object-cover rounded"
            />
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="absolute -top-2 -right-2 w-6 h-6 p-0"
              onClick={handleRemoveFlag}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div className="w-24 h-16 border-2 border-dashed border-muted-foreground/25 rounded flex items-center justify-center">
            <Flag className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
        <div className="flex gap-2">
          <Input type="file" accept="image/*" onChange={handleFlagUpload} className="flex-1" />
          {flagPreview && (
            <Button type="button" variant="outline" size="sm" onClick={handleRemoveFlag}>
              Remove
            </Button>
          )}
        </div>
      </div>

      <Textarea
        placeholder="Nation description (optional)"
        value={formData.description}
        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
        rows={3}
      />

      <div className="flex gap-2">
        <Button type="submit" className="minecraft-button flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : nation ? "Update Nation" : "Create Nation"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
