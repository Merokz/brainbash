import { NextRequest, NextResponse } from "next/server";
import { getLobbyById } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken();
    const lobbyId = Number(params.id);
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
