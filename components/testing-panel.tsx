"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Zap, Copy, Check } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ResultTable from "./result-table"
import type { BusinessService } from "@/types/business"

interface TestingPanelProps {
  service: BusinessService
  selectedFunctionId: string | null
  onSelectFunction: (functionId: string) => void
  onRunTest: (params: Record<string, any>) => void
  testResult: string
}

export default function TestingPanel({
  service,
  selectedFunctionId,
  onSelectFunction,
  onRunTest,
  testResult,
}: TestingPanelProps) {
  const [params, setParams] = useState<Record<string, any>>({})
  const [parsedResult, setParsedResult] = useState<any>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const resultContainerRef = useRef<HTMLDivElement>(null)
  const [resultContainerHeight, setResultContainerHeight] = useState("400px")

  // 获取当前选中的功能
  const currentFunction = service.functions.find((f) => f.id === selectedFunctionId)

  // 当功能变更时，填充默认值
  useEffect(() => {
    if (currentFunction) {
      const defaultParams: Record<string, any> = {}
      currentFunction.params.forEach((param) => {
        if (param.defaultValue !== undefined) {
          defaultParams[param.id] = param.defaultValue
        }
      })
      setParams(defaultParams)
    }
  }, [currentFunction])

  // 当测试结果变更时，尝试解析JSON
  useEffect(() => {
    try {
      if (testResult && testResult !== "正在请求...") {
        const parsed = JSON.parse(testResult)
        setParsedResult(parsed)
      } else {
        setParsedResult(null)
      }
    } catch (e) {
      console.error("解析测试结果失败:", e)
      setParsedResult(null)
    }
  }, [testResult])

  // 根据窗口大小调整结果容器高度
  useEffect(() => {
    const updateHeight = () => {
      if (resultContainerRef.current) {
        const windowHeight = window.innerHeight
        const containerTop = resultContainerRef.current.getBoundingClientRect().top
        // 留出底部空间和一些额外的边距
        const height = windowHeight - containerTop - 40
        setResultContainerHeight(`${Math.max(200, height)}px`)
      }
    }

    updateHeight()
    window.addEventListener("resize", updateHeight)
    return () => window.removeEventListener("resize", updateHeight)
  }, [])

  // 处理参数变更
  const handleParamChange = (paramId: string, value: any) => {
    const newParams = { ...params, [paramId]: value }
    setParams(newParams)

    // 如果当前功能启用了自动执行，则在参数变更时执行测试
    if (currentFunction?.autoExecute) {
      setTimeout(() => onRunTest(newParams), 0)
    }
  }

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onRunTest(params)
  }

  // 复制测试结果
  const copyResult = () => {
    navigator.clipboard.writeText(testResult).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    })
  }

  // 检查是否有表格数据
  const hasTableData =
    parsedResult &&
    parsedResult.result &&
    parsedResult.result.data &&
    parsedResult.result.data.arrayData &&
    Array.isArray(parsedResult.result.data.arrayData)

  // 获取表格数据
  const getTableData = () => {
    if (hasTableData) {
      return parsedResult.result.data.arrayData
    }
    return []
  }

  // 根据当前功能配置决定是否显示表格
  const shouldShowTable = () => {
    return hasTableData && currentFunction && currentFunction.displayMode === "table"
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Tabs value={selectedFunctionId || ""} onValueChange={onSelectFunction} className="flex-1 flex flex-col">
        <div className="border-b px-4 bg-gray-100/30 backdrop-blur-sm">
          <TabsList className="h-12 bg-transparent">
            {service.functions.map((func) => (
              <TabsTrigger
                key={func.id}
                value={func.id}
                className="px-6 py-2 data-[state=active]:bg-white/80 data-[state=active]:backdrop-blur-md data-[state=active]:shadow-sm rounded-t-lg data-[state=active]:border-b-2 data-[state=active]:border-black transition-all flex items-center gap-1"
              >
                {func.name}
                {func.autoExecute && <Zap className="h-3 w-3 text-amber-500" title="自动执行" />}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {service.functions.map((func) => (
          <TabsContent key={func.id} value={func.id} className="flex-1 p-4 overflow-auto">
            <div className="flex flex-col gap-4">
              {/* 参数输入区域 */}
              <div className="bg-white/70 backdrop-blur-sm border rounded-md shadow-sm">
                <form ref={formRef} onSubmit={handleSubmit} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {func.params.map((param) => (
                      <div key={param.id} className="space-y-2">
                        <Label htmlFor={param.id}>
                          {param.name}
                          {param.defaultValue !== undefined && (
                            <span className="text-xs text-muted-foreground ml-2">(默认值)</span>
                          )}
                        </Label>

                        {param.type === "select" ? (
                          <Select
                            value={params[param.id] || ""}
                            onValueChange={(value) => handleParamChange(param.id, value)}
                          >
                            <SelectTrigger id={param.id}>
                              <SelectValue placeholder={`选择${param.name}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {param.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id={param.id}
                            type={param.type}
                            value={params[param.id] || ""}
                            onChange={(e) => handleParamChange(param.id, e.target.value)}
                            placeholder={`请输入${param.name}`}
                            className="bg-white/70 backdrop-blur-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {!func.autoExecute && (
                    <Button type="submit" className="mt-4 bg-black text-white hover:bg-black/80">
                      执行测试
                    </Button>
                  )}

                  {func.autoExecute && (
                    <div className="flex items-center mt-4 text-sm text-muted-foreground">
                      <Zap className="h-4 w-4 mr-2 text-amber-500" />
                      <span>此功能已启用自动执行，参数变更时将自动测试</span>
                    </div>
                  )}
                </form>
              </div>

              {/* 结果展示区域 */}
              <div className="flex-1 bg-white/70 backdrop-blur-sm border rounded-md shadow-sm">
                <div className="p-4 flex flex-col h-full">
                  <div className="text-sm font-medium mb-2 flex justify-between items-center">
                    <div className="flex items-center">
                      <span>测试结果</span>
                      {shouldShowTable() && <span className="ml-2 text-xs text-muted-foreground">(表格视图)</span>}
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={copyResult}
                            disabled={!testResult || testResult === "正在请求..."}
                          >
                            {copySuccess ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{copySuccess ? "已复制!" : "复制结果"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div
                    ref={resultContainerRef}
                    className="border rounded-md bg-gray-50"
                    style={{
                      height: resultContainerHeight,
                      overflow: "auto",
                    }}
                  >
                    {shouldShowTable() ? (
                      <div className="h-full w-full">
                        <ResultTable data={getTableData()} />
                      </div>
                    ) : (
                      <pre className="text-sm whitespace-pre p-4 min-w-max">{testResult || "暂无结果"}</pre>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
