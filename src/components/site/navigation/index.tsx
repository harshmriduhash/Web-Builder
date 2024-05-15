import { User, currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import React from "react";

import PluraLogoSvG from "../../../../public/assets/plura-logo.svg";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/global/mode-toggle";

type Props = {
  user?: null | User;
};

export default async function Navigation({}: Props) {
  const user = await currentUser();
  return (
    <div className="fixed top-0 right-0 left-0 z-10 p-4 flex items-center justify-between">
      {/* Left side */}
      <aside className="flex items-center gap-2">
        <Image src={PluraLogoSvG} width={40} height={40} alt="Plura logo" />
        <span className="text-xl font-bold">Plura.</span>
      </aside>

      {/* Center */}

      <nav className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <ul className="flex items-center justify-center gap-8">
          <Link href="#">Pricing</Link>
          <Link href="#">About</Link>
          <Link href="#">Documentation</Link>
          <Link href="#">Features</Link>
        </ul>
      </nav>

      {/* Right side */}

      <aside className="flex gap-2 items-center">
        <Link
          href="/agency"
          className="bg-primary text-white px-4 p-2 rounded-md hover:bg-primary/80"
        >
          {!user ? "Login" : "Go to Dashboard"}
        </Link>

        {/* User button from clerk */}
        <UserButton />
        <ModeToggle />
      </aside>
    </div>
  );
}
