"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import logo from "@/public/logo.png"
import { showToast } from "@/lib/sonner"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!email) {
      showToast("email is required!", false)
      return;
    }
  
    setLoading(true)
  
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }), // ✅ only send the email now
      });
  
      if (response.ok) {
        showToast("if this email exists, we've sent instructions to reset your password.", true)
      } else {
        showToast("something went wrong.", false)
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      showToast("an unexpected error occurred", false);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Image src={logo} alt="Logo" width={250} height={250} />
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive reset instructions</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            Remembered your password?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Go back to login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
