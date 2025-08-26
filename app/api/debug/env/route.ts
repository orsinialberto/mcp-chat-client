export async function GET() {
  return Response.json({
    hasGroq: !!process.env.GROQ_API_KEY,
    hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
    groqKeyLength: process.env.GROQ_API_KEY?.length || 0,
    anthropicKeyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
}