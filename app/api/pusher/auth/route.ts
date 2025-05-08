import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher-service";
import { getUserFromToken } from "@/lib/auth";
import { getParticipantFromToken } from "@/lib/auth";

// Define allowed methods for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  console.log("Pusher auth endpoint called");
  
  try {
    // Get the content type to determine how to parse the data
    const contentType = req.headers.get('content-type') || '';
    let socket_id = '';
    let channel_name = '';
    
    // Parse data based on content type
    if (contentType.includes('application/x-www-form-urlencoded') || 
        contentType.includes('multipart/form-data')) {
      // Parse as form data
      const formData = await req.formData();
      socket_id = formData.get('socket_id')?.toString() || '';
      channel_name = formData.get('channel_name')?.toString() || '';
    } else if (contentType.includes('application/json')) {
      // Parse as JSON
      const jsonData = await req.json();
      socket_id = jsonData.socket_id || '';
      channel_name = jsonData.channel_name || '';
    } else {
      // Try to get from URL params as fallback
      const url = new URL(req.url);
      socket_id = url.searchParams.get('socket_id') || '';
      channel_name = url.searchParams.get('channel_name') || '';
    }
    
    console.log("Socket ID:", socket_id);
    console.log("Channel name:", channel_name);
    
    if (!socket_id || !channel_name) {
      console.error("Missing socket_id or channel_name");
      return NextResponse.json(
        { error: "Missing socket_id or channel_name" }, 
        { status: 400 }
      );
    }

    // For presence channels, we need to authenticate with user data
    if (channel_name.startsWith('presence-')) {
      // Extract the lobby ID from the channel name
      const lobbyId = channel_name.split('presence-lobby-')[1];
      if (!lobbyId) {
        console.error("Pusher Auth: Invalid presence channel name, missing lobbyId:", channel_name);
        return NextResponse.json({ error: "Invalid channel name" }, { status: 400 });
      }

      // Check if this is a user or a participant
      const user = await getUserFromToken();
      
      if (user) {
        console.log("Pusher Auth: User found:", user.id);
      } else {
        console.log("Pusher Auth: No user found, checking for participant token.");
      }

      // If we have a user token, authenticate as the user
      if (user) {
        console.log("Pusher Auth: Authenticating as user:", user.id);
        const userData = {
          user_id: `user-${user.id}`,
          user_info: {
            name: user.username,
            isHost: true,
          }
        };
        
        const authResponse = pusherServer.authorizeChannel(socket_id, channel_name, userData);
        return NextResponse.json(authResponse);
      }
      
      // If there's no user token, look for a participant token
      console.log("Pusher Auth: No user token found or user auth failed. Attempting participant authentication for lobby:", lobbyId);
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        console.log("Pusher Auth: Found Bearer token for participant.");
        
        const participant = await getParticipantFromToken(token);
        
        if (participant) {
          console.log("Pusher Auth: Participant data from token:", { id: participant.id, username: participant.username, lobbyId: participant.lobbyId });
          console.log(`Pusher Auth: Comparing participant.lobbyId (${participant.lobbyId}, type: ${typeof participant.lobbyId}) with channel lobbyId string ('${lobbyId}', parsed as number: ${Number(lobbyId)})`);
          
          // Ensure consistent type comparison, Prisma typically returns numbers for IDs.
          if (participant.lobbyId === Number(lobbyId)) {
            console.log("Pusher Auth: Participant authenticated successfully for lobby:", lobbyId);
            const userData = {
              user_id: `participant-${participant.id}`,
              user_info: {
                name: participant.username,
                isHost: false,
              }
            };
            
            const authResponse = pusherServer.authorizeChannel(socket_id, channel_name, userData);
            return NextResponse.json(authResponse);
          } else {
            console.error(`Pusher Auth: Participant's lobbyId (${participant.lobbyId}) does not match channel's lobbyId (${Number(lobbyId)}).`);
          }
        } else {
          console.error("Pusher Auth: getParticipantFromToken returned null. Token might be invalid, expired, or participant not found in DB for the details in token.");
        }
      } else {
        console.error("Pusher Auth: No Authorization header with Bearer token found for participant.");
      }
      
      // Neither a valid user nor participant token was provided
      console.error("Pusher Auth: Authentication failed: unauthorized. User and participant checks did not pass for channel:", channel_name);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // For private channels, we just need to authenticate
    if (channel_name.startsWith('private-')) {
      console.log("Authenticating private channel");
      const authResponse = pusherServer.authorizeChannel(socket_id, channel_name);
      return NextResponse.json(authResponse);
    }
    
    // Public channels don't need authentication
    console.log("Public channel, no authentication required");
    return NextResponse.json({}, { status: 200 });
    
  } catch (error) {
    console.error("Error authenticating Pusher channel:", error);
    return NextResponse.json(
      { error: "Failed to authenticate" },
      { status: 500 }
    );
  }
}
