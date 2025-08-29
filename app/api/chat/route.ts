import { groq } from "@ai-sdk/groq";
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, LanguageModelV1 } from 'ai';
import { MCPSingleton, MCPLogger } from '@/lib/mcp';

// System prompt specifico per mostrare TUTTI i tenant
const SYSTEM_PROMPT = `Sei Archimede, assistente AI per segmentazione Marketing Cloud.
RUOLO: Guidi nella creazione/ottimizzazione segmenti, risolvi errori, generi visualizzazioni.
STILE: Linguaggio semplice, step-by-step, risposte actionable.
STRUTTURA: Obiettivo → Criteri → Implementazione → Metriche.
Priorità: sicurezza dati, conformità normative, backup sempre.`;

// Il sistema MCP è ora gestito dal singleton - nessuna variabile globale necessaria

export async function POST(req: Request) {
  MCPLogger.info("🚀 API Chat chiamata")

  try {
    const body = await req.json()
    MCPLogger.debug("📥 Body ricevuto:", body)

    const { messages, provider = "groq", model: selectedModel, apiKey } = body

    if (!messages || !Array.isArray(messages)) {
      MCPLogger.error("❌ Messaggi non validi:", messages)
      return new Response(JSON.stringify({ error: "Messaggi non validi" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    MCPLogger.info("📝 Messaggi da processare:", { count: messages.length, provider, model: selectedModel })

    // Configurazione modello basata sul provider
    let model: any
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
        // Set the API key in environment for groq
        process.env.GROQ_API_KEY = groqKey
        model = groq(selectedModel || "llama-3.1-8b-instant")
        providerName = "Groq"
        break

      case "anthropic":
        const anthropicKey = apiKey || process.env.TEST_API_KEY
        if (!anthropicKey) {
          return new Response(
            JSON.stringify({
              error: "API Key Anthropic non configurata",
              details: "Inserisci la tua API key Anthropic nelle impostazioni o aggiungi TEST_API_KEY nel file .env.local",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          )
        }
        const anthropicClient = createAnthropic({
          apiKey: anthropicKey
        });

        model = anthropicClient(selectedModel || "claude-3-5-sonnet-20241022");
        providerName = "Anthropic"
        break

      case "gemini":
        const geminiKey = apiKey || process.env.GEMINI_API_KEY
        if (!geminiKey) {
          return new Response(
            JSON.stringify({
              error: "API Key Gemini non configurata",
              details: "Inserisci la tua API key Gemini nelle impostazioni o aggiungi GEMINI_API_KEY nel file .env.local",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          )
        }
        // Use OpenAI-compatible endpoint for Google Gemini with custom fetch to fix tool calls
        const geminiClient = createOpenAI({
          apiKey: geminiKey,
          baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
          fetch: async (url, options) => {
            const response = await fetch(url, options);
            
            if (!response.body) return response;
            
            // Create a transform stream to fix tool calls format
            const transformStream = new TransformStream({
              transform(chunk, controller) {
                const text = new TextDecoder().decode(chunk);
                const lines = text.split('\n');
                
                const fixedLines = lines.map(line => {
                  if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                    try {
                      const data = JSON.parse(line.slice(6));
                      if (data.choices?.[0]?.delta?.tool_calls) {
                        data.choices[0].delta.tool_calls = data.choices[0].delta.tool_calls.map((toolCall: any, index: number) => ({
                          ...toolCall,
                          index: index
                        }));
                      }
                      return 'data: ' + JSON.stringify(data);
                    } catch (e) {
                      return line;
                    }
                  }
                  return line;
                });
                
                controller.enqueue(new TextEncoder().encode(fixedLines.join('\n')));
              }
            });
            
            return new Response(response.body.pipeThrough(transformStream), {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers
            });
          }
        });

        model = geminiClient(selectedModel || "gemini-2.0-flash-exp");
        providerName = "Google Gemini"
        break

      default:
        return new Response(
          JSON.stringify({
            error: "Provider non supportato",
            details: `Provider '${provider}' non riconosciuto. Usa: groq, anthropic, gemini`,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        )
    }

    MCPLogger.info(`✅ ${providerName} configurato correttamente`)

    // Ottieni gli strumenti MCP tramite il singleton (con gestione automatica della connessione)
    let tools = {}
    
    try {
      const mcpSingleton = MCPSingleton.getInstance()
      tools = await mcpSingleton.getTools()
      
      const toolNames = Object.keys(tools)
      MCPLogger.info("🛠️ Strumenti MCP recuperati tramite singleton", {
        toolCount: toolNames.length,
        tools: toolNames
      })
      
      // Log dello stato della connessione per debugging
      const connectionStatus = mcpSingleton.getConnectionStatus()
      MCPLogger.debug("📊 Stato connessione MCP", connectionStatus)
      
    } catch (error) {
      MCPLogger.error("❌ Errore recupero strumenti MCP", error)
      // Continua senza tools MCP in caso di errore
      tools = {}
    }

    // Prepara i messaggi con system prompt
    const systemMessage = {
      role: "system" as const,
      content: SYSTEM_PROMPT
    };

    // Combina system message con i messaggi dell'utente
    const allMessages = [systemMessage, ...messages];

    MCPLogger.debug("💭 System message aggiunto")
    MCPLogger.info("🛠️ Tools configurati per streamText", { toolCount: Object.keys(tools).length })
    MCPLogger.debug("🔄 Chiamata a streamText...")

    const response = streamText({
      model,
      tools,
      messages: allMessages,
      maxSteps: 3,
      temperature: 0.1,
      maxTokens: 8000,
      onError({ error }) {
        MCPLogger.error("Errore in streamText", error);
      },
    });

    MCPLogger.info("✅ streamText completato, restituendo risposta")

    return response.toDataStreamResponse();

  } catch (error) {
    MCPLogger.error("❌ Errore nella chat:", error)

    return new Response(
      JSON.stringify({
        error: "Errore interno del server",
        details: error instanceof Error ? error.message : "Errore sconosciuto",
        stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}