"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ResultTableProps {
  data: any[]
  onCellCopy?: (text: string) => void
}

export default function ResultTable({ data, onCellCopy }: ResultTableProps) {
  const [copiedCell, setCopiedCell] = useState<string | null>(null)

  // 如果数据为空或不是数组，返回空
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="text-sm text-muted-foreground">无表格数据</div>
  }

  // 获取所有列名
  const columns = Array.from(
    new Set(
      data.flatMap((item) => {
        return Object.keys(item)
      }),
    ),
  )

  // 复制单元格内容
  const copyToClipboard = (text: string, cellId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCell(cellId)
      setTimeout(() => setCopiedCell(null), 2000)
      if (onCellCopy) onCellCopy(text)
    })
  }

  return (
    <div className="w-full h-full overflow-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-2 text-left font-medium text-gray-500 border-b whitespace-nowrap">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b hover:bg-gray-50">
              {columns.map((column) => {
                const cellValue = row[column]
                const cellContent =
                  cellValue !== undefined
                    ? typeof cellValue === "object"
                      ? JSON.stringify(cellValue)
                      : String(cellValue)
                    : ""
                const cellId = `cell-${rowIndex}-${column}`

                return (
                  <td key={column} className="px-4 py-2 relative group whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="truncate max-w-xs">{cellContent}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => copyToClipboard(cellContent, cellId)}
                            >
                              {copiedCell === cellId ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{copiedCell === cellId ? "已复制!" : "复制内容"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
