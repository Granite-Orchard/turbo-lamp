"use client";

import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-5">
      <div className="flex items-center justify-between border rounded-full px-8 py-3 w-full max-w-152.25 shadow-sm bg-background">
        <Image src="/veen-logo.svg" alt="Veen logo" width={100} height={29} />
        <Link
          href="#waitlist"
          className="bg-brand-yellow font-medium px-5 py-2.5 rounded-lg border hover:bg-brand-yellow/80"
        >
          Join the waitlist
        </Link>
      </div>
    </header>
  );
}
