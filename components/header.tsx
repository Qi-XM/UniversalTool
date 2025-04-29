import { Activity } from "lucide-react"
import { getCurrentWindow } from '@tauri-apps/api/window';

export default function Header() {
  const appWindow = getCurrentWindow();
  return (
    <header data-tauri-drag-region className="relative flex items-center justify-between p-4 bg-black text-white">
      <div className="flex items-center space-x-2">
        <Activity className="h-6 w-6" />
        <h1 className="text-xl font-bold">Universal Tool</h1>
      </div>
      <div className="absolute top-0 right-0 flex space-x-2 p-2 backdrop-blur-md bg-black/30 rounded-lg shadow-lg">
        <button
          onClick={() => appWindow.minimize()}
          className="w-4 h-4 flex items-center justify-center rounded-full bg-yellow-200 hover:bg-yellow-300 border border-yellow-500 transition duration-200"
        >
          <img
            src="https://api.iconify.design/mdi:window-minimize.svg"
            className="w-4 h-4 text-black"
            alt="minimize"
          />
        </button>

        <button
          onClick={async () => appWindow.toggleMaximize()}
          className="w-4 h-4 flex items-center justify-center rounded-full bg-green-300 hover:bg-green-400 border border-green-500 transition duration-200"
        >
          <img
            src="https://api.iconify.design/mdi:window-maximize.svg"
            className="w-4 h-4 text-black"
            alt="maximize"
          />
        </button>

        <button
          onClick={() => appWindow.close()}
          className="w-4 h-4 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 border border-red-500 transition duration-200"
        >
          <img
            src="https://api.iconify.design/mdi:close.svg"
            className="w-4 h-4 text-black"
            alt="close"
          />
        </button>
      </div>
    </header>
  )
}
