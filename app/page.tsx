import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getUserFromToken } from "@/lib/auth"
import { HomeHero } from "@/components/home-hero"
import { PublicLobbies } from "@/components/public-lobbies"
import { JoinPrivateGame } from "@/components/join-private-game"

export default async function Home() {
  const user = await getUserFromToken()

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
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link href="/create-quiz">
                  <Button>Create Quiz</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <HomeHero user={user} />
        <div className="container py-8 grid md:grid-cols-2 gap-8">
          <PublicLobbies />
          <JoinPrivateGame />
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
    // <CreateQuizPreview />
    // <DashboardPreview />
    // <GameHostPreview />
    // <GamePreview />
  )
}
