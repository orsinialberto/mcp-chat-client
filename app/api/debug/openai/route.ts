import { openai } from "@ai-sdk/openai"

export async function GET() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({
        valid: false,
        error: "OPENAI_API_KEY non configurata",
      })
    }

    if (!process.env.OPENAI_API_KEY.startsWith("sk-")) {
      return Response.json({
        valid: false,
        error: "OPENAI_API_KEY formato non valido (deve iniziare con 'sk-')",
      })
    }

    // Test semplice con OpenAI
    const model = openai("gpt-4o")

    // Prova una chiamata molto semplice
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    })

    if (response.ok) {
      return Response.json({
        valid: true,
        message: "API Key OpenAI valida",
        status: response.status,
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
