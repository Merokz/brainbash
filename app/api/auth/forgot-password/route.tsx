import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { render } from '@react-email/render';
import ResetPasswordEmail from "@/components/reset-password-email";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const resetLink = `MI BOMBOOOOO;`
    const html = await render(<ResetPasswordEmail email={email} resetLink={resetLink} />)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: 'blockwochentimmy@gmail.com',
        pass: 'gbkfksxdtgjrwmvo',
      },
    });

    const info = await transporter.sendMail({
      from: "BrainBash <blockwochentimmy@gmail.com>",
      to: email,
      subject: "Reset your BrainBash Password",
      html
    });

    return NextResponse.json({ message: "Email sent", info });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email", detail: error.message },
      { status: 500 }
    );
  }
}
