"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, User, RotateCcw } from "lucide-react"

interface Question {
  id: number
  question: string
  choices: string[]
  correctAnswer: string
  userAnswer: string | null
  visited: boolean
  attempted: boolean
}

export default function ResultsPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [email, setEmail] = useState("")
  const [score, setScore] = useState(0)
  const [completionTime, setCompletionTime] = useState("")

  useEffect(() => {
    const storedQuestions = localStorage.getItem("quizQuestions")
    const storedEmail = localStorage.getItem("quizEmail")
    const startTime = localStorage.getItem("quizStartTime")
    const completed = localStorage.getItem("quizCompleted")

    if (!storedQuestions || !completed) {
      router.push("/")
      return
    }

    const parsedQuestions = JSON.parse(storedQuestions)
    setQuestions(parsedQuestions)
    setEmail(storedEmail || "")

    // Calculate score
    const correctAnswers = parsedQuestions.filter((q: Question) => q.userAnswer === q.correctAnswer).length
    setScore(correctAnswers)

    // Calculate completion time
    if (startTime) {
      const elapsed = Math.floor((Date.now() - Number.parseInt(startTime)) / 1000)
      const minutes = Math.floor(elapsed / 60)
      const seconds = elapsed % 60
      setCompletionTime(`${minutes}m ${seconds}s`)
    }
  }, [router])

  const handleRestart = () => {
    localStorage.clear()
    router.push("/")
  }

  const getAnswerStatus = (question: Question) => {
    if (!question.userAnswer) return "unanswered"
    return question.userAnswer === question.correctAnswer ? "correct" : "incorrect"
  }

  const scorePercentage = Math.round((score / 15) * 100)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-blue-600">Quiz Results</CardTitle>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Completed in {completionTime}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold">{score}/15</div>
              <div className="text-xl text-gray-600">{scorePercentage}% Score</div>
              <div className="flex justify-center gap-4">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {score} Correct
                </Badge>
                <Badge variant="outline" className="text-red-600 border-red-600">
                  <XCircle className="w-4 h-4 mr-1" />
                  {15 - score} Incorrect
                </Badge>
              </div>
              <Button onClick={handleRestart} className="mt-4">
                <RotateCcw className="w-4 h-4 mr-2" />
                Take Quiz Again
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Detailed Results</h2>
          {questions.map((question) => {
            const status = getAnswerStatus(question)
            return (
              <Card key={question.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">Question {question.id}</CardTitle>
                    <Badge
                      variant={status === "correct" ? "default" : status === "incorrect" ? "destructive" : "secondary"}
                    >
                      {status === "correct" && <CheckCircle className="w-4 h-4 mr-1" />}
                      {status === "incorrect" && <XCircle className="w-4 h-4 mr-1" />}
                      {status === "correct" ? "Correct" : status === "incorrect" ? "Incorrect" : "Not Answered"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="font-medium" dangerouslySetInnerHTML={{ __html: question.question }} />

                  <div className="grid gap-3">
                    {question.choices.map((choice, index) => {
                      const isUserAnswer = choice === question.userAnswer
                      const isCorrectAnswer = choice === question.correctAnswer

                      return (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border-2 ${
                            isCorrectAnswer
                              ? "border-green-500 bg-green-50"
                              : isUserAnswer && !isCorrectAnswer
                                ? "border-red-500 bg-red-50"
                                : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span dangerouslySetInnerHTML={{ __html: choice }} />
                            <div className="flex gap-2">
                              {isCorrectAnswer && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  Correct Answer
                                </Badge>
                              )}
                              {isUserAnswer && (
                                <Badge
                                  variant="outline"
                                  className={
                                    isCorrectAnswer ? "text-green-600 border-green-600" : "text-red-600 border-red-600"
                                  }
                                >
                                  Your Answer
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
