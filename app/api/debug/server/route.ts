export async function POST(req: Request) {
  try {
    const { serverUrl } = await req.json()

    if (!serverUrl) {
      return new Response(JSON.stringify({ error: "URL server richiesto" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const baseUrl = serverUrl.replace("/mcp", "")

    // Test multipli
    const tests = [
      { name: "Base Server", url: baseUrl },
      { name: "Health Check", url: `${baseUrl}/api/health` },
      { name: "MCP Endpoint", url: serverUrl },
    ]

    const results = []

    for (const test of tests) {
      try {
        console.log(`Testing ${test.name}: ${test.url}`)

        const response = await fetch(test.url, {
          method: "GET",
          mode: "cors",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(5000),
        })

        const responseText = await response.text()

        results.push({
          name: test.name,
          url: test.url,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseText.substring(0, 500), // Prime 500 caratteri
        })
      } catch (error) {
        results.push({
          name: test.name,
          url: test.url,
          error: error.message,
          errorType: error.name,
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Test di connessione completati",
        results: results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Errore durante i test di connessione",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
