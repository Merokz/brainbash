export async function findUserByCredentials(usernameOrEmail: string) {
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
}
