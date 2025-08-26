"use client"

import { Bot, Loader2, Menu, MessageSquare, Send, User } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useChat } from '@ai-sdk/react'
import { MessageContent } from "@/components/message-content"
import { Sidebar } from "@/components/sidebar"

export default function MCPChatClient() {
  const [mcpServerUrl, setMcpServerUrl] = useState("http://localhost:8080")
  const [selectedModel, setSelectedModel] = useState("llama-3.1-8b-instant")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Carica API key dal localStorage
  const [apiKey, setApiKey] = useState("")

  useEffect(() => {
    const savedApiKey = localStorage.getItem("mcp-groq-api-key")
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
  }, [])

  // Usa useChat dall'AI SDK
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, error } = useChat({
    api: '/api/chat',
    body: {
      model: selectedModel,
      apiKey,
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
        selectedModel={selectedModel}
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
              <h1 className="text-lg font-light text-gray-900">Chat con Archimede</h1>
              <p className="text-sm text-gray-500">Assistente AI specializzato in segmentazione Marketing Cloud</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Groq</span>
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <span>{selectedModel}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && !isLoading && (
              <div className="text-center mt-20">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bot className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-normal text-gray-900 mb-2">Ciao! Sono Archimede</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Sono qui per aiutarti con la segmentazione clienti su Marketing Cloud. 
                  Posso guidarti nella creazione di segmenti efficaci, analizzare dati esistenti e suggerire ottimizzazioni.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <button 
                    onClick={() => handleInputChange({ target: { value: "Come posso creare un nuovo segmento per clienti VIP?" } } as any)}
                    className="p-4 text-left bg-white border border-gray-200 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900 mb-1">Creazione segmenti</div>
                    <div className="text-sm text-gray-500">Guide step-by-step per nuovi segmenti</div>
                  </button>
                  <button 
                    onClick={() => handleInputChange({ target: { value: "Analizza i miei segmenti esistenti e suggerisci miglioramenti" } } as any)}
                    className="p-4 text-left bg-white border border-gray-200 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900 mb-1">Ottimizzazione</div>
                    <div className="text-sm text-gray-500">Analisi e suggerimenti di miglioramento</div>
                  </button>
                  <button 
                    onClick={() => handleInputChange({ target: { value: "Mostrami come visualizzare i risultati dei segmenti con grafici" } } as any)}
                    className="p-4 text-left bg-white border border-gray-200 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900 mb-1">Visualizzazioni</div>
                    <div className="text-sm text-gray-500">Grafici e dashboard sui risultati</div>
                  </button>
                  <button 
                    onClick={() => handleInputChange({ target: { value: "Help! Ho un errore nella segmentazione, come posso risolverlo?" } } as any)}
                    className="p-4 text-left bg-white border border-gray-200 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900 mb-1">Risoluzione errori</div>
                    <div className="text-sm text-gray-500">Supporto per problemi e soluzioni</div>
                  </button>
                </div>
              </div>
            )}

            {messages.map((message, i) => (
              <div
                key={message.id || i}
                className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
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
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div className="max-w-3xl flex-1">
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-light">Archimede sta analizzando...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="flex gap-4 justify-start">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-red-600" />
                </div>
                <div className="max-w-3xl flex-1">
                  <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                    <p className="text-sm text-red-700">
                      <strong>Errore:</strong> {error.message}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Verifica la tua API key Groq nelle impostazioni o riprova più tardi.
                    </p>
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
            {!apiKey && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>API Key mancante:</strong> Configura la tua API key Groq nelle impostazioni per iniziare a chattare.
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="relative">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder={apiKey ? "Scrivi la tua domanda su segmentazione..." : "Configura prima l'API key nelle impostazioni"}
                disabled={isLoading || !apiKey}
                className="w-full px-4 py-3 pr-12 font-light border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim() || !apiKey}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:hover:text-gray-400"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Archimede può commettere errori. Verifica sempre le informazioni importanti.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}