"use client"
import { ChartRenderer } from "./chart-renderer"

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
          <div key={index} className="text-gray-900 font-light whitespace-pre-wrap leading-relaxed">
            {part.content}
          </div>
        )
      })}
    </div>
  )
}