export async function checkExistingUser(username: string, email: string) {
  return prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });
}
