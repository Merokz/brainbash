export async function updateUser(
    userId: number,
    username: string,
    email: string
) {
    return prisma.user.update({
        where: { id: userId },
        data: {
            username,
            email
        }
    })
}