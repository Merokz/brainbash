import { findUserById, getParticipantByIdAndLobbyId } from "./commands";
import { compare, hash } from "bcrypt";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-secret-key-change-in-production"
);

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(plainPassword, hashedPassword);
}

export async function createUserToken(userId: number): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);

  return token;
}

export async function createParticipantToken(
  participantId: number,
  lobbyId: number
): Promise<string> {
  const token = await new SignJWT({
    participantId,
    lobbyId,
    role: "participant",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h") // Games auto-terminate after 8 hours
    .sign(SECRET_KEY);

  return token;
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getUserFromToken(): Promise<any> {
  const cookieStore = cookies(); // Get the cookie store instance
  const token = (await cookieStore).get("auth_token")?.value; // Access its methods directly

  if (!token) {
    // This is a normal case for guests/participants, so no error log needed here.
    return null;
  }
  try {
    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      // Token is present but invalid or doesn't contain userId
      return null;
    }

    const user = await findUserById(payload.userId);
    if (!user) {
      // User ID from token not found in DB
      return null;
    }
    console.log("getUserFromToken - User found:", user.id); 
    return user;
  } catch (error) {
    console.error("getUserFromToken: Error verifying token or fetching user:", error);
    return null;
  }
}

export async function getParticipantFromToken(token: string): Promise<any> {
  try {
    const payload = await verifyToken(token);
    if (!payload || !payload.participantId || !payload.lobbyId) {
      console.log("getParticipantFromToken: Invalid token payload or missing participantId/lobbyId."); // Optional debug
      return null;
    }

    const participant = await getParticipantByIdAndLobbyId(
      payload.participantId,
      payload.lobbyId,
    );
    console.log("getParticipantFromToken - Participant from DB:", participant);
    return participant;
  } catch (error) {
    console.error("getParticipantFromToken: Error verifying token or fetching participant:", error);
    return null;
  }
}
