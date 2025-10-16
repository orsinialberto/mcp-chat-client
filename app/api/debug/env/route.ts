export async function GET() {
  return Response.json({
    hasGemini: !!process.env.GEMINI_API_KEY,
    hasAnthropic: !!process.env.TEST_API_KEY,
    geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
    anthropicKeyLength: process.env.TEST_API_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
}