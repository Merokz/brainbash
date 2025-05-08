import PusherClient from 'pusher-js';
import { useEffect, useState } from 'react';

// Event names - importing from central location to keep them in sync
import { EVENTS, CHANNELS } from './pusher-service';

// Singleton pattern for Pusher client
let pusherClientInstance: PusherClient | null = null;

export function getPusherClient() {
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY || "e71affa9b3e272313888", 
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu",
        authEndpoint: '/api/pusher/auth',
        auth: {
          headers: () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem("participant_token") : null;
            if (token) {
              return { Authorization: `Bearer ${token}` };
            }
            return {};
          },
        },
        enabledTransports: ["ws", "wss"],
        activityTimeout: 30000,
        pongTimeout: 15000
      }
    );
    
    // Add connection state handlers
    pusherClientInstance.connection.bind('connected', () => {
      console.log('Connected to Pusher');
    });
    
    pusherClientInstance.connection.bind('disconnected', () => {
      console.log('Disconnected from Pusher');
    });
    
    pusherClientInstance.connection.bind('error', (err: any) => {
      console.error('Pusher connection error:', err);
    });
  }
  return pusherClientInstance;
}

// Custom hook for subscribing to channels
export function useChannel(channelName: string) {
  const [channel, setChannel] = useState<any>(null);
  
  useEffect(() => {
    const client = getPusherClient();
    const channel = client.subscribe(channelName);
    setChannel(channel);
    
    return () => {
      client.unsubscribe(channelName);
    };
  }, [channelName]);
  
  return channel;
}

// Re-export EVENTS and CHANNELS for convenience
export { EVENTS, CHANNELS };