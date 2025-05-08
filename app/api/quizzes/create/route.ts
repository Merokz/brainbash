import { NextResponse } from 'next/server';
import { createAnswer, createNewQuiz, createQuestion } from '@/lib/commands';
import { getUserFromToken } from '@/lib/auth';
import { saveBase64Image } from '@/lib/save-image';

export const POST = async (request: Request): Promise<any> => {
    try {
        const user = await getUserFromToken();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        const { title, description, isPublic, questions } =
            await request.json();

        // Validate questions count
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return NextResponse.json(
                { error: 'At least one question is required' },
                { status: 400 },
            );
        }

        if (questions.length > 8) {
            return NextResponse.json(
                { error: 'Maximum of 8 questions allowed per quiz' },
                { status: 400 },
            );
        }

        const quiz = await createNewQuiz(user.id, title, description, isPublic);

        // Create questions and answers
        if (questions && Array.isArray(questions)) {
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                let imagePath = '';

                if (q.image && q.image.startsWith('data:image/')) {
                    const fileName = `${quiz.id}-${i}`; // or
                    imagePath = await saveBase64Image(q.image, fileName);
                }

                const question = await createQuestion(quiz.id, {
                    questionText: q.questionText,
                    image: imagePath,
                    orderNum: i,
                    questionType: q.questionType,
                });

                if (q.answers && Array.isArray(q.answers)) {
                    for (const a of q.answers) {
                        await createAnswer(question.id, {
                            answerText: a.answerText,
                            isCorrect: a.isCorrect,
                        });
                    }
                }
            }
        }

        return NextResponse.json(quiz);
    } catch (error) {
        console.error('Error creating quiz:', error);
        return NextResponse.json(
            { error: 'Failed to create quiz' },
            { status: 500 },
        );
    }
};
