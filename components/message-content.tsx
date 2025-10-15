"use client"
import { ChartRenderer } from "./chart-renderer"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MessageContentProps {
  content: string
}

export function MessageContent({ content }: MessageContentProps) {
  // Funzione per pulire il contenuto
  const cleanContent = (text: string) => {
    // Rimuovi virgolette all'inizio e alla fine se presenti
    let cleaned = text.trim()
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1)
    }
    // Sostituisci \n con veri line break
    cleaned = cleaned.replace(/\\n/g, '\n')
    return cleaned
  }

  // Funzione per parsare i grafici dal contenuto
  const parseCharts = (text: string) => {
    const chartRegex = /```chart\s*\n([\s\S]*?)\n```/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = chartRegex.exec(text)) !== null) {
      // Aggiungi il testo prima del grafico
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.slice(lastIndex, match.index),
        })
      }

      // Prova a parsare il JSON del grafico
      try {
        const chartData = JSON.parse(match[1])
        parts.push({
          type: "chart",
          content: chartData,
        })
      } catch (error) {
        // Se il parsing fallisce, mostra come testo
        parts.push({
          type: "text",
          content: match[0],
        })
      }

      lastIndex = match.index + match[0].length
    }

    // Aggiungi il testo rimanente
    if (lastIndex < text.length) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex),
      })
    }

    return parts.length > 0 ? parts : [{ type: "text", content: text }]
  }

  // Prima pulisci il contenuto, poi parsalo
  const cleanedContent = cleanContent(content)
  const parts = parseCharts(cleanedContent)

  return (
    <div className="prose prose-sm max-w-none">
      {parts.map((part, index) => {
        if (part.type === "chart") {
          return <ChartRenderer key={index} chartData={part.content} />
        }
        return (
          <div key={index} className="text-gray-900 font-light leading-relaxed">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom styling for better appearance
                h1: ({children}) => <h1 className="text-xl font-semibold mb-3 text-gray-900">{children}</h1>,
                h2: ({children}) => <h2 className="text-lg font-semibold mb-2 text-gray-900">{children}</h2>,
                h3: ({children}) => <h3 className="text-base font-semibold mb-2 text-gray-900">{children}</h3>,
                p: ({children}) => <p className="mb-3 text-gray-900">{children}</p>,
                ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1 text-gray-900">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-900">{children}</ol>,
                li: ({children}) => <li className="text-gray-900">{children}</li>,
                strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                em: ({children}) => <em className="italic text-gray-900">{children}</em>,
                code: ({children}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">{children}</code>,
                pre: ({children}) => <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto mb-3">{children}</pre>,
                table: ({children}) => <div className="overflow-x-auto mb-3"><table className="min-w-full border-collapse border border-gray-300">{children}</table></div>,
                th: ({children}) => <th className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold text-left text-gray-900">{children}</th>,
                td: ({children}) => <td className="border border-gray-300 px-3 py-2 text-gray-900">{children}</td>,
                blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 mb-3">{children}</blockquote>,
              }}
            >
              {part.content}
            </ReactMarkdown>
          </div>
        )
      })}
    </div>
  )
}