"use client"

import React, { useState, useEffect } from 'react';
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { getHistory } from '@/lib/db';

export default function History() {
    const [user, setUser] = useState<any>(null);
    const [lobbies, setLobbies] = useState<any[]>([null]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const userResponse = await fetch('/api/auth/me');
                if (!userResponse.ok) {
                    console.error("User not authorized");
                    setLoading(false);
                    return;
                }
                const userData = await userResponse.json();
                setUser(userData);
    
                const historyResponse = await fetch(`/api/lobbies/history?userId=${userData.id}`);
                console.log('historyresponse:', historyResponse);
                if (!historyResponse.ok) {
                    console.error("Failed to fetch history");
                    setLoading(false);
                    return;
                }
    
                const history = await historyResponse.json();
                setLobbies(history);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };
    
        fetchData();
    }, []);
    
    if(loading) return <div>Loading...</div>
    else return(
    <div className="flex min-h-screen flex-col">
      {user && <DashboardHeader user={user} />}
      <main className="flex-1 container py-8">
        <div className="flex items-center mb-8">
          <h1 className="text-3xl font-bold">History</h1>
        </div>

        {lobbies.length > 0 ? 
            <div className="grid gap-8 md:grid-cols-4">
                {lobbies.map((lobby) => {
                    return (
                        <Card key={lobby.id}>
                            <CardHeader>
                            <CardTitle>lobby.</CardTitle>
                            <CardDescription>Manage your created quizzes</CardDescription>
                            </CardHeader>
                            <CardContent>
                            </CardContent>
                        </Card>
                    )})
                }
            </div>
            : <h2>No history</h2>
        }
        
      </main>
    </div>
    )
}