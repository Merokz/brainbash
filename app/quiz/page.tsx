'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, SquarePlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { JSX, Suspense, useEffect, useState } from 'react';

interface Quiz {
    id: number;
    title: string;
    description: string | null;
    isPublic: boolean;
    _count: {
        questions: number;
    };
}

<<<<<<< HEAD
const HostGame = (): JSX.Element => {
    const [publicQuizzes, setPublicQuizzes] = useState<Quiz[]>([]);
    const [userQuizzes, setUserQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const router = useRouter();
=======
export default function HostGame() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [publicQuizzes, setPublicQuizzes] = useState<Quiz[]>([])
  const [userQuizzes, setUserQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [hostingQuizId, setHostingQuizId] = useState<number | null>(null)
>>>>>>> main

    useEffect(() => {
        const fetchData = async (): Promise<any> => {
            try {
                // Fetch public quizzes
                const publicResponse = await fetch('/api/quizzes?type=public');
                const publicData = await publicResponse.json();
                setPublicQuizzes(publicData);

                // Fetch user quizzes
                const userResponse = await fetch('/api/quizzes?type=user');
                const userData = await userResponse.json();
                setUserQuizzes(userData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleHostQuiz = async (quizId: number): Promise<any> => {
        try {
            const response = await fetch('/api/lobbies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    quizId,
                    isPublic: true,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                router.push(`/lobby/${data.id}`);
            } else {
                console.error('Failed to create lobby');
            }
        } catch (error) {
            console.error('Error creating lobby:', error);
        }
    };

    const handleEditQuiz = async (quizId: number): Promise<any> => {
        router.push(`/quiz/edit/${quizId}`);
    };

<<<<<<< HEAD
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
=======
        // Fetch user quizzes
        const userResponse = await fetch("/api/quizzes?type=user")
        const userData = await userResponse.json()
        setUserQuizzes(userData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleHostQuiz = async (quizId: number) => {
    setHostingQuizId(quizId)
    try {
      const response = await fetch("/api/lobbies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId,
          isPublic: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/game/${data.id}/host`)
      } else {
        console.error("Failed to create lobby")
      }
    } catch (error) {
      console.error("Error creating lobby:", error)
    } finally {
      setHostingQuizId(null)
    }
  }

  const handleEditQuiz = async (quizId: number) => {
    router.push(`/quiz/edit/${quizId}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-8">
        <div className="mb-8 w-full flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">quizzes</h1>
            <p className="text-muted-foreground">select a quiz to host a new game</p>
          </div>
          <Link href="/quiz/create">
              <Button className="flex">
                <SquarePlus className="" />
                create a quiz
              </Button>
            </Link>
        </div>

        <Tabs defaultValue="your">
          <div className="w-full md:flex">
            <TabsList className="mb-4">
              <TabsTrigger value="your">your quizzes</TabsTrigger>
              <TabsTrigger value="public">public quizzes</TabsTrigger>
            </TabsList>
            <div className="md:ml-8">
              <Input
                type="text"
                placeholder="search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-input bg-background text-sm px-4 py-2 rounded-md w-[250px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
>>>>>>> main
            </div>
        );
    }

<<<<<<< HEAD
    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1 container py-8">
                <div className="mb-8 w-full flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">quizzes</h1>
                        <p className="text-muted-foreground">
                            select a quiz to host a new game
                        </p>
                    </div>
                    <Link href="/quiz/create">
                        <Button className="flex">
                            <SquarePlus className="" />
                            create a quiz
                        </Button>
                    </Link>
                </div>

                <Tabs defaultValue="your">
                    <div className="w-full md:flex">
                        <TabsList className="mb-4">
                            <TabsTrigger value="your">your quizzes</TabsTrigger>
                            <TabsTrigger value="public">
                                public quizzes
                            </TabsTrigger>
                        </TabsList>
                        <div className="md:ml-8">
                            <Input
                                type="text"
                                placeholder="search quizzes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border border-input bg-background text-sm px-4 py-2 rounded-md w-[250px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                            />
                        </div>
                    </div>

                    <Suspense
                        fallback={
                            <div className="animate-pulse">loading...</div>
                        }
                    >
                        <TabsContent value="your" className="space-y-4">
                            {userQuizzes.length > 0 ? (
                                userQuizzes
                                    .filter((quiz) =>
                                        quiz.title
                                            .toLowerCase()
                                            .includes(searchTerm.toLowerCase()),
                                    )
                                    .map((quiz) => (
                                        <Card key={quiz.id}>
                                            <CardHeader>
                                                <CardTitle>
                                                    {quiz.title}
                                                </CardTitle>
                                                <CardDescription>
                                                    {quiz.description ||
                                                        'No description provided'}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex justify-between items-center">
                                                    <div className="text-sm text-muted-foreground">
                                                        {quiz._count.questions}{' '}
                                                        questions
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleEditQuiz(
                                                                    quiz.id,
                                                                )
                                                            }
                                                            className="mx-4"
                                                        >
                                                            <Pencil />
                                                            edit quiz
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleHostQuiz(
                                                                    quiz.id,
                                                                )
                                                            }
                                                        >
                                                            host game
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                            ) : (
                                <Card>
                                    <CardContent className="py-8 text-center">
                                        <p className="text-muted-foreground mb-4">
                                            you haven't created any quizzes yet
                                        </p>
                                        <Link href="/create-quiz">
                                            <Button>
                                                create your first quiz
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Suspense>
                    <TabsContent value="public" className="space-y-4">
                        {publicQuizzes.length > 0 ? (
                            publicQuizzes
                                .filter((quiz) =>
                                    quiz.title
                                        .toLowerCase()
                                        .includes(searchTerm.toLowerCase()),
                                )
                                .map((quiz) => (
                                    <Card key={quiz.id}>
                                        <CardHeader>
                                            <CardTitle>{quiz.title}</CardTitle>
                                            <CardDescription>
                                                {quiz.description ||
                                                    'No description provided'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-between items-center">
                                                <div className="text-sm text-muted-foreground">
                                                    {quiz._count.questions}{' '}
                                                    questions
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleHostQuiz(quiz.id)
                                                    }
                                                >
                                                    host game
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                        ) : (
                            <Card>
                                <CardContent className="py-8 text-center">
                                    <p className="text-muted-foreground mb-4">
                                        no public quizzes available
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default HostGame;
=======
          <Suspense fallback={<div className="animate-pulse">loading...</div>}>
            <TabsContent value="your" className="space-y-4">
              {userQuizzes.length > 0 ? (
                userQuizzes.filter((quiz) => quiz.title.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((quiz) => (
                  <Card key={quiz.id}>
                    <CardHeader>
                      <CardTitle>{quiz.title}</CardTitle>
                      <CardDescription>{quiz.description || "No description provided"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">{quiz._count.questions} questions</div>
                        <div className="flex items-center">
                          <Button variant="outline" onClick={() => handleEditQuiz(quiz.id)} className="mx-4"><Pencil />edit quiz</Button>
                          <Button variant="outline" onClick={() => handleHostQuiz(quiz.id)} loading={hostingQuizId === quiz.id}>host game</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground mb-4">you haven't created any quizzes yet</p>
                    <Link href="/create-quiz">
                      <Button>create your first quiz</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
          </Suspense>
          <TabsContent value="public" className="space-y-4">
              {publicQuizzes.length > 0 ? (
                publicQuizzes.filter((quiz) => quiz.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((quiz) => (
                  <Card key={quiz.id}>
                    <CardHeader>
                      <CardTitle>{quiz.title}</CardTitle>
                      <CardDescription>{quiz.description || "No description provided"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">{quiz._count.questions} questions</div>
                        <Button variant="outline" onClick={() => handleHostQuiz(quiz.id)} loading={hostingQuizId === quiz.id}>host game</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground mb-4">no public quizzes available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
>>>>>>> main
