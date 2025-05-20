export const checkExistingUser = async (
    username: string,
    email: string,
): Promise<any> => {
    return prisma.user.findFirst({
        where: {
            OR: [{ username }, { email }],
        },
    });
};
