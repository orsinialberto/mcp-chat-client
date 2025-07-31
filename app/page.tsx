"use client"

import { Bot, Loader2, Menu, MessageSquare, Send, User } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useChat } from '@ai-sdk/react'
import { MessageContent } from "@/components/message-content"
import { Sidebar } from "@/components/sidebar"

export default function MCPChatClient() {
  const [mcpServerUrl, setMcpServerUrl] = useState("http://localhost:8080")
  const [selectedProvider, setSelectedProvider] = useState("groq")
  const [selectedModel, setSelectedModel] = useState("llama-3.1-8b-instant")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Carica API keys dal localStorage
  const [apiKeys, setApiKeys] = useState({ openai: "", anthropic: "", groq: "" })

  useEffect(() => {
    const savedApiKeys = localStorage.getItem("mcp-api-keys")
    if (savedApiKeys) {
      try {
        setApiKeys(JSON.parse(savedApiKeys))
      } catch (error) {
        console.error("Errore caricamento API keys:", error)
      }
    }
  }, [])

  // Usa useChat dall'AI SDK
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, error } = useChat({
    api: '/api/chat',
    body: {
      mcpServerUrl,
      provider: selectedProvider,
      model: selectedModel,
      apiKeys,
    },
    onError: (error) => {
      console.error('Errore dettagliato nella chat:', error)
      alert(`Errore: ${error.message}`)
    }
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const testConnection = async () => {
    try {
      const res = await fetch(`${mcpServerUrl}/api/health`)
      const data = await res.json()
      setIsConnected(data.status === "UP")
    } catch {
      setIsConnected(false)
    }
  }

  const clearMessages = () => {
    setMessages([])
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentChatId={null}
        onChatSelect={() => {}}
        onNewChat={clearMessages}
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        onProviderChange={setSelectedProvider}
        onModelChange={setSelectedModel}
        mcpServerUrl={mcpServerUrl}
        onMcpServerUrlChange={setMcpServerUrl}
        isConnected={isConnected}
        onTestConnection={testConnection}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-100 px-4 py-4">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex-1">
              <h1 className="text-lg font-light text-gray-900">Chat</h1>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && !isLoading && (
              <div className="text-center mt-20 text-gray-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-4" />
                <p>Inizia a scrivere per cominciare una conversazione.</p>
              </div>
            )}

            {messages.map((message, i) => (
              <div
                key={message.id || i}
                className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-blue-600" />
                  </div>
                )}

                <div className={`flex-1 max-w-3xl ${message.role === "user" ? "order-first" : ""}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.role === "user" ? "bg-blue-600 text-white ml-12" : "bg-white border border-gray-200"
                    }`}
                  >
                    {message.role === "user" ? (
                      <p className="whitespace-pre-wrap font-light">{message.content}</p>
                    ) : (
                      <MessageContent content={message.content} />
                    )}
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div className="max-w-3xl flex-1">
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-light">Sto scrivendo...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 p-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Scrivi un messaggio..."
                disabled={isLoading}
                className="w-full px-4 py-3 pr-12 font-light border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}