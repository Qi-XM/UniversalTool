"use client"

import { useState, useEffect, useCallback } from "react"
import { Activity, Database, Users, ShoppingCart, BarChart } from "lucide-react"
import Header from "./header"
import Sidebar from "./sidebar"
import ServerSelector from "./server-selector"
import TestingPanel from "./testing-panel"
import type { Server as ServerType } from "@/types/server"
import type { BusinessService } from "@/types/business"

// 业务服务数据
const businessServices: BusinessService[] = [
  {
    id: "user",
    name: "用户服务",
    icon: Users,
    functions: [
      {
        id: "login",
        name: "用户登录",
        params: [
          { id: "username", name: "用户名", type: "text", defaultValue: "admin" },
          { id: "password", name: "密码", type: "password" },
        ],
      },
      {
        id: "register",
        name: "用户注册",
        params: [
          { id: "username", name: "用户名", type: "text" },
          { id: "password", name: "密码", type: "password" },
          { id: "email", name: "邮箱", type: "email", defaultValue: "user@example.com" },
        ],
      },
      {
        id: "profile",
        name: "用户信息",
        params: [{ id: "userId", name: "用户ID", type: "text", defaultValue: "1001" }],
        autoExecute: true,
      },
    ],
  },
  {
    id: "order",
    name: "订单服务",
    icon: ShoppingCart,
    functions: [
      {
        id: "create",
        name: "创建订单",
        params: [
          { id: "userId", name: "用户ID", type: "text", defaultValue: "1001" },
          { id: "productId", name: "产品ID", type: "text", defaultValue: "P2001" },
          { id: "quantity", name: "数量", type: "number", defaultValue: 1 },
        ],
        displayMode: "json",
      },
      {
        id: "query",
        name: "查询订单",
        params: [{ id: "orderId", name: "订单ID", type: "text", defaultValue: "ORD-2023-001" }],
        autoExecute: true,
        displayMode: "table", // 添加表格显示配置
      },
      {
        id: "cancel",
        name: "取消订单",
        params: [{ id: "orderId", name: "订单ID", type: "text" }],
        displayMode: "json",
      },
    ],
  },
  {
    id: "product",
    name: "产品服务",
    icon: Database,
    functions: [
      {
        id: "list",
        name: "产品列表",
        params: [
          { id: "page", name: "页码", type: "number", defaultValue: 1 },
          { id: "size", name: "每页数量", type: "number", defaultValue: 10 },
        ],
        autoExecute: true,
        displayMode: "table", // 添加表格显示配置
      },
      {
        id: "detail",
        name: "产品详情",
        params: [{ id: "productId", name: "产品ID", type: "text", defaultValue: "P2001" }],
        displayMode: "json", // 添加JSON显示配置
      },
    ],
  },
  {
    id: "analytics",
    name: "数据分析",
    icon: BarChart,
    functions: [
      {
        id: "sales",
        name: "销售分析",
        params: [
          { id: "startDate", name: "开始日期", type: "date", defaultValue: "2023-01-01" },
          { id: "endDate", name: "结束日期", type: "date", defaultValue: "2023-12-31" },
        ],
      },
      {
        id: "users",
        name: "用户分析",
        params: [
          { id: "period", name: "时间段", type: "select", options: ["日", "周", "月", "年"], defaultValue: "月" },
        ],
        autoExecute: true,
      },
    ],
  },
]

