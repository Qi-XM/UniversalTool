"use client"

import { useState } from "react"
import { Server, Plus, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import type { Server as ServerType } from "@/types/server"

interface ServerSelectorProps {
  servers: ServerType[]
  selectedServer: ServerType | null
  onSelectServer: (server: ServerType) => void
  onAddServer: (server: ServerType) => void
  onEditServer: (server: ServerType) => void
  onDeleteServer: (serverId: string) => void
  currentServiceId: string // 添加当前服务ID
}

export default function ServerSelector({
  servers,
  selectedServer,
  onSelectServer,
  onAddServer,
  onEditServer,
  onDeleteServer,
  currentServiceId,
}: ServerSelectorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newServer, setNewServer] = useState<Partial<ServerType>>({
    name: "",
    address: "",
    serviceId: currentServiceId,
  })
  const [editingServer, setEditingServer] = useState<ServerType | null>(null)

  // 过滤当前服务的服务器
  const filteredServers = servers.filter((server) => server.serviceId === currentServiceId)

  // 处理服务器选择
  const handleServerChange = (serverId: string) => {
    const server = servers.find((s) => s.id === serverId)
    if (server) {
      onSelectServer(server)
    }
  }

  // 处理添加服务器
  const handleAddServer = () => {
    if (newServer.name && newServer.address) {
      onAddServer({
        id: Date.now().toString(),
        name: newServer.name,
        address: newServer.address,
        serviceId: currentServiceId,
      })
      setNewServer({ name: "", address: "", serviceId: currentServiceId })
      setIsAddDialogOpen(false)
    }
  }

  // 处理编辑服务器
  const handleEditServer = () => {
    if (editingServer && editingServer.name && editingServer.address) {
      onEditServer(editingServer)
      setEditingServer(null)
      setIsEditDialogOpen(false)
    }
  }

  // 打开编辑对话框
  const openEditDialog = (server: ServerType) => {
    setEditingServer({ ...server })
    setIsEditDialogOpen(true)
  }

  return (
    <Card className="flex items-center space-x-2 p-3 backdrop-blur-sm bg-white/70 border shadow-sm">
      <div className="flex items-center space-x-2 min-w-[300px]">
        <Server className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium">服务器:</span>

        <Select value={selectedServer?.id} onValueChange={handleServerChange}>
          <SelectTrigger className="flex-1 bg-white/70 backdrop-blur-sm">
            <SelectValue placeholder="选择服务器" />
          </SelectTrigger>
          <SelectContent>
            {filteredServers.length > 0 ? (
              filteredServers.map((server) => (
                <SelectItem key={server.id} value={server.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{server.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{server.address}</span>
                  </div>
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-server" disabled>
                暂无服务器，请添加
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* 添加服务器按钮 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="bg-white/70 backdrop-blur-sm">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="backdrop-blur-md bg-white/90">
          <DialogHeader>
            <DialogTitle>添加服务器</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">服务器名称</Label>
              <Input
                id="name"
                value={newServer.name}
                onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                className="bg-white/70"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">服务器地址</Label>
              <Input
                id="address"
                value={newServer.address}
                onChange={(e) => setNewServer({ ...newServer, address: e.target.value })}
                className="bg-white/70"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button onClick={handleAddServer}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑服务器按钮 */}
      {selectedServer && (
        <>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => openEditDialog(selectedServer)}
                className="bg-white/70 backdrop-blur-sm"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="backdrop-blur-md bg-white/90">
              <DialogHeader>
                <DialogTitle>编辑服务器</DialogTitle>
              </DialogHeader>
              {editingServer && (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">服务器名称</Label>
                    <Input
                      id="edit-name"
                      value={editingServer.name}
                      onChange={(e) => setEditingServer({ ...editingServer, name: e.target.value })}
                      className="bg-white/70"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-address">服务器地址</Label>
                    <Input
                      id="edit-address"
                      value={editingServer.address}
                      onChange={(e) => setEditingServer({ ...editingServer, address: e.target.value })}
                      className="bg-white/70"
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">取消</Button>
                </DialogClose>
                <Button onClick={handleEditServer}>保存</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* 删除服务器按钮 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDeleteServer(selectedServer.id)}
            className="bg-white/70 backdrop-blur-sm"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </>
      )}
    </Card>
  )
}
