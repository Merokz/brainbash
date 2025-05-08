import { NextRequest, NextResponse } from "next/server";
import { getHistory } from "@/lib/commands";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = Number(searchParams.get("userId"));

    const history = await getHistory(userId);

    if (!history) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(history);
  } catch (error) {
    console.error(
      "Error fetching user:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      {
        error: "Failed to fetch user",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
