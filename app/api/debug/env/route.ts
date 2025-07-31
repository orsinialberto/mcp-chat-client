export async function GET() {
  return Response.json({
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
    hasGroq: !!process.env.GROQ_API_KEY,
    openAIKeyLength: process.env.OPENAI_API_KEY?.length || 0,
    anthropicKeyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
    groqKeyLength: process.env.GROQ_API_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
}
