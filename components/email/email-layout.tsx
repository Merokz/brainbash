import * as React from "react";
import { Html, Head, Body, Container } from "@react-email/components";
import { theme } from "./email-theme";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => (
  <Html>
    <Head />
    <Body style={{ backgroundColor: theme.colors.background, padding: "20px" }}>
      <Container style={theme.styles.container}>{children}</Container>
    </Body>
  </Html>
);
