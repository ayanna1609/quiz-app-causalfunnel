"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Clock, ChevronLeft, ChevronRight } from "lucide-react"

interface Question {
  id: number
  question: string
  choices: string[]
  correctAnswer: string
  userAnswer: string | null
  visited: boolean
  attempted: boolean
}

export default function QuizPage() {
  const router = useRouter()
  const params = useParams()
  const questionId = Number.parseInt(params.id as string)

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes in seconds
  const [selectedAnswer, setSelectedAnswer] = useState("")

  useEffect(() => {
    // Load questions from localStorage
    const storedQuestions = localStorage.getItem("quizQuestions")
    const startTime = localStorage.getItem("quizStartTime")

    if (!storedQuestions || !startTime) {
      router.push("/")
      return
    }

    const parsedQuestions = JSON.parse(storedQuestions)
    setQuestions(parsedQuestions)

    // Calculate remaining time
    const elapsed = Math.floor((Date.now() - Number.parseInt(startTime)) / 1000)
    const remaining = Math.max(0, 30 * 60 - elapsed)
    setTimeLeft(remaining)

    // Find current question
    const question = parsedQuestions.find((q: Question) => q.id === questionId)
    if (question) {
      setCurrentQuestion(question)
      setSelectedAnswer(question.userAnswer || "")

      // Mark as visited
      const updatedQuestions = parsedQuestions.map((q: Question) => (q.id === questionId ? { ...q, visited: true } : q))
      setQuestions(updatedQuestions)
      localStorage.setItem("quizQuestions", JSON.stringify(updatedQuestions))
    }
  }, [questionId, router])

  useEffect(() => {
    // Timer countdown
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      // Auto-submit when time runs out
      handleSubmitQuiz()
    }
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (answer: string) => {
    setSelectedAnswer(answer)

    // Update question in state and localStorage
    const updatedQuestions = questions.map((q) =>
      q.id === questionId ? { ...q, userAnswer: answer, attempted: true } : q,
    )
    setQuestions(updatedQuestions)
    localStorage.setItem("quizQuestions", JSON.stringify(updatedQuestions))
  }

  const handleNavigation = (direction: "prev" | "next") => {
    const newId = direction === "prev" ? questionId - 1 : questionId + 1
    if (newId >= 1 && newId <= 15) {
      router.push(`/quiz/${newId}`)
    }
  }

  const handleQuestionJump = (id: number) => {
    router.push(`/quiz/${id}`)
  }

  const handleSubmitQuiz = () => {
    localStorage.setItem("quizCompleted", "true")
    router.push("/results")
  }

  if (!currentQuestion) {
    return <div>Loading...</div>
  }

  const progress = (questionId / 15) * 100
  const attemptedCount = questions.filter((q) => q.attempted).length

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-blue-600">CausalFunnel Quiz</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-red-600">
                <Clock className="w-5 h-5" />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
              <Button onClick={handleSubmitQuiz} variant="outline">
                Submit Quiz
              </Button>
            </div>
          </div>
          <Progress value={progress} className="mt-3" />
          <p className="text-sm text-gray-600 mt-2">
            Question {questionId} of 15 • {attemptedCount} attempted
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Overview Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Questions Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                  {questions.map((q) => (
                    <Button
                      key={q.id}
                      variant={q.id === questionId ? "default" : "outline"}
                      size="sm"
                      className={`relative ${
                        q.attempted
                          ? "bg-green-100 border-green-300"
                          : q.visited
                            ? "bg-yellow-100 border-yellow-300"
                            : ""
                      }`}
                      onClick={() => handleQuestionJump(q.id)}
                    >
                      {q.id}
                      {q.attempted && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />}
                    </Button>
                  ))}
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span>Attempted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-300 rounded" />
                    <span>Visited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-gray-300 rounded" />
                    <span>Not visited</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Question {questionId}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  className="text-lg leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
                />

                <RadioGroup value={selectedAnswer} onValueChange={handleAnswerChange} className="space-y-3">
                  {currentQuestion.choices.map((choice, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                      <RadioGroupItem value={choice} id={`choice-${index}`} />
                      <Label
                        htmlFor={`choice-${index}`}
                        className="flex-1 cursor-pointer"
                        dangerouslySetInnerHTML={{ __html: choice }}
                      />
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => handleNavigation("prev")} disabled={questionId === 1}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {questionId === 15 ? (
                    <Button onClick={handleSubmitQuiz}>Submit Quiz</Button>
                  ) : (
                    <Button onClick={() => handleNavigation("next")}>
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
