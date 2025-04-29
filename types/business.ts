import type { LucideIcon } from "lucide-react"

export interface ParamDefinition {
  id: string
  name: string
  type: "text" | "number" | "password" | "email" | "date" | "select"
  options?: string[]
  defaultValue?: string | number // 添加默认值字段
}

export interface BusinessFunction {
  id: string
  name: string
  params: ParamDefinition[]
  autoExecute?: boolean // 添加自动执行标志
  displayMode?: "json" | "table" // 添加结果显示模式配置
}

export interface BusinessService {
  id: string
  name: string
  icon: LucideIcon
  functions: BusinessFunction[]
}
