export const findUserById = async (userId: number): Promise<any> => {
    return prisma.user.findUnique({
        where: {
            id: userId,
            valid: true,
        },
        select: {
            id: true,
            username: true,
            email: true,
            isRegistered: true,
        },
    });
};
