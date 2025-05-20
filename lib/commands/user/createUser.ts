export const createUser = async (
    username: string,
    email: string,
    password: string,
): Promise<any> => {
    return prisma.user.create({
        data: {
            username,
            email,
            password,
        },
    });
};
