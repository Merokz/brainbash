export async function updatePassword(email: string, newPassword: string) {
    return prisma.user.update({
        where: { email: email },
        data: { password: newPassword },
    });
}
