'use client';

import { Card, CardContent } from '@/components/ui/card';
import { JSX } from 'react';

export const GameWaitingScreen = (): JSX.Element => {
    return (
        <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center py-12">
                <h2 className="text-2xl font-bold mb-4">
                    waiting for the next question
                </h2>
                <div className="animate-pulse flex justify-center">
                    <div className="h-4 w-4 bg-primary rounded-full mx-1" />
                    <div className="h-4 w-4 bg-primary rounded-full mx-1 animate-pulse delay-150" />
                    <div className="h-4 w-4 bg-primary rounded-full mx-1 animate-pulse delay-300" />
                </div>
            </CardContent>
        </Card>
    );
};
