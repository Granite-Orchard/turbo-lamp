import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-primary py-16">
      <div className="mx-auto max-w-391.5 px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <Image
            src="/Backgrounds/CTA/veen-logo-footer.svg"
            alt="Veen logo"
            width={100}
            height={29}
          />

          <p className="text-[1.25rem] text-primary-foreground order-3 md:order-2 text-center">
            ©{new Date().getFullYear()} Veen, Inc. All rights reserved.
          </p>

          <nav className="flex items-center gap-12 order-2 md:order-3">
            <Link
              href="#"
              className="text-[1.25rem] text-primary-foreground hover:text-primary-foreground/70 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-[1.25rem] text-primary-foreground hover:text-primary-foreground/70 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-[1.25rem] text-primary-foreground hover:text-primary-foreground/70 transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
