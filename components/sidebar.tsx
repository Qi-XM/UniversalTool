"use client"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { BusinessService } from "@/types/business"

interface SidebarProps {
  services: BusinessService[]
  selectedServiceId: string | undefined
  onSelectService: (service: BusinessService) => void
}

export default function Sidebar({ services, selectedServiceId, onSelectService }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  return (
    <div
      className={cn(
        "h-full bg-gray-100/80 border-r overflow-hidden transition-all duration-300 backdrop-blur-sm relative",
        collapsed ? "w-16" : "w-56",
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-2 h-14">
          <h2
            className={cn(
              "text-lg font-semibold transition-opacity whitespace-nowrap",
              collapsed ? "opacity-0 w-0" : "opacity-100",
            )}
          >
            Service Category
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "h-8 w-8 rounded-full bg-black/10 hover:bg-black/20 flex-shrink-0",
              collapsed ? "absolute right-3 top-3" : "",
            )}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="space-y-1 px-2">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <button
                  key={service.id}
                  className={cn(
                    "flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors",
                    selectedServiceId === service.id ? "bg-black text-white" : "hover:bg-gray-200 hover:bg-opacity-70",
                    collapsed ? "justify-center" : "justify-start",
                  )}
                  onClick={() => onSelectService(service)}
                  title={service.name}
                >
                  <Icon className={cn("h-5 w-5 flex-shrink-0", collapsed ? "" : "mr-2")} />
                  <span
                    className={cn(
                      "transition-all duration-200 whitespace-nowrap",
                      collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100",
                    )}
                  >
                    {service.name}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
