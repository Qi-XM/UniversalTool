import { Activity } from "lucide-react"

export default function Header() {
  return (
    <header className="relative flex items-center justify-between p-4 bg-black text-white">
      <div className="flex items-center space-x-2">
        <Activity className="h-6 w-6" />
        <h1 className="text-xl font-bold">Universal Tool</h1>
      </div>
    </header>
  )
}
