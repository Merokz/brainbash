import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getUserFromToken } from "@/lib/auth"
import { HomeHero } from "@/components/home-hero"
import { PublicLobbies } from "@/components/public-lobbies"
import { JoinPrivateGame } from "@/components/join-private-game"
import logoBanner from "@/public/logo-banner.png";
import Image from "next/image";

export default async function Home() {
  const user = await getUserFromToken();

  return (
    <div className="flex min-h-screen flex-col">
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
  )
}
