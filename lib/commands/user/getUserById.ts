export async function getUserById(userId: number) {
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
}
