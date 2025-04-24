import * as React from "react";
import { Html, Text, Button, Heading } from "@react-email/components";

interface ResetPasswordEmailProps {
  email: string;
  resetLink: string;
}

export const ResetPasswordEmail: React.FC<ResetPasswordEmailProps> = ({
  email,
  resetLink,
}) => {
  return (
    <Html lang="en">
      <Heading as="h2">Password Reset Request</Heading>
      <Text>Hi there,</Text>
      <Text>
        A password reset was requested for <strong>{email}</strong>. Click the
        button below to reset your password.
      </Text>
      <Button
        href={resetLink}
        style={{
          backgroundColor: "#4F46E5",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "5px",
          textDecoration: "none",
        }}
      >
        Reset Password
      </Button>
      <Text>If you didn’t request this, you can ignore this email.</Text>
    </Html>
  );
};

export default ResetPasswordEmail;