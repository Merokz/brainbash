"use server"
import { cacheClient } from "@/lib/cache";
import { Prisma } from "@prisma/client";
import { CACHE_TTL } from "../../prisma";

type LobbyPublic = Prisma.LobbyGetPayload<{
  include: {
    quiz: {
      include: {
        questions: {
          include: {
            answers: true;
          };
        };
      };
    };
    host: {
      select: {
        username: true;
      };
    };
    _count: {
      select: {
        participants: true;
      };
    };
  };
}>;

// Lobby functions
export async function getPublicLobbies(): Promise<LobbyPublic[]> {
  const cacheKey = "PublicLobbies:all";
  return cacheClient.get<LobbyPublic[]>(
    cacheKey,
    () =>
      prisma.lobby.findMany({
        where: {
          quiz: {
            isPublic: true,
          },
          state: "IN_LOBBY",
          valid: true,
        },
        include: {
          quiz: {
            include: {
              questions: {
                include: {
                  answers: true,
                },
              },
            },
          },
          host: {
            select: {
              username: true,
            },
          },
          _count: {
            select: {
              participants: true,
            },
          },
        },
      }),
    CACHE_TTL // Pass the specific TTL here
  );
}
