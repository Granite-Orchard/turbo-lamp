import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-black py-16">
      <div className="mx-auto max-w-[1566px] px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <Image
            src="/Backgrounds/CTA/veen-logo-footer.svg"
            alt="Veen"
            width={100}
            height={29}
            className=""
          />

          <p className="text-[1.25rem] text-white order-3 md:order-2 text-center">
            © 2026 Veen, Inc. All rights reserved.
          </p>

          <nav className="flex items-center gap-12 order-2 md:order-3">
            <Link href="#" className="text-[1.25rem] text-white hover:text-white/70 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-[1.25rem] text-white hover:text-white/70 transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-[1.25rem] text-white hover:text-white/70 transition-colors">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
