export async function POST(req: Request) {
  try {
    const { serverUrl } = await req.json()

    if (!serverUrl) {
      return new Response(JSON.stringify({ error: "URL server richiesto" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Validazione URL
    let validUrl: URL
    try {
      validUrl = new URL(serverUrl)
    } catch (urlError) {
      return new Response(
        JSON.stringify({
          error: "URL non valido: " + urlError.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    console.log("Tentativo di connessione a:", serverUrl)

    // Test connessione base al server
    const baseUrl = `${validUrl.protocol}//${validUrl.host}`

    try {
      // Prima testa l'endpoint di health
      const healthUrl = `${baseUrl}/api/health`
      console.log("Health check su:", healthUrl)

      const healthResponse = await fetch(healthUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000),
      })

      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status} ${healthResponse.statusText}`)
      }

      const healthData = await healthResponse.json()
      console.log("Health data:", healthData)

      if (healthData.status !== "UP") {
        throw new Error(`Server not ready: ${healthData.status}`)
      }

      // Ora testa l'endpoint MCP con una richiesta GET semplice
      console.log("Testing MCP endpoint:", serverUrl)

      const mcpResponse = await fetch(serverUrl, {
        method: "GET",
        headers: {
          Accept: "application/json, text/event-stream",
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000),
      })

      console.log("MCP endpoint response status:", mcpResponse.status)

      let mcpResponseText = ""
      try {
        mcpResponseText = await mcpResponse.text()
        console.log("MCP response body:", mcpResponseText.substring(0, 200))
      } catch (textError) {
        console.log("Could not read MCP response body:", textError.message)
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Connessione base riuscita",
          serverUrl: serverUrl,
          serverInfo: {
            service: healthData.service,
            status: healthData.status,
            timestamp: healthData.timestamp,
          },
          mcpEndpoint: {
            status: mcpResponse.status,
            statusText: mcpResponse.statusText,
            responsePreview: mcpResponseText.substring(0, 200),
          },
          availableTools: [], // Da implementare quando MCP sarà pronto
          toolCount: 0,
          note: "Test di connessione base completato. Implementazione MCP in corso.",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      )
    } catch (error) {
      console.error("Connection test failed:", error)
      return new Response(
        JSON.stringify({
          error: "Test di connessione fallito",
          details: error.message,
          suggestions: [
            "Verifica che il server Spring Boot sia in esecuzione",
            "Controlla che l'endpoint /api/health risponda correttamente",
            "Assicurati che l'endpoint MCP sia implementato",
            "Verifica i log del server per errori specifici",
          ],
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }
  } catch (error) {
    console.error("Errore generale test MCP:", error)
    return new Response(
      JSON.stringify({
        error: "Errore interno durante il test MCP",
        details: error.message,
        type: error.constructor.name,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
