import * as React from "react";
import { Heading, Img, Text } from "@react-email/components";
import { theme } from "./email-theme";

export const Header: React.FC = () => (
  <div style={{ textAlign: "center", marginBottom: "20px" }}>
    <Img
      src={theme.brand.logo}
      width="200"
      alt={theme.brand.name}
      style={{ display: "block", margin: "0 auto" }} // Center the image
    />
    <Text style={{ color: theme.colors.muted, fontSize: "14px" }}>
      secure password reset
    </Text>
  </div>
);
