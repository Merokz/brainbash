import { saveBase64Image } from '@/lib/save-image';
import { getQuizById } from './getQuizById';

export const createQuizVersion = async (
    originalQuizId: number,
    updatedData: {
        title: string;
        description: string;
        isPublic: boolean;
        questions: any[];
    },
): Promise<any> => {
    // Get original quiz with questions and answers
    const originalQuiz = await getQuizById(originalQuizId);

    if (!originalQuiz) {
        throw new Error(`Quiz ${originalQuizId} not found`);
    }

    // Determine root quiz ID
    const rootQuizId = originalQuiz.parentQuizId ?? originalQuizId;

    // Create new version in a transaction
    return prisma.$transaction(
        async (tx: {
            quiz: {
                create: (arg0: {
                    data: {
                        title: string;
                        description: string;
                        creatorId: number;
                        isPublic: boolean;
                        version: number;
                        parentQuizId: number;
                        valid: boolean;
                    };
                }) => any;
            };
            question: {
                create: (arg0: {
                    data: {
                        quizId: any;
                        questionText: any;
                        image: any;
                        orderNum: number;
                        questionType: any;
                        valid: boolean;
                    };
                }) => any;
            };
            answer: {
                create: (arg0: {
                    data: {
                        questionId: any;
                        answerText: any;
                        isCorrect: any;
                        valid: boolean;
                    };
                }) => any;
            };
        }) => {
            // Create new quiz with incremented version
            const newQuiz = await tx.quiz.create({
                data: {
                    title: updatedData.title,
                    description: updatedData.description,
                    creatorId: originalQuiz.creatorId,
                    isPublic: updatedData.isPublic,
                    version: originalQuiz.version + 1,
                    parentQuizId: rootQuizId,
                    valid: true,
                },
            });

            // Create questions and answers
            for (let i = 0; i < updatedData.questions.length; i++) {
                const q = updatedData.questions[i];
                let imagePath = q.image;

                // Handle image if it's a new base64 image
                if (imagePath && imagePath.startsWith('data:image/')) {
                    const fileName = `${newQuiz.id}-${i}`;
                    imagePath = await saveBase64Image(imagePath, fileName);
                }

                const question = await tx.question.create({
                    data: {
                        quizId: newQuiz.id,
                        questionText: q.questionText,
                        image: imagePath,
                        orderNum: i,
                        questionType: q.questionType,
                        valid: true,
                    },
                });

                // Create answers
                for (const a of q.answers) {
                    await tx.answer.create({
                        data: {
                            questionId: question.id,
                            answerText: a.answerText,
                            isCorrect: a.isCorrect,
                            valid: true,
                        },
                    });
                }
            }

            return newQuiz;
        },
    );
};
