import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, LanguageModelV1 } from 'ai';
import { MCPSingleton, MCPLogger } from '@/lib/mcp';

const SYSTEM_PROMPT = `You are Archimede, an AI assistant for Marketing Cloud customer segmentation.

ROLE: Guide in creating/optimizing segments, resolve errors, generate visualizations.

DATA FORMATTING RULES:
- When presenting lists of data (tenants, segments, etc.), use proper markdown tables
- NEVER convert JSON arrays to bullet points or plain text
- Use this table format for tenant lists:

| Tenant ID | Tenant Name | Tenant Label |
|-----------|-------------|--------------|
| 706 | Cplan Pipeline API - 3000277 | Cplan Pipeline API - 3000277_2 |
| 710 | Cplan Integration Test Bis | Cplan Integration Test Bis Parent - 3000389 |

- For other data lists, create appropriate tables with clear headers
- Keep JSON responses as proper JSON when requested
- Use code blocks with \`\`\`json for JSON data
- Use code blocks with \`\`\`markdown for markdown tables

IMPORTANT - MCP SEARCH STRATEGY:
If you don't find useful information on the first attempt with MCP tools, 
you must try at least 3 different searches with different parameters before responding generically.
Use alternative search terms, different filters, and multiple approaches to find the required information.
Vary search parameters (e.g., different tenant names, broader/specific queries, related terms).

STYLE: Simple language, step-by-step, actionable responses.
Priority: data security, regulatory compliance, always backup.`;


export async function POST(req: Request) {

  MCPLogger.info("🚀 API Chat chiamata")

  try {
    const body = await req.json()
  
    MCPLogger.debug("📥 Body ricevuto:", body)

    const { messages, provider = "gemini", model: selectedModel, apiKey } = body

    if (!messages || !Array.isArray(messages)) {
      MCPLogger.error("❌ Messaggi non validi:", messages)
      return new Response(JSON.stringify({ error: "Messaggi non validi" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    MCPLogger.info("📝 Messaggi da processare:", { count: messages.length, provider, model: selectedModel })

    let model: any
    let providerName = ""

    switch (provider) {
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
        const geminiClient = createOpenAI({
          apiKey: geminiKey,
          baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
          fetch: async (url, options) => {
            const response = await fetch(url, options);
            
            if (!response.body) return response;
            
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
            details: `Provider '${provider}' non riconosciuto. Usa: anthropic, gemini`,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        )
    }

    MCPLogger.info(`✅ ${providerName} configurato correttamente`)

    let tools = {}
    
    try {
      const mcpSingleton = MCPSingleton.getInstance()
      tools = await mcpSingleton.getTools()
      
      // Check if MCP was pre-initialized or initialized on-demand
      const connectionStatus = mcpSingleton.getConnectionStatus()
      if (connectionStatus.connectionAttempts === 0 && mcpSingleton.isReady()) {
        MCPLogger.debug("✨ Using pre-initialized MCP connection (eager initialization)")
      } else {
        MCPLogger.debug("🔄 MCP initialized on-demand (lazy initialization)")
      }
      
      const toolNames = Object.keys(tools)
      MCPLogger.info("🛠️ Strumenti MCP recuperati tramite singleton", {
        toolCount: toolNames.length,
        tools: toolNames
      })
      
      MCPLogger.debug("📊 Stato connessione MCP", connectionStatus)
      
    } catch (error) {
      MCPLogger.error("❌ Errore recupero strumenti MCP", error)
      tools = {}
    }

    const systemMessage = {
      role: "system" as const,
      content: SYSTEM_PROMPT
    };

    const allMessages = [systemMessage, ...messages];

    MCPLogger.debug("💭 System message aggiunto")
    MCPLogger.info("🛠️ Tools configurati per streamText", { toolCount: Object.keys(tools).length })
    MCPLogger.debug("🔄 Chiamata a streamText...")

    const response = streamText({
      model,
      tools,
      messages: allMessages,
      maxSteps: 10,
      temperature: 0.1,
      maxTokens: 8000,
      onStepFinish({ stepType, toolCalls, finishReason, usage }) {
        MCPLogger.info("🔄 Step completato", {
          stepType,
          toolCallsCount: toolCalls?.length || 0,
          toolNames: toolCalls?.map((tc: any) => tc.toolName) || [],
          finishReason,
          usage: usage ? {
            promptTokens: usage.promptTokens,
            completionTokens: usage.completionTokens
          } : null
        });
        
        if (toolCalls && toolCalls.length > 0) {
          toolCalls.forEach((tc: any, index: number) => {
            MCPLogger.debug(`Tool call ${index + 1}:`, {
              toolName: tc.toolName,
              args: tc.args
            });
          });
        }
      },
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