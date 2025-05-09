import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { render } from '@react-email/render';
import ResetPasswordEmail from "@/components/email/reset-password-email";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    console.log('email:', email)
    const JWT_SECRET = process.env.JWT_SECRET!

    const token = jwt.sign(
      {
        email: email, // or user ID
        purpose: "password-reset"
      },
      JWT_SECRET,
      { expiresIn: "15m" }
    )
    
    const resetLink = `${process.env.BASE_URL}/reset-password?token=${token}`;
    const html = await render(<ResetPasswordEmail email={email} resetLink={resetLink} />)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: 'blockwochentimmy@gmail.com',
        pass: 'gbkfksxdtgjrwmvo',
      },
    })

    console.log('email:', email,'resetlink: ', resetLink)

    const info = await transporter.sendMail({
      from: "yuno <blockwochentimmy@gmail.com>",
      to: email,
      subject: "reset your yuno password",
      html
    })

    return NextResponse.json({ message: "Email sent", info })
  } catch (error: any) {
    console.error("Error sending email:", error)
    return NextResponse.json(
      { error: "Failed to send email", detail: error.message },
      { status: 500 }
    )
  }
}
