"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, Plus, X, ImageIcon } from "lucide-react"
import type { Item } from "@/app/page"

interface ItemUploadFormProps {
  onAddItem: (item: Omit<Item, "id">) => void
}

export function ItemUploadForm({ onAddItem }: ItemUploadFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: 1,
    rarity: "common" as const,
    category: "",
    imageUrl: "",
    nationImageUrl: "",
  })

  const [bulkItems, setBulkItems] = useState<Array<Omit<Item, "id">>>([])
  const [imagePreview, setImagePreview] = useState<string>("")
  const [nationImagePreview, setNationImagePreview] = useState<string>("")
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const nationFileInputRef = useRef<HTMLInputElement>(null)
  const [quantityInput, setQuantityInput] = useState("1")

  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        setFormData((prev) => ({ ...prev, imageUrl: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNationFileUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setNationImagePreview(result)
        setFormData((prev) => ({ ...prev, nationImageUrl: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleNationFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleNationFileUpload(files[0])
    }
  }

  const clearImage = () => {
    setImagePreview("")
    setFormData((prev) => ({ ...prev, imageUrl: "" }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const clearNationImage = () => {
    setNationImagePreview("")
    setFormData((prev) => ({ ...prev, nationImageUrl: "" }))
    if (nationFileInputRef.current) {
      nationFileInputRef.current.value = ""
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim()) {
      onAddItem(formData)
      setFormData({
        name: "",
        description: "",
        quantity: 1,
        rarity: "common",
        category: "",
        imageUrl: "",
        nationImageUrl: "",
      })
      setQuantityInput("1")
      setImagePreview("")
      setNationImagePreview("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      if (nationFileInputRef.current) {
        nationFileInputRef.current.value = ""
      }
    }
  }

  const handleBulkAdd = () => {
    bulkItems.forEach((item) => onAddItem(item))
    setBulkItems([])
  }

  const addToBulk = () => {
    if (formData.name.trim()) {
      setBulkItems((prev) => [...prev, formData])
      setFormData({
        name: "",
        description: "",
        quantity: 1,
        rarity: "common",
        category: "",
        imageUrl: "",
        nationImageUrl: "",
      })
      setQuantityInput("1")
      setImagePreview("")
      setNationImagePreview("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      if (nationFileInputRef.current) {
        nationFileInputRef.current.value = ""
      }
    }
  }

  const removeFromBulk = (index: number) => {
    setBulkItems((prev) => prev.filter((_, i) => i !== index))
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

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Add New Item
          </CardTitle>
          <CardDescription>Add items to your inventory with images and detailed information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Item Image</label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {imagePreview ? (
                  <div className="relative">
                    <div className="minecraft-item-icon w-24 h-24 mx-auto mb-2">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex justify-center gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Change
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearImage}
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop an image here, or click to select
                    </p>
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Image
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nation Image (appears in tooltip)</label>
              <div className="relative border-2 border-dashed rounded-lg p-4 border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                {nationImagePreview ? (
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto mb-2 rounded border overflow-hidden">
                      <img
                        src={nationImagePreview || "/placeholder.svg"}
                        alt="Nation Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex justify-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => nationFileInputRef.current?.click()}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Change
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearNationImage}
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground mb-2">Optional nation/flag image for tooltip</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => nationFileInputRef.current?.click()}
                    >
                      <Upload className="w-3 h-3 mr-2" />
                      Choose Nation Image
                    </Button>
                  </div>
                )}
                <input
                  ref={nationFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleNationFileInputChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Item name *"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
              <Input
                placeholder="Category (e.g., weapons, tools)"
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              />
            </div>

            <Textarea
              placeholder="Item description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity (max: 64)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="64"
                    value={formData.quantity}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value) || 1
                      setFormData((prev) => ({ ...prev, quantity: value }))
                      setQuantityInput(value.toString())
                    }}
                    className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                  />
                  <Input
                    type="number"
                    min="1"
                    max="64"
                    value={quantityInput}
                    onChange={(e) => {
                      setQuantityInput(e.target.value)
                    }}
                    onBlur={(e) => {
                      const value = Number.parseInt(e.target.value)
                      if (isNaN(value) || value < 1) {
                        const clampedValue = 1
                        setFormData((prev) => ({ ...prev, quantity: clampedValue }))
                        setQuantityInput(clampedValue.toString())
                      } else if (value > 64) {
                        const clampedValue = 64
                        setFormData((prev) => ({ ...prev, quantity: clampedValue }))
                        setQuantityInput(clampedValue.toString())
                      } else {
                        setFormData((prev) => ({ ...prev, quantity: value }))
                        setQuantityInput(value.toString())
                      }
                    }}
                    className="w-20"
                  />
                </div>
                <div className="text-xs text-muted-foreground">Current quantity: {formData.quantity}</div>
              </div>

              <Select
                value={formData.rarity}
                onValueChange={(value: any) => setFormData((prev) => ({ ...prev, rarity: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rarity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="common">Common</SelectItem>
                  <SelectItem value="rare">Rare</SelectItem>
                  <SelectItem value="epic">Epic</SelectItem>
                  <SelectItem value="legendary">Legendary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="minecraft-button flex-1">
                Add Item
              </Button>
              <Button
                type="button"
                onClick={addToBulk}
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
              >
                <Plus className="w-4 h-4" />
                Add to Bulk
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {bulkItems.length > 0 && (
        <Card className="bg-card/80 backdrop-blur-sm border-2 border-border">
          <CardHeader>
            <CardTitle>Bulk Upload Queue ({bulkItems.length} items)</CardTitle>
            <CardDescription>Review items before adding them all to your inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {bulkItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`minecraft-item-icon w-12 h-12 bg-gradient-to-br ${getRarityColor(item.rarity)}`}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl || "/placeholder.svg"} alt={item.name} />
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
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={`text-xs bg-gradient-to-r ${getRarityColor(item.rarity)}`}
                        >
                          {item.rarity}
                        </Badge>
                        {item.category && (
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFromBulk(index)}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleBulkAdd} className="minecraft-button flex-1">
                Add All Items ({bulkItems.length})
              </Button>
              <Button onClick={() => setBulkItems([])} variant="outline">
                Clear Queue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
