"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import logoBanner from "@/public/logo.png";
import Image from "next/image";

interface HeaderProps {
  user: {
    username: string
  } | null
}

export function Header({ user }: HeaderProps ) {
  const router = useRouter()

  const handleHistory = async () => {
    router.push("/history")
  }

  const handleProfile = async () => {
    router.push("/profile")
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      //redirect to home with hard reload
      window.requestAnimationFrame(() => {
        window.location.href = "/"
      });
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Image src={logoBanner} alt="Logo" width={180}/>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <>
              <nav className="flex items-center space-x-2">
                <Link href="/quiz">
                  <Button variant="ghost">quizzes</Button>
                </Link>
              </nav>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-2">
                    {user.username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleProfile}>profile</DropdownMenuItem>
                  <DropdownMenuItem>settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleHistory}>history</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <nav className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost">login</Button>
              </Link>
              <Link href="/register">
                <Button variant="ghost">register</Button>
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}
