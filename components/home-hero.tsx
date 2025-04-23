import Link from "next/link"
import { Button } from "@/components/ui/button"

interface HomeHeroProps {
  user: any
}

export function HomeHero({ user }: HomeHeroProps) {
  return (
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
            {user ? (
              <Link href="/host-game">
                <Button size="lg">Host a Game</Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button size="lg">Get Started</Button>
              </Link>
            )}
            <Link href="#join-game">
              <Button variant="outline" size="lg">
                Join a Game
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
