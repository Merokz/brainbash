import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserFromToken } from "@/lib/auth"
import { getUserQuizzes } from "@/lib/db"
import { DashboardHeader } from "@/components/dashboard-header"
import { QuizList } from "@/components/quiz-list"

export default async function Dashboard() {
  const user = await getUserFromToken()

  if (!user) {
    redirect("/login")
  }

  const quizzes = await getUserQuizzes(user.id)

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      <main className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="space-x-4">
            <Link href="/create-quiz">
              <Button>Create Quiz</Button>
            </Link>
            <Link href="/host-game">
              <Button variant="outline">Host Game</Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Quizzes</CardTitle>
              <CardDescription>Manage your created quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              <QuizList quizzes={quizzes} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Games</CardTitle>
              <CardDescription>View your recently hosted games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground">No recent games found</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
