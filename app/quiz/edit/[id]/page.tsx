'use client';

import { QuizForm } from '@/components/quiz/quiz-form';
import { Quiz } from '@prisma/client';
import { JSX, use, useEffect, useState } from 'react';

const EditQuiz = (props: { params: Promise<{ id: string }> }): JSX.Element => {
    const params = use(props.params);
    const [quiz, setQuiz] = useState<Quiz>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuiz = async (): Promise<any> => {
            const response = await fetch(`/api/quizzes/${params.id}`);
            const data = await response.json();
            console.log(data);
            setQuiz(data);
        };
        fetchQuiz();
        setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1 container py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">edit quiz</h1>
                </div>

                <QuizForm quiz={quiz} />
            </main>
        </div>
    );
};

export default EditQuiz;
