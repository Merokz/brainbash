import { PrismaClient } from "@prisma/client"
import { compare, hash } from "bcrypt"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const prisma = new PrismaClient()
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key-change-in-production")

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10)
}

export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return compare(plainPassword, hashedPassword)
}

export async function createUserToken(userId: number): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY)

  return token
}

export async function createParticipantToken(participantId: number, lobbyId: number): Promise<string> {
  const token = await new SignJWT({ participantId, lobbyId, role: "participant" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h") // Games auto-terminate after 8 hours
    .sign(SECRET_KEY)

  return token
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    return payload
  } catch (error) {
    return null
  }
}

export async function getUserFromToken(): Promise<any> {
  const cookieStore = cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload || !payload.userId) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId, valid: true },
    select: {
      id: true,
      username: true,
      email: true,
      isRegistered: true,
    },
  })

  return user
}

export async function getParticipantFromToken(token: string): Promise<any> {
  const payload = await verifyToken(token)
  if (!payload || !payload.participantId || !payload.lobbyId) return null

  const participant = await prisma.participant.findUnique({
    where: {
      id: payload.participantId,
      lobbyId: payload.lobbyId,
      valid: true,
    },
    include: {
      lobby: true,
    },
  })

  return participant
}
