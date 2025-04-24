import { prisma } from '@/lib/db';
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr"



// This would be used on the server-side to manage connections
export class QuizHub {
  private static instance: QuizHub
  private connections: Map<string, Set<string>> = new Map() // lobbyId -> connectionIds

  private constructor() {}

  public static getInstance(): QuizHub {
    if (!QuizHub.instance) {
      QuizHub.instance = new QuizHub()
    }
    return QuizHub.instance
  }

  public addConnection(lobbyId: string, connectionId: string): void {
    if (!this.connections.has(lobbyId)) {
      this.connections.set(lobbyId, new Set())
    }
    this.connections.get(lobbyId)?.add(connectionId)
  }

  public removeConnection(connectionId: string): void {
    for (const [lobbyId, connections] of this.connections.entries()) {
      if (connections.has(connectionId)) {
        connections.delete(connectionId)
        if (connections.size === 0) {
          this.connections.delete(lobbyId)
        }
        break
      }
    }
  }

  public getConnectionsForLobby(lobbyId: string): Set<string> {
    return this.connections.get(lobbyId) || new Set()
  }
}

// This would be used on the client-side to connect to the hub
export function createHubConnection(hubUrl: string) {
  return new HubConnectionBuilder()
    .withUrl(hubUrl)
    .configureLogging(LogLevel.Information)
    .withAutomaticReconnect()
    .build()
}
