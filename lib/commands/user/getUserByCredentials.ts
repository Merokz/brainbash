export const findUserByCredentials = async (
    usernameOrEmail: string,
): Promise<any> => {
    return prisma.user.findFirst({
        where: {
            OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
            valid: true,
        },
        select: {
            id: true,
            username: true,
            email: true,
            password: true,
        },
    });
};
