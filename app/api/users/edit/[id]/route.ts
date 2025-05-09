import { NextResponse } from "next/server";
import { updateUser } from "@/lib/commands/user/updateUser";
import { getUserById } from "@/lib/commands";

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: number }> }
) {
  const params = await props.params;
  try {
    const user = await getUserById(params.id);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { username, email } = await request.json();

    const newUser = updateUser(user.id, username, email);
    return NextResponse.json(newUser);
  } catch (error) {
    console.error("Error updating quiz:", error);
    return NextResponse.json(
      { error: "Failed to update quiz" },
      { status: 500 }
    );
  }
}