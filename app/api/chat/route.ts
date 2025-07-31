import { anthropic } from "@ai-sdk/anthropic";
import { groq } from "@ai-sdk/groq";
import { openai } from "@ai-sdk/openai";
import { ollama } from "ollama-ai-provider"; 
import { experimental_createMCPClient, streamText } from 'ai';
import { Experimental_StdioMCPTransport } from 'ai/mcp-stdio';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio';

// System prompt specifico per mostrare TUTTI i tenant
const SYSTEM_PROMPT = `
Identità
Sei Archimede, assistente AI specializzato in segmentazione clienti su piattaforme Marketing Cloud. Semplifichi operazioni complesse e guidi gli utenti nella creazione di segmenti efficaci.
Capacità Principali

Supporto segmentazione: Guida step-by-step nella creazione e ottimizzazione
Creazione autonoma: Analizza segmenti esistenti per proporre nuovi basati su pattern identificati
Visualizzazione: Genera grafici e dashboard sui risultati dei segmenti
Gestione errori: Rileva e comunica problemi con soluzioni specifiche

Comportamenti Obbligatori

Linguaggio semplice: Evita jargon, usa termini comprensibili
Chiarezza: Una funzione alla volta, spiegazioni step-by-step
Precisione: Informazioni accurate, verifica sempre i dati
Multilingua: Rispondi nella lingua della domanda
Sicurezza: Non creare segmenti che violino privacy/normative

Gestione Errori
Quando rilevi problemi:

Segnala chiaramente l'errore in linguaggio semplice
Spiega le possibili cause
Proponi soluzioni specifiche e actionable
Suggerisci come prevenire errori simili

Struttura Risposte
Per nuovi segmenti:

Obiettivo: Cosa vuoi ottenere?
Criteri: Lista filtri suggeriti
Stima risultati: Dimensione e caratteristiche previste
Implementazione: Passi specifici
Metriche: Come misurare l'efficacia

Limitazioni

Non procedere senza conferma su segmenti con grandi volumi
Escalation necessaria per dati incoerenti o richieste non etiche
Mantieni sempre backup prima delle modifiche

Sii proattivo nel suggerire ottimizzazioni e nuove opportunità basate sui pattern dei segmenti esistenti.`;

// Inizializza il transport una sola volta a livello globale
const transport = new StdioClientTransport({
  command: '/usr/lib/jvm/temurin-17-jdk-amd64/bin/java',
  args: [
    '-Dspring.ai.mcp.server.transport=STDIO',
    '-jar',
    '/home/alberto_orsini_linux/dev/albe/plan-segment-assistant/plan-segment-assistant/target/plan-segment-assistant-0.0.1-SNAPSHOT.jar'
  ],
  timeout: 30000, // 30 secondi
  keepAlive: true,
  onStderr: (chunk) => {
    console.error('[MCP SERVER STDERR]', chunk.toString());
  },
});

// Inizializza il client MCP una sola volta
let mcpClientInstance: any = null;
let mcpToolsInstance: any = null;

export async function POST(req: Request) {
  console.log("🚀 API Chat chiamata")

  try {
    const body = await req.json()
    console.log("📥 Body ricevuto:", JSON.stringify(body, null, 2))

    const { messages, mcpServerUrl, provider = "groq", model: selectedModel, apiKeys } = body

    if (!messages || !Array.isArray(messages)) {
      console.error("❌ Messaggi non validi:", messages)
      return new Response(JSON.stringify({ error: "Messaggi non validi" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log("📝 Messaggi da processare:", messages.length)
    console.log("🤖 Provider selezionato:", provider)
    console.log("🎯 Modello selezionato:", selectedModel)
    console.log("🔗 MCP Server URL:", mcpServerUrl)

    // Configurazione modelli per provider
    let model
    let providerName = ""

    switch (provider) {
      case "openai":
        const openaiKey = apiKeys?.openai || process.env.OPENAI_API_KEY
        if (!openaiKey) {
          return new Response(
            JSON.stringify({
              error: "API Key OpenAI non configurata",
              details:
                "Inserisci la tua API key OpenAI nelle impostazioni o aggiungi OPENAI_API_KEY nel file .env.local",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          )
        }
        model = openai(selectedModel || "gpt-4o", { apiKey: openaiKey })
        providerName = "OpenAI"
        break

      case "anthropic":
        const anthropicKey = apiKeys?.anthropic || process.env.ANTHROPIC_API_KEY
        if (!anthropicKey) {
          return new Response(
            JSON.stringify({
              error: "API Key Anthropic non configurata",
              details:
                "Inserisci la tua API key Anthropic nelle impostazioni o aggiungi ANTHROPIC_API_KEY nel file .env.local",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          )
        }
        model = anthropic(selectedModel || "claude-3-5-sonnet-20241022", { apiKey: anthropicKey })
        providerName = "Anthropic"
        break

      case "groq":
        const groqKey = apiKeys?.groq || process.env.GROQ_API_KEY
        if (!groqKey) {
          return new Response(
            JSON.stringify({
              error: "API Key Groq non configurata",
              details: "Inserisci la tua API key Groq nelle impostazioni o aggiungi GROQ_API_KEY nel file .env.local.",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          )
        }
        model = groq("llama-3.1-8b-instant", { 
          apiKey: groqKey,
          tools: true 
        })
        providerName = "Groq"
        break

      case "ollama":
        model = ollama('llama2:latest', {
          simulateStreaming: true,
        });
        providerName = "Ollama"
        break

      default:
        return new Response(
          JSON.stringify({
            error: "Provider non supportato",
            details: `Provider '${provider}' non riconosciuto. Usa: openai, anthropic, groq`,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        )
    }

    console.log(`✅ ${providerName} configurato correttamente`)

    // Definisci gli strumenti MCP se il server è connesso
    let tools = {}

    // Riutilizza l'istanza del client MCP se esiste, altrimenti la crea
    if (!mcpClientInstance) {
      mcpClientInstance = await experimental_createMCPClient({
        transport
      })
      console.log("🔗 Client MCP creato per la prima volta")
    }

    // Riutilizza gli strumenti se esistono, altrimenti li recupera
    if (!mcpToolsInstance) {
      mcpToolsInstance = await mcpClientInstance.tools()
      console.log("🛠️ Strumenti MCP recuperati per la prima volta:", Object.keys(mcpToolsInstance))
    }
    
    tools = mcpToolsInstance

    console.log("🛠️ Strumenti MCP recuperati:", Object.keys(tools))

    // Prepara i messaggi con system prompt
    const systemMessage = {
      role: "system" as const,
      content: SYSTEM_PROMPT
    };

    // Combina system message con i messaggi dell'utente
    const allMessages = [systemMessage, ...messages];

    console.log("💭 System message aggiunto")
    console.log("🛠️ Tools configurati:", Object.keys(tools))
    console.log("🔄 Chiamata a generateText...")

    const response = await streamText({
      model,
      tools,
      messages: allMessages,
      maxSteps: 3,
      temperature: 0.1,
      maxTokens: 8000,
    });

    console.log("✅ generateText completato, restituendo risposta")

    return response.toDataStreamResponse();

  } catch (error) {
    console.error("❌ Errore nella chat:", error)
    console.error("Stack trace:", error.stack)

    return new Response(
      JSON.stringify({
        error: "Errore interno del server",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}