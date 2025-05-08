import { writeFile } from "fs/promises";
import path from "path";

export async function saveBase64Image(
  base64: string,
  fileName: string,
): Promise<string> {
  const matches = base64.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);

  if (!matches) {
    throw new Error("Invalid base64 image string");
  }

  const ext = matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, "base64");

  const uploadDir = path.join(process.cwd(), "public", "uploads");

  // Ensure the folder exists, you may want to add mkdir if necessary
  const filePath = path.join(uploadDir, `${fileName}.${ext}`);

  await writeFile(filePath, buffer);

  return `/uploads/${fileName}.${ext}`;
}
