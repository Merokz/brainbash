export const updateUser = async (
    userId: number,
    username: string,
    email: string,
): Promise<any> => {
    return prisma.user.update({
        where: { id: userId },
        data: {
            username,
            email,
        },
    });
};
