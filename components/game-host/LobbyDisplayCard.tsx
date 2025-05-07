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
}

export function LobbyDisplayCard({
  joinCode,
  participantsCount,
  onCopyJoinCode,
  onStartGame,
}: LobbyDisplayCardProps) {
  const joinLink = typeof window !== 'undefined' ? `${window.location.origin}/join?code=${joinCode}` : '';

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Share Join Code</CardTitle>
          <CardDescription>Participants use this code to join the lobby.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="text-5xl font-bold tracking-wider p-4 border-2 border-dashed border-primary rounded-lg">
            {joinCode}
          </div>
          <Button variant="outline" onClick={onCopyJoinCode} className="w-full max-w-xs">
            <Copy className="mr-2 h-4 w-4" />
            Copy Code
          </Button>
          {joinLink && (
            <div className="p-2 bg-white rounded-lg shadow">
              <QRCodeSVG value={joinLink} size={180} />
            </div>
          )}
          {joinLink && (
            <p className="text-sm text-muted-foreground text-center">
              Or share this link: <a href={joinLink} target="_blank" rel="noopener noreferrer" className="underline">{joinLink}</a>
            </p>
          )}
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button size="lg" onClick={onStartGame} disabled={participantsCount === 0}>
          Start Game ({participantsCount} {participantsCount === 1 ? "player" : "players"})
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
}