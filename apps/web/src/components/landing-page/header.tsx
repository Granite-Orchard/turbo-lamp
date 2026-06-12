"use client";

import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-5 pointer-events-none">
      <div className="pointer-events-auto flex items-center justify-between bg-white border border-black/20 rounded-full px-8 py-3 w-full max-w-[609px] shadow-sm">
        <Image src="/veen-logo.svg" alt="Veen" width={100} height={29} priority />
        <Link
          href="#waitlist"
          className="bg-[#ffbc08] text-black font-medium text-sm px-5 py-2.5 rounded-lg border border-white/20 hover:bg-[#f0b000] transition-colors whitespace-nowrap"
        >
          Join the waitlist
        </Link>
      </div>
    </header>
  );
}
