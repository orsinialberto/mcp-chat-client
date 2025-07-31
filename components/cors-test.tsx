"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CorsTest() {
  const [testResult, setTestResult] = useState("")

  const testCors = async () => {
    try {
      setTestResult("Testing...")

      // Test CORS preflight
      const response = await fetch("http://localhost:8080/api/health", {
        method: "OPTIONS",
        headers: {
          "Access-Control-Request-Method": "GET",
          "Access-Control-Request-Headers": "Content-Type",
          Origin: "http://localhost:3000",
        },
      })

      const corsHeaders = {
        "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
        "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
        "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers"),
      }

      setTestResult(`CORS Headers:\n${JSON.stringify(corsHeaders, null, 2)}`)
    } catch (error) {
      setTestResult(`CORS Test Failed: ${error.message}`)
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>CORS Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={testCors} className="mb-4">
          Test CORS Configuration
        </Button>
        {testResult && <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{testResult}</pre>}
      </CardContent>
    </Card>
  )
}
