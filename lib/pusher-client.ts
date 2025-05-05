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
          headers: {
            // Include authorization header for participant authentication
            get authorization() {
              // Use try-catch to handle cases where localStorage isn't available
              try {
                const token = localStorage.getItem('participant_token');
                return token ? `Bearer ${token}` : '';
              } catch (e) {
                console.log("Error accessing localStorage:", e);
                return '';
              }
            }
          }
        }
      }
    );
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