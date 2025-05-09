"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import logo from "@/public/logo.png";
import Image from "next/image";
import { showToast } from "@/lib/sonner"

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.username || !formData.password) {
      showToast("all fields are required", false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      })

      if (response.ok) {
        // Login successful, redirect to home with hard reload
        window.requestAnimationFrame(() => {
          window.location.href = "/"
        });
      } else {
        const errorData = await response.json()
        showToast("login failed", false)
      }
    } catch (error) {
      showToast("an error occurred during login", false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Image src={logo} alt="Logo" width={250} height={250} />
          <CardTitle className="text-2xl font-bold">login</CardTitle>
          <CardDescription>enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">username or email</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="enter your username or email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="enter your password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "logging in..." : "login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <div>
            forgot your password?
            <Link href="/forgot-password" className="text-primary hover:underline ml-2">
              reset it here
            </Link>
          </div>
          <div>
            don&apos;t have an account?
            <Link href="/register" className="text-primary hover:underline ml-2">
              sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
