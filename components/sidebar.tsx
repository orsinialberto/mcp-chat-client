"use client"

import { useState, useEffect, useRef } from "react"
import {
  MessageSquare,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Key,
} from "lucide-react"

interface Chat {
  id: string
  title: string
  createdAt: Date
  lastMessage?: string
  messageCount: number
}

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  currentChatId: string | null
  onChatSelect: (chatId: string | null) => void
  onNewChat: () => void
  selectedProvider: string
  selectedModel: string
  onProviderChange: (provider: string) => void
  onModelChange: (model: string) => void
  mcpServerUrl: string
  onMcpServerUrlChange: (url: string) => void
  isConnected: boolean
  onTestConnection: () => void
}

export function Sidebar({
  isOpen,
  onToggle,
  currentChatId,
  onChatSelect,
  onNewChat,
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
  mcpServerUrl,
  onMcpServerUrlChange,
  isConnected,
  onTestConnection,
}: SidebarProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [showSettings, setShowSettings] = useState(false)

  // Stati per il ridimensionamento
  const [sidebarWidth, setSidebarWidth] = useState(256) // 256px = w-64
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Stati per API keys dei due provider
  const [apiKeys, setApiKeys] = useState({
    groq: "",
    anthropic: "",
  })
  const [showApiKeys, setShowApiKeys] = useState({
    groq: false,
    anthropic: false,
  })
  const [apiKeyStatus, setApiKeyStatus] = useState({
    groq: 'unknown' as 'unknown' | 'valid' | 'invalid' | 'testing' | 'empty' | 'error',
    anthropic: 'unknown' as 'unknown' | 'valid' | 'invalid' | 'testing' | 'empty' | 'error',
  })

  // Carica chat, API keys e larghezza sidebar dal localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem("mcp-chats")
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
        }))
        setChats(parsedChats)
      } catch (error) {
        console.error("Errore caricamento chat:", error)
      }
    }

    // Carica API keys salvate
    const savedApiKeys = localStorage.getItem("mcp-api-keys")
    if (savedApiKeys) {
      try {
        const parsedKeys = JSON.parse(savedApiKeys)
        setApiKeys(parsedKeys)
      } catch (error) {
        console.error("Errore caricamento API keys:", error)
      }
    }

    // Carica larghezza sidebar salvata
    const savedWidth = localStorage.getItem("mcp-sidebar-width")
    if (savedWidth) {
      const width = Number.parseInt(savedWidth)
      if (width >= 200 && width <= 500) {
        setSidebarWidth(width)
      }
    }
  }, [])

  // Salva larghezza sidebar
  const saveSidebarWidth = (width: number) => {
    setSidebarWidth(width)
    localStorage.setItem("mcp-sidebar-width", width.toString())
  }

  // Gestione ridimensionamento
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const newWidth = e.clientX
      const minWidth = 200
      const maxWidth = 500

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        saveSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    if (isResizing) {
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing])

  // Salva API keys nel localStorage
  const saveApiKeys = (newKeys: typeof apiKeys) => {
    setApiKeys(newKeys)
    localStorage.setItem("mcp-api-keys", JSON.stringify(newKeys))
  }

  // Testa validità API key
  const testApiKey = async (provider: string, key: string) => {
    if (!key.trim()) {
      setApiKeyStatus(prev => ({ ...prev, [provider]: 'empty' }))
      return
    }

    setApiKeyStatus(prev => ({ ...prev, [provider]: 'testing' }))

    try {
      const response = await fetch("/api/test-api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey: key }),
      })

      const result = await response.json()
      setApiKeyStatus(prev => ({
        ...prev,
        [provider]: result.valid ? 'valid' : 'invalid',
      }))
    } catch (error) {
      setApiKeyStatus(prev => ({ ...prev, [provider]: 'error' }))
    }
  }

  // Gestisci cambio API key
  const handleApiKeyChange = (provider: string, value: string) => {
    const newKeys = { ...apiKeys, [provider]: value }
    saveApiKeys(newKeys)

    // Reset status quando si modifica la key
    setApiKeyStatus(prev => ({ ...prev, [provider]: 'unknown' }))

    // Testa automaticamente dopo 1 secondo di inattività
    setTimeout(() => {
      if (newKeys[provider as keyof typeof newKeys] === value) {
        testApiKey(provider, value)
      }
    }, 1000)
  }

  // Salva chat nel localStorage
  const saveChats = (updatedChats: Chat[]) => {
    setChats(updatedChats)
    localStorage.setItem("mcp-chats", JSON.stringify(updatedChats))
  }

  // Aggiungi nuova chat
  const addNewChat = (title = "Nuova Chat") => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title,
      createdAt: new Date(),
      messageCount: 0,
    }
    const updatedChats = [newChat, ...chats]
    saveChats(updatedChats)
    return newChat.id
  }

  // Aggiorna chat esistente
  const updateChat = (chatId: string, updates: Partial<Chat>) => {
    const updatedChats = chats.map((chat) => (chat.id === chatId ? { ...chat, ...updates } : chat))
    saveChats(updatedChats)
  }

  // Elimina chat
  const deleteChat = (chatId: string) => {
    const updatedChats = chats.filter((chat) => chat.id !== chatId)
    saveChats(updatedChats)
    if (currentChatId === chatId) {
      onChatSelect(null)
    }
  }

  // Inizia modifica titolo
  const startEditingTitle = (chat: Chat) => {
    setEditingChatId(chat.id)
    setEditingTitle(chat.title)
  }

  // Salva titolo modificato
  const saveEditedTitle = () => {
    if (editingChatId && editingTitle.trim()) {
      updateChat(editingChatId, { title: editingTitle.trim() })
    }
    setEditingChatId(null)
    setEditingTitle("")
  }

  // Annulla modifica
  const cancelEditing = () => {
    setEditingChatId(null)
    setEditingTitle("")
  }

  // Gestisci nuova chat
  const handleNewChat = () => {
    const newChatId = addNewChat()
    onChatSelect(newChatId)
    onNewChat()
  }

  // Ottieni placeholder per API key
  const getApiKeyPlaceholder = (provider: string) => {
    switch (provider) {
      case "groq":
        return "gsk_..."
      case "anthropic":
        return "sk-ant-..."
      default:
        return "Inserisci API key"
    }
  }

  // Ottieni status icon per API key
  const getStatusIcon = (provider: string) => {
    const status = apiKeyStatus[provider as keyof typeof apiKeyStatus]
    switch (status) {
      case "valid":
        return <div className="w-2 h-2 bg-green-500 rounded-full" />
      case "invalid":
      case "error":
        return <div className="w-2 h-2 bg-red-500 rounded-full" />
      case "testing":
        return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
      default:
        return <div className="w-2 h-2 bg-gray-300 rounded-full" />
    }
  }

  // Ottieni messaggio di status
  const getStatusMessage = (provider: string) => {
    const status = apiKeyStatus[provider as keyof typeof apiKeyStatus]
    switch (status) {
      case "valid":
        return "API key valida"
      case "invalid":
        return "API key non valida"
      case "error":
        return "Errore di connessione"
      case "testing":
        return "Verifica in corso..."
      case "empty":
        return "API key richiesta"
      default:
        return "Non verificata"
    }
  }

  if (!isOpen) {
    return (
      <div className="w-12 bg-white border-r border-gray-100 flex flex-col items-center py-4 space-y-3">
        <button
          onClick={onToggle}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={handleNewChat}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative flex">
      {/* Sidebar Content */}
      <div
        ref={sidebarRef}
        className="bg-white border-r border-gray-100 flex flex-col h-full"
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-normal text-gray-900">Chat</h1>
            <button
              onClick={onToggle}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-light text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuova chat
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-2">
          {chats.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-light text-gray-500">Nessuna chat</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    currentChatId === chat.id ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                  onClick={() => onChatSelect(chat.id)}
                >
                  {editingChatId === chat.id ? (
                    <div className="flex-1 flex items-center gap-1">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEditedTitle()
                          if (e.key === "Escape") cancelEditing()
                        }}
                        className="flex-1 px-2 py-1 text-sm font-light border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          saveEditedTitle()
                        }}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          cancelEditing()
                        }}
                        className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-light text-gray-900 truncate">{chat.title}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditingTitle(chat)
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteChat(chat.id)
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="border-t border-gray-100 p-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-light text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="flex-1 text-left">Impostazioni</span>
          </button>

          {showSettings && (
            <div className="mt-3 space-y-5">
              {/* Provider Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-3">
                  Provider AI
                </label>
                <div className="relative">
                  <select
                    value={selectedProvider}
                    onChange={(e) => onProviderChange(e.target.value)}
                    className="w-full px-4 py-3 text-sm font-light text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
                    style={{
                      fontFamily: "Raleway, sans-serif",
                      fontWeight: "300",
                      lineHeight: "1.5",
                    }}
                  >
                    <option
                      value="groq"
                      style={{
                        fontFamily: "Raleway, sans-serif",
                        fontWeight: "300",
                        padding: "12px 16px",
                        lineHeight: "1.5",
                      }}
                    >
                      Groq (Gratuito)
                    </option>
                    <option
                      value="anthropic"
                      style={{
                        fontFamily: "Raleway, sans-serif",
                        fontWeight: "300",
                        padding: "12px 16px",
                        lineHeight: "1.5",
                      }}
                    >
                      Anthropic Claude
                    </option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* API Key Input */}
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-3">
                  <Key className="w-3 h-3 inline mr-1" />
                  API Key {selectedProvider}
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type={showApiKeys[selectedProvider as keyof typeof showApiKeys] ? "text" : "password"}
                      value={apiKeys[selectedProvider as keyof typeof apiKeys]}
                      onChange={(e) => handleApiKeyChange(selectedProvider, e.target.value)}
                      placeholder={getApiKeyPlaceholder(selectedProvider)}
                      className="w-full px-4 py-3 pr-20 text-sm font-light text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition-all duration-200 hover:border-gray-300"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
                      {getStatusIcon(selectedProvider)}
                      <button
                        type="button"
                        onClick={() =>
                          setShowApiKeys(prev => ({
                            ...prev,
                            [selectedProvider]: !prev[selectedProvider as keyof typeof prev],
                          }))
                        }
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showApiKeys[selectedProvider as keyof typeof showApiKeys] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-light text-gray-500">{getStatusMessage(selectedProvider)}</span>
                    {apiKeys[selectedProvider as keyof typeof apiKeys] && (
                      <button
                        onClick={() => testApiKey(selectedProvider, apiKeys[selectedProvider as keyof typeof apiKeys])}
                        className="text-xs font-normal text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        Verifica
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs font-light text-gray-500 mt-2">
                  {selectedProvider === "groq" && "Registrati gratuitamente su console.groq.com"}
                  {selectedProvider === "anthropic" && "Ottieni la tua API key da console.anthropic.com"}
                </p>
              </div>

              {/* Model Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-3">Modello</label>
                <div className="relative">
                  <select
                    value={selectedModel}
                    onChange={(e) => onModelChange(e.target.value)}
                    className="w-full px-4 py-3 text-sm font-light text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
                    style={{
                      fontFamily: "Raleway, sans-serif",
                      fontWeight: "300",
                      lineHeight: "1.5",
                    }}
                  >
                    {selectedProvider === "groq" && (
                      <>
                        <option
                          value="llama-3.1-8b-instant"
                          style={{
                            fontFamily: "Raleway, sans-serif",
                            fontWeight: "300",
                            padding: "12px 16px",
                            lineHeight: "1.5",
                          }}
                        >
                          Llama 3.1 8B (Consigliato)
                        </option>
                        <option
                          disabled
                          style={{
                            fontFamily: "Raleway, sans-serif",
                            fontWeight: "300",
                            color: "#9CA3AF",
                            fontSize: "11px",
                            padding: "8px 16px",
                          }}
                        >
                          ────────────────────
                        </option>
                        <option
                          value="mixtral-8x7b-32768"
                          style={{
                            fontFamily: "Raleway, sans-serif",
                            fontWeight: "300",
                            padding: "12px 16px",
                            lineHeight: "1.5",
                          }}
                        >
                          Mixtral 8x7B
                        </option>
                        <option
                          value="llama-3.1-70b-versatile"
                          style={{
                            fontFamily: "Raleway, sans-serif",
                            fontWeight: "300",
                            padding: "12px 16px",
                            lineHeight: "1.5",
                          }}
                        >
                          Llama 3.1 70B (Più potente)
                        </option>
                      </>
                    )}
                    {selectedProvider === "anthropic" && (
                      <>
                        <option
                          value="claude-3-5-sonnet-20241022"
                          style={{
                            fontFamily: "Raleway, sans-serif",
                            fontWeight: "300",
                            padding: "12px 16px",
                            lineHeight: "1.5",
                          }}
                        >
                          Claude 3.5 Sonnet (Consigliato)
                        </option>
                        <option
                          disabled
                          style={{
                            fontFamily: "Raleway, sans-serif",
                            fontWeight: "300",
                            color: "#9CA3AF",
                            fontSize: "11px",
                            padding: "8px 16px",
                          }}
                        >
                          ────────────────────
                        </option>
                        <option
                          value="claude-3-5-haiku-20241022"
                          style={{
                            fontFamily: "Raleway, sans-serif",
                            fontWeight: "300",
                            padding: "12px 16px",
                            lineHeight: "1.5",
                          }}
                        >
                          Claude 3.5 Haiku (Veloce)
                        </option>
                        <option
                          value="claude-3-opus-20240229"
                          style={{
                            fontFamily: "Raleway, sans-serif",
                            fontWeight: "300",
                            padding: "12px 16px",
                            lineHeight: "1.5",
                          }}
                        >
                          Claude 3 Opus (Massima qualità)
                        </option>
                      </>
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* MCP Server */}
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-3">
                  Server MCP
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={mcpServerUrl}
                    onChange={(e) => onMcpServerUrlChange(e.target.value)}
                    placeholder="http://localhost:8080"
                    className="w-full px-4 py-3 text-sm font-light text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-300"}`} />
                      <span className={`text-xs font-light ${isConnected ? "text-green-700" : "text-gray-500"}`}>
                        {isConnected ? "Connesso" : "Non connesso"}
                      </span>
                    </div>
                    <button
                      onClick={onTestConnection}
                      className="text-xs font-normal text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Testa connessione
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="w-0.5 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors relative group"
        onMouseDown={() => setIsResizing(true)}
      >
        {/* Visual indicator */}
        <div className="absolute inset-y-0 left-0 w-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Wider hit area */}
        <div className="absolute inset-y-0 -left-1 -right-1 w-3" />
      </div>
    </div>
  )
}