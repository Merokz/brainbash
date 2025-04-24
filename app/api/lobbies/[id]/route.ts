import { NextRequest, NextResponse } from "next/server";
import { getLobbyById } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken();
    // We'll allow accessing the lobby even without authentication
    // but we'll include user info if they're authenticated
    
    // In Next.js App Router, params should be properly accessed
    const id = params.id; // This is fine in route handlers as of Next.js 14
    const lobbyId = Number(id);
    if (isNaN(lobbyId)) {
      return NextResponse.json({ error: "Invalid lobby ID" }, { status: 400 });
    }
    
    const lobby = await getLobbyById(lobbyId);
    
    if (!lobby) {
      return NextResponse.json({ error: "Lobby not found" }, { status: 404 });
    }
    
    // If we get here, the lobby exists
    return NextResponse.json(lobby);
  } catch (error) {
    console.error("Error fetching lobby:", error);
    return NextResponse.json(
      { error: "Failed to fetch lobby" },
      { status: 500 }
    );
  }
}
