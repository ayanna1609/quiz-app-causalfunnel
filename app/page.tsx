"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function StartPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) return

    setIsLoading(true)

    // Store email in localStorage
    localStorage.setItem("quizEmail", email)

    // Fetch quiz questions
    try {
      const response = await fetch("https://opentdb.com/api.php?amount=15")
      const data = await response.json()

      if (data.results) {
        // Process questions and store in localStorage
        const processedQuestions = data.results.map((q: any, index: number) => ({
          id: index + 1,
          question: q.question,
          choices: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
          correctAnswer: q.correct_answer,
          userAnswer: null,
          visited: false,
          attempted: false,
        }))

        localStorage.setItem("quizQuestions", JSON.stringify(processedQuestions))
        localStorage.setItem("quizStartTime", Date.now().toString())

        router.push("/quiz/1")
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-blue-600">CausalFunnel</h1>
          </div>
          <CardTitle className="text-2xl">Quiz Application</CardTitle>
          <CardDescription>
            Welcome! Please enter your email address to start the 15-question quiz. You'll have 30 minutes to complete
            it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleStart} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !email}>
              {isLoading ? "Loading Questions..." : "Start Quiz"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
