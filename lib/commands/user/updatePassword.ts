export const updatePassword = async (
    email: string,
    newPassword: string,
): Promise<any> => {
    return prisma.user.update({
        where: { email: email },
        data: { password: newPassword },
    });
};
