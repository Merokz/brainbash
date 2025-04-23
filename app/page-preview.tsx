"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function HomePreview() {
  const [joinCode, setJoinCode] = useState("")
  const [username, setUsername] = useState("")

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">BrainBash</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Welcome to BrainBash
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Create and participate in interactive quiz games in real-time
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/register">
                  <Button size="lg">Get Started</Button>
                </Link>
                <Link href="#join-game">
                  <Button variant="outline" size="lg">
                    Join a Game
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="container py-8 grid md:grid-cols-2 gap-8">
          {/* Public Games Card */}
          <Card id="join-game">
            <CardHeader>
              <CardTitle>Public Games</CardTitle>
              <CardDescription>Join an ongoing public quiz game</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer">
                  <div>
                    <h3 className="font-medium">General Knowledge Quiz</h3>
                    <p className="text-sm text-muted-foreground">Hosted by QuizMaster</p>
                  </div>
                  <div className="text-sm text-muted-foreground">5 participants</div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer">
                  <div>
                    <h3 className="font-medium">Science Trivia</h3>
                    <p className="text-sm text-muted-foreground">Hosted by ScienceGuru</p>
                  </div>
                  <div className="text-sm text-muted-foreground">3 participants</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Join Private Game Card */}
          <Card>
            <CardHeader>
              <CardTitle>Join Private Game</CardTitle>
              <CardDescription>Enter a 5-digit code to join a private quiz game</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="join-code">Game Code</Label>
                  <Input
                    id="join-code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter 5-digit code"
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Your Name</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your display name"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Join Game
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} BrainBash. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
