import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

type Props = {};

function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ClerkProvider>{children}</ClerkProvider>;
}

export default MainLayout;