export default function BusinessTestingTool() {
  // 当前选中的业务服务
  const [selectedService, setSelectedService] = useState<BusinessService | null>(businessServices[0])
  // 当前选中的功能
  const [selectedFunction, setSelectedFunction] = useState<string | null>(businessServices[0].functions[0].id)
  // 服务器列表
  const [servers, setServers] = useState<ServerType[]>([])
  // 当前选中的服务器
  const [selectedServer, setSelectedServer] = useState<ServerType | null>(null)
  // 测试结果
  const [testResult, setTestResult] = useState<string>("")

  // 初始化时从本地存储加载服务器列表
  useEffect(() => {
    try {
      const savedServers = localStorage.getItem("servers")
      if (savedServers) {
        const serverList = JSON.parse(savedServers)
        // 确保所有服务器都有serviceId字段
        const updatedServerList = serverList.map((server: any) => ({
          ...server,
          serviceId: server.serviceId || "user", // 默认为用户服务
        }))
        setServers(updatedServerList)
      } else {
        // 使用默认服务器
        const defaultServers = getDefaultServers()
        setServers(defaultServers)
        localStorage.setItem("servers", JSON.stringify(defaultServers))
      }
    } catch (e) {
      console.error("解析服务器列表失败", e)
      // 使用默认服务器
      const defaultServers = getDefaultServers()
      setServers(defaultServers)
      localStorage.setItem("servers", JSON.stringify(defaultServers))
    }
  }, [])

  // 获取默认服务器列表
  const getDefaultServers = () => {
    return [
      { id: "1", name: "用户服务-开发环境", address: "http://dev-api.example.com/user", serviceId: "user" },
      { id: "2", name: "用户服务-测试环境", address: "http://test-api.example.com/user", serviceId: "user" },
      { id: "3", name: "用户服务-生产环境", address: "http://api.example.com/user", serviceId: "user" },
      { id: "4", name: "订单服务-开发环境", address: "http://dev-api.example.com/order", serviceId: "order" },
      { id: "5", name: "订单服务-测试环境", address: "http://test-api.example.com/order", serviceId: "order" },
      { id: "6", name: "产品服务-开发环境", address: "http://dev-api.example.com/product", serviceId: "product" },
      { id: "7", name: "数据分析-开发环境", address: "http://dev-api.example.com/analytics", serviceId: "analytics" },
    ]
  }

  // 当服务变更时，选择该服务的第一个服务器
  useEffect(() => {
    if (selectedService) {
      const serviceServers = servers.filter((server) => server.serviceId === selectedService.id)
      if (serviceServers.length > 0) {
        setSelectedServer(serviceServers[0])
      } else {
        setSelectedServer(null)
      }

      // 默认选择第一个功能
      setSelectedFunction(selectedService.functions[0].id)

      // 清空测试结果
      setTestResult("")
    }
  }, [selectedService, servers])

  // 执行测试
  const handleRunTest = useCallback(
    (params: Record<string, any>) => {
      console.log("执行测试，参数:", params)

      if (!selectedService || !selectedFunction || !selectedServer) {
        setTestResult(JSON.stringify({ error: "请选择服务、功能和服务器" }, null, 2))
        return
      }

      // 模拟API调用
      setTestResult("正在请求...")

      // 使用setTimeout模拟异步请求
      setTimeout(() => {
        try {
          const currentFunction = selectedService.functions.find((f) => f.id === selectedFunction)

          // 生成更多的表格列数据，以便触发横向滚动
          const generateTableData = () => {
            return Array.from({ length: 20 }, (_, i) => {
              const baseData = {
                index: i,
                id: `ID-${1000 + i}`,
                value: `测试数据 ${i}`,
                description: `这是第 ${i} 项的详细描述信息，包含更多文本以测试单元格内容截断和提示。`,
                status: i % 3 === 0 ? "成功" : i % 3 === 1 ? "处理中" : "失败",
                createTime: new Date(Date.now() - i * 86400000).toISOString(),
                updateTime: new Date(Date.now() - i * 43200000).toISOString(),
                amount: Math.round(Math.random() * 10000) / 100,
                quantity: Math.floor(Math.random() * 100) + 1,
                price: Math.round(Math.random() * 100000) / 100,
                discount: Math.round(Math.random() * 50) / 100,
                tax: Math.round(Math.random() * 1700) / 100,
                total: Math.round(Math.random() * 200000) / 100,
                currency: ["CNY", "USD", "EUR", "GBP", "JPY"][Math.floor(Math.random() * 5)],
                paymentMethod: ["支付宝", "微信", "银行卡", "现金", "信用卡"][Math.floor(Math.random() * 5)],
                deliveryMethod: ["快递", "自提", "同城配送", "国际物流"][Math.floor(Math.random() * 4)],
                customerName: `客户 ${i}`,
                customerPhone: `1${Math.floor(Math.random() * 10000000000)}`,
                customerEmail: `customer${i}@example.com`,
                customerAddress: `测试地址 ${i}，测试城市，测试省份，测试国家`,
                notes: `这是一段非常长的备注信息，用于测试表格的横向滚动功能。包含了很多额外的文本内容，确保能够触发横向滚动条。${i}`,
                tags: ["标签A", "标签B", "标签C", "标签D", "标签E"].slice(0, Math.floor(Math.random() * 5) + 1),
                priority: ["高", "中", "低"][Math.floor(Math.random() * 3)],
                department: ["销售部", "技术部", "客服部", "财务部"][Math.floor(Math.random() * 4)],
                operator: `操作员 ${Math.floor(Math.random() * 100) + 1}`,
                approver: `审批人 ${Math.floor(Math.random() * 50) + 1}`,
                approvalStatus: ["已批准", "待批准", "已拒绝"][Math.floor(Math.random() * 3)],
                approvalTime: new Date(Date.now() - i * 129600000).toISOString(),
                extraField1: `额外字段 1 - ${i}`,
                extraField2: `额外字段 2 - ${i}`,
                extraField3: `额外字段 3 - ${i}`,
                extraField4: `额外字段 4 - ${i}`,
                extraField5: `额外字段 5 - ${i}`,
              }

              // 根据服务类型添加特定字段
              if (selectedService.id === "product") {
                return {
                  ...baseData,
                  productCode: `P${1000 + i}`,
                  productName: `产品名称 ${i}`,
                  category: ["电子产品", "家居用品", "食品", "服装", "图书"][Math.floor(Math.random() * 5)],
                  brand: `品牌 ${Math.floor(Math.random() * 20) + 1}`,
                  supplier: `供应商 ${Math.floor(Math.random() * 10) + 1}`,
                  stockQuantity: Math.floor(Math.random() * 1000),
                  unit: ["个", "箱", "套", "件", "千克"][Math.floor(Math.random() * 5)],
                  specifications: `规格信息 ${i}`,
                  productionDate: new Date(Date.now() - i * 2592000000).toISOString(),
                  expiryDate: new Date(Date.now() + i * 2592000000).toISOString(),
                  shelfLife: `${Math.floor(Math.random() * 36) + 1} 个月`,
                  storageConditions: ["常温", "冷藏", "冷冻", "避光"][Math.floor(Math.random() * 4)],
                }
              } else if (selectedService.id === "order") {
                return {
                  ...baseData,
                  orderNumber: `ORD-${2023}-${1000 + i}`,
                  orderType: ["普通订单", "批发订单", "预售订单", "定制订单"][Math.floor(Math.random() * 4)],
                  orderStatus: ["待付款", "已付款", "已发货", "已完成", "已取消"][Math.floor(Math.random() * 5)],
                  paymentStatus: ["未支付", "部分支付", "已支付", "已退款"][Math.floor(Math.random() * 4)],
                  deliveryStatus: ["未发货", "已发货", "已签收", "已退货"][Math.floor(Math.random() * 4)],
                  deliveryCompany: ["顺丰", "圆通", "中通", "申通", "韵达"][Math.floor(Math.random() * 5)],
                  trackingNumber: `SF${Math.floor(Math.random() * 1000000000)}`,
                  deliveryAddress: `配送地址 ${i}，测试城市，测试省份，测试国家`,
                  recipientName: `收件人 ${i}`,
                  recipientPhone: `1${Math.floor(Math.random() * 10000000000)}`,
                  invoiceType: ["普通发票", "增值税发票", "电子发票", "无需发票"][Math.floor(Math.random() * 4)],
                  invoiceTitle: `发票抬头 ${i}`,
                  invoiceContent: `发票内容 ${i}`,
                  invoiceAmount: Math.round(Math.random() * 200000) / 100,
                  orderSource: ["网站", "APP", "微信小程序", "电话", "线下"][Math.floor(Math.random() * 5)],
                  promotionCode: Math.random() > 0.5 ? `PROMO${Math.floor(Math.random() * 10000)}` : null,
                  giftWrapping: Math.random() > 0.7,
                  giftMessage: Math.random() > 0.7 ? `礼品留言 ${i}` : null,
                }
              }

              return baseData
            })
          }

          // 模拟返回结果
          const mockResult = {
            success: true,
            requestTime: new Date().toISOString(),
            server: selectedServer.address,
            service: selectedService.name,
            function: currentFunction?.name,
            params: params,
            result: {
              code: 200,
              message: "操作成功",
              data: {
                id: Math.floor(Math.random() * 1000),
                timestamp: Date.now(),
                ...params,
                // 添加一些额外数据以测试水平滚动
                extraLongData: "这是一段非常长的文本，用于测试水平滚动功能。".repeat(10),
                nestedData: {
                  level1: {
                    level2: {
                      level3: {
                        level4: {
                          level5: "深层嵌套数据",
                        },
                      },
                    },
                  },
                },
                // 表格数据 - 使用生成的更多列数据
                arrayData: generateTableData(),
              },
            },
          }

          console.log("生成的测试结果:", mockResult)
          setTestResult(JSON.stringify(mockResult, null, 2))
        } catch (error) {
          console.error("生成测试结果时出错:", error)
          setTestResult(JSON.stringify({ error: "生成测试结果时出错" }, null, 2))
        }
      }, 1000)
    },
    [selectedService, selectedFunction, selectedServer],
  )

  // 当功能变更时，如果是自动执行功能，则自动执行测试
  useEffect(() => {
    if (selectedService && selectedFunction && selectedServer) {
      const currentFunction = selectedService.functions.find((f) => f.id === selectedFunction)
      if (currentFunction?.autoExecute) {
        // 构建默认参数
        const defaultParams: Record<string, any> = {}
        currentFunction.params.forEach((param) => {
          if (param.defaultValue !== undefined) {
            defaultParams[param.id] = param.defaultValue
          }
        })

        // 自动执行测试
        console.log("自动执行测试，功能:", currentFunction.name, "参数:", defaultParams)
        handleRunTest(defaultParams)
      }
    }
  }, [selectedFunction, selectedService, selectedServer, handleRunTest])

  // 选择业务服务
  const handleSelectService = (service: BusinessService) => {
    setSelectedService(service)
  }

  // 选择功能
  const handleSelectFunction = (functionId: string) => {
    setSelectedFunction(functionId)
  }

  // 选择服务器
  const handleSelectServer = (server: ServerType) => {
    setSelectedServer(server)
  }

  // 添加服务器
  const handleAddServer = (server: ServerType) => {
    const newServers = [...servers, server]
    setServers(newServers)
    localStorage.setItem("servers", JSON.stringify(newServers))
  }

  // 编辑服务器
  const handleEditServer = (server: ServerType) => {
    const newServers = servers.map((s) => (s.id === server.id ? server : s))
    setServers(newServers)
    localStorage.setItem("servers", JSON.stringify(newServers))
  }

  // 删除服务器
  const handleDeleteServer = (serverId: string) => {
    const newServers = servers.filter((s) => s.id !== serverId)
    setServers(newServers)
    localStorage.setItem("servers", JSON.stringify(newServers))

    if (selectedServer?.id === serverId) {
      // 如果删除的是当前选中的服务器，则选择同一服务的第一个服务器
      const serviceServers = newServers.filter((s) => selectedService && s.serviceId === selectedService.id)
      setSelectedServer(serviceServers.length > 0 ? serviceServers[0] : null)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-white to-gray-100 overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          services={businessServices}
          selectedServiceId={selectedService?.id}
          onSelectService={handleSelectService}
        />

        <div className="flex-1 flex flex-col overflow-hidden backdrop-blur-sm bg-white/70">
          {selectedService && (
            <>
              <div className="p-4 border-b">
                <ServerSelector
                  servers={servers}
                  selectedServer={selectedServer}
                  onSelectServer={handleSelectServer}
                  onAddServer={handleAddServer}
                  onEditServer={handleEditServer}
                  onDeleteServer={handleDeleteServer}
                  currentServiceId={selectedService.id}
                />
              </div>

              <div className="flex-1 overflow-hidden">
                <TestingPanel
                  service={selectedService}
                  selectedFunctionId={selectedFunction}
                  onSelectFunction={handleSelectFunction}
                  onRunTest={handleRunTest}
                  testResult={testResult}
                />
              </div>
            </>
          )}

          {!selectedService && (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Activity className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-medium">请从左侧选择业务服务</h3>
                <p className="mt-2">选择一个业务服务开始测试</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
