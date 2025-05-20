import PusherClient, { Channel } from 'pusher-js';
import { useEffect, useState } from 'react';

// Event names - importing from central location to keep them in sync
import { CHANNELS, EVENTS } from './pusher-service';

// Singleton pattern for Pusher client
let pusherClientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient {
    if (!pusherClientInstance) {
        console.log('Initializing PusherClient instance'); // DEBUG
        pusherClientInstance = new PusherClient(
            process.env.NEXT_PUBLIC_PUSHER_KEY || 'e71affa9b3e272313888',
            {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                authorizer: (channel, options) => {
                    return {
                        authorize: (socketId, callback) => {
                            console.log(
                                `[Pusher Authorizer] Custom authorizer called for channel: ${channel.name}, socketId: ${socketId}`,
                            );
                            const token =
                                typeof window !== 'undefined'
                                    ? localStorage.getItem('participant_token')
                                    : null;
                            console.log(
                                '[Pusher Authorizer] Token from localStorage:',
                                token,
                            );

                            const authRequestParams = new URLSearchParams();
                            authRequestParams.append('socket_id', socketId);
                            authRequestParams.append(
                                'channel_name',
                                channel.name,
                            );

                            fetch('/api/pusher/auth', {
                                method: 'POST',
                                headers: {
                                    'Content-Type':
                                        'application/x-www-form-urlencoded',
                                    ...(token && {
                                        Authorization: `Bearer ${token}`,
                                    }), // Conditionally add Authorization header
                                },
                                body: authRequestParams.toString(),
                            })
                                .then((response) => {
                                    if (!response.ok) {
                                        console.error(
                                            `[Pusher Authorizer] Auth request failed with status: ${response.status} for channel ${channel.name}`,
                                        );
                                        response
                                            .text()
                                            .then((text) =>
                                                console.error(
                                                    '[Pusher Authorizer] Error body:',
                                                    text,
                                                ),
                                            );
                                        callback(
                                            new Error(
                                                `Authentication failed for ${channel.name} with status ${response.status}`,
                                            ),
                                            null,
                                        );
                                        return;
                                    }
                                    return response.json();
                                })
                                .then((data) => {
                                    console.log(
                                        `[Pusher Authorizer] Auth request successful for channel ${channel.name}, data:`,
                                        data,
                                    );
                                    callback(null, data);
                                })
                                .catch((error) => {
                                    console.error(
                                        `[Pusher Authorizer] Auth request error for channel ${channel.name}:`,
                                        error,
                                    );
                                    callback(error, null);
                                });
                        },
                    };
                },
                enabledTransports: ['ws', 'wss'],
                activityTimeout: 30000,
                pongTimeout: 15000,
            },
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
export function useChannel(channelName: string): Channel {
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
export { CHANNELS, EVENTS };
