import { NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { getPublicQuizzes, getUserQuizzes } from "@/lib/commands";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "public") {
      const quizzes = await getPublicQuizzes();
      return NextResponse.json(quizzes);
    } else if (type === "user") {
      const user = await getUserFromToken();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const quizzes = await getUserQuizzes(user.id);
      return NextResponse.json(quizzes);
    }

    return NextResponse.json(
      { error: "Invalid query parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}
