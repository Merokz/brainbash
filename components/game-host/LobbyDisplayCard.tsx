"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, ChevronRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface LobbyDisplayCardProps {
  joinCode: string;
  participantsCount: number;
  onCopyJoinCode: () => void;
  onStartGame: () => void;
  isStartingGame: boolean;
}

export function LobbyDisplayCard({
  joinCode,
  participantsCount,
  onCopyJoinCode,
  onStartGame,
  isStartingGame,
}: LobbyDisplayCardProps) {
  const joinLink = typeof window !== 'undefined' ? `${window.location.origin}/join?code=${joinCode}` : '';

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>share join code</CardTitle>
          <CardDescription>participants use this code to join the lobby.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">

          {joinLink && (
            <div className="p-2 bg-white rounded-lg shadow">
              <QRCodeSVG value={joinLink} size={180} />
            </div>
          )}
          <div className="text-5xl font-bold tracking-wider p-4 border-2 border-dashed border-primary rounded-lg">
            {joinCode}
          </div>
          <Button variant="outline" onClick={onCopyJoinCode} className="w-full max-w-xs">
            <Copy className="mr-2 h-4 w-4" />
            copy code
          </Button>
          {joinLink && (
            <p className="text-sm text-muted-foreground text-center">
              or share this link: <a href={joinLink} target="_blank" rel="noopener noreferrer" className="underline">{joinLink}</a>
            </p>
          )}
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button size="lg" onClick={onStartGame} disabled={participantsCount === 0 || isStartingGame} loading={isStartingGame}>
          start game ({participantsCount} {participantsCount === 1 ? "player" : "players"})
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
}