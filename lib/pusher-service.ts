import Pusher from 'pusher';

// Server-side Pusher instance
export const pusherServer = new Pusher({
    appId: process.env.PUSHER_APP_ID || '1980572',
    key: process.env.PUSHER_KEY || 'e71affa9b3e272313888',
    secret: process.env.PUSHER_SECRET || '0a47e08d02ff4d78cdf2',
    cluster: process.env.PUSHER_CLUSTER || 'eu',
    useTLS: true,
});

// Event names - centralizing these to avoid string duplication
export const EVENTS = {
    // Lobby events
    LOBBY_UPDATED: 'lobby-updated',
    PARTICIPANT_JOINED: 'participant-joined',
    PARTICIPANT_LEFT: 'participant-left',

    // Game events
    GAME_STARTED: 'game-started',
    QUESTION_STARTED: 'question-started',
    QUESTION_ENDED: 'question-ended',
    ANSWER_SUBMITTED: 'answer-submitted',
    GAME_ENDED: 'game-ended',

    // Host events
    HOST_DISCONNECTED: 'host-disconnected',
};

// Channel names - functions to generate consistent channel names
export const CHANNELS = {
    lobby: (lobbyId: string) => `presence-lobby-${lobbyId}`,
    game: (lobbyId: string) => `private-game-${lobbyId}`,
};
