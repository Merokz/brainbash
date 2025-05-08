import { NextResponse } from "next/server";
import { checkExistingUser, createUser } from "@/lib/commands";
import { hashPassword, createUserToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();
    // Check if user already exists
    const existingUser = await checkExistingUser(username, email);

    if (existingUser) {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    // Create user
    const user = await createUser(username, email, hashedPassword);

    // Create token
    const token = await createUserToken(user.id);

    // Set cookie
    (
      await // Set cookie
      cookies()
    ).set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
