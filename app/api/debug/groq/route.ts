export async function GET() {
  try {
    if (!process.env.GROQ_API_KEY) {
      return Response.json({
        valid: false,
        error: "GROQ_API_KEY non configurata",
      })
    }

    if (!process.env.GROQ_API_KEY.startsWith("gsk_")) {
      return Response.json({
        valid: false,
        error: "GROQ_API_KEY formato non valido (deve iniziare con 'gsk_')",
      })
    }

    // Test semplice con Groq
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const models = data.data?.map((m: any) => m.id) || []

      return Response.json({
        valid: true,
        message: "API Key Groq valida",
        status: response.status,
        availableModels: models.slice(0, 5), // Primi 5 modelli
      })
    } else {
      const errorText = await response.text()
      return Response.json({
        valid: false,
        error: `HTTP ${response.status}: ${errorText}`,
      })
    }
  } catch (error) {
    return Response.json({
      valid: false,
      error: error.message,
    })
  }
}
