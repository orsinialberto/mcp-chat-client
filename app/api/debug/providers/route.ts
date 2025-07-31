export async function GET() {
  const providers = {
    openai: {
      available: !!process.env.OPENAI_API_KEY,
      keyLength: process.env.OPENAI_API_KEY?.length || 0,
      models: [
        { id: "gpt-4o", name: "GPT-4o (Recommended)", description: "Più potente e veloce" },
        { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Più economico" },
        { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "Versione precedente" },
      ],
    },
    anthropic: {
      available: !!process.env.ANTHROPIC_API_KEY,
      keyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
      models: [
        { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", description: "Più recente e potente" },
        { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", description: "Veloce ed economico" },
        { id: "claude-3-opus-20240229", name: "Claude 3 Opus", description: "Massima qualità" },
      ],
    },
    groq: {
      available: !!process.env.GROQ_API_KEY,
      keyLength: process.env.GROQ_API_KEY?.length || 0,
      models: [
        { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B", description: "Ultra veloce" },
        { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", description: "Buon bilanciamento" },
      ],
    },
  }

  // Test rapido delle connessioni
  const testResults = {}

  for (const [providerName, config] of Object.entries(providers)) {
    if (config.available) {
      try {
        let testUrl = ""
        let headers = {}

        switch (providerName) {
          case "openai":
            testUrl = "https://api.openai.com/v1/models"
            headers = { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
            break
          case "anthropic":
            testUrl = "https://api.anthropic.com/v1/messages"
            headers = {
              "x-api-key": process.env.ANTHROPIC_API_KEY,
              "anthropic-version": "2023-06-01",
            }
            break
          case "groq":
            testUrl = "https://api.groq.com/openai/v1/models"
            headers = { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }
            break
        }

        const response = await fetch(testUrl, {
          method: "GET",
          headers,
          signal: AbortSignal.timeout(5000),
        })

        testResults[providerName] = {
          status: response.status,
          ok: response.ok,
          message: response.ok ? "Connessione OK" : `HTTP ${response.status}`,
        }
      } catch (error) {
        testResults[providerName] = {
          status: 0,
          ok: false,
          message: error.message,
        }
      }
    } else {
      testResults[providerName] = {
        status: 0,
        ok: false,
        message: "API Key non configurata",
      }
    }
  }

  return Response.json({
    providers,
    testResults,
    timestamp: new Date().toISOString(),
  })
}
