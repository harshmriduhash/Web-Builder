import Navigation from "@/components/site/navigation";
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import {} from "@clerk/themes";

type Props = {
  children: React.ReactNode;
};

function SiteLayout({ children }: Props) {
  return (
    <ClerkProvider>
      <main className="h-full">
        <Navigation />
        {children}
      </main>
    </ClerkProvider>
  );
}

export default SiteLayout;
