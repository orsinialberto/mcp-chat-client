import { groq } from "@ai-sdk/groq";
import { anthropic } from "@ai-sdk/anthropic";
import { experimental_createMCPClient, streamText } from 'ai';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio';

// System prompt specifico per mostrare TUTTI i tenant
const SYSTEM_PROMPT = `Sei Archimede, assistente AI per segmentazione Marketing Cloud.
RUOLO: Guidi nella creazione/ottimizzazione segmenti, risolvi errori, generi visualizzazioni.
STILE: Linguaggio semplice, step-by-step, risposte actionable.
STRUTTURA: Obiettivo → Criteri → Implementazione → Metriche.
Priorità: sicurezza dati, conformità normative, backup sempre.`;

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

    const { messages, provider = "groq", model: selectedModel, apiKey } = body

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

    // Configurazione modello basata sul provider
    let model
    let providerName = ""

    switch (provider) {
      case "groq":
        const groqKey = apiKey || process.env.GROQ_API_KEY
        if (!groqKey) {
          return new Response(
            JSON.stringify({
              error: "API Key Groq non configurata",
              details: "Inserisci la tua API key Groq nelle impostazioni o aggiungi GROQ_API_KEY nel file .env.local.",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          )
        }
        model = groq(selectedModel || "llama-3.1-8b-instant", { 
          apiKey: groqKey,
          tools: true 
        })
        providerName = "Groq"
        break

      case "anthropic":
        const anthropicKey = apiKey || process.env.ANTHROPIC_API_KEY
        if (!anthropicKey) {
          return new Response(
            JSON.stringify({
              error: "API Key Anthropic non configurata",
              details: "Inserisci la tua API key Anthropic nelle impostazioni o aggiungi ANTHROPIC_API_KEY nel file .env.local",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          )
        }
        model = anthropic(selectedModel || "claude-3-5-sonnet-20241022", { apiKey: anthropicKey })
        providerName = "Anthropic"
        break

      default:
        return new Response(
          JSON.stringify({
            error: "Provider non supportato",
            details: `Provider '${provider}' non riconosciuto. Usa: groq, anthropic`,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        )
    }

    console.log(`✅ ${providerName} configurato correttamente`)

    // Definisci gli strumenti MCP se il server è connesso
    let tools = {}

    // Riutilizza l'istanza del client MCP se esiste, altrimenti la crea
    if (!mcpClientInstance) {
      mcpClientInstance = await experimental_createMCPClient({transport})
      console.log("� Client MCP creato per la prima volta")
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
    console.log("🔄 Chiamata a streamText...")

    const response = await streamText({
      model,
      tools,
      messages: allMessages,
      maxSteps: 3,
      temperature: 0.1,
      maxTokens: 8000,
    });

    console.log("✅ streamText completato, restituendo risposta")

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