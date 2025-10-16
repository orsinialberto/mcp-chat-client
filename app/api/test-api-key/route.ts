export async function POST(req: Request) {
  try {
    const { provider, apiKey } = await req.json()

    if (!provider || !apiKey) {
      return Response.json({ valid: false, error: "Provider e API key richiesti" })
    }

    let testUrl = ""
    let headers: Record<string, string> = {}

    switch (provider) {
      case "anthropic":
        if (!apiKey.startsWith("sk-ant-")) {
          return Response.json({ valid: false, error: "API key Anthropic deve iniziare con 'sk-ant-'" })
        }
        testUrl = "https://api.anthropic.com/v1/messages"
        headers = {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        }
        break

      default:
        return Response.json({ valid: false, error: "Provider non supportato" })
    }

    const response = await fetch(testUrl, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(10000),
    })

    if (response.ok) {
      return Response.json({
        valid: true,
        message: `API key ${provider} valida`,
        status: response.status,
      })
    } else {
      const errorText = await response.text()
      return Response.json({
        valid: false,
        error: `HTTP ${response.status}: ${errorText.substring(0, 200)}`,
      })
    }
  } catch (error) {
    return Response.json({
      valid: false,
      error: error.message || "Errore durante la verifica",
    })
  }
}