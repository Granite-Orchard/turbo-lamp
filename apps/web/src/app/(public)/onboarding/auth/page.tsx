"use client";
import { Button } from "@/components/ui/button";
import { IconBrandGoogle } from "@tabler/icons-react";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  if (!token) {
    router.push("/login");
  }
  return (
    <div className="relative flex min-h-screen">
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/4 h-800p w-800 -translate-x-1/2 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -bottom-1/2 right-1/4 h-600 w-600p translate-x-1/2 rounded-full bg-accent/3 blur-3xl" />
      </div>

      {/* Left side - Benefits */}
      <div className="relative hidden w-1/2 flex-col justify-between p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
            <Calendar className="h-5 w-5 text-accent-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">Syncal</span>
        </Link>

        <div className="max-w-md">
          <h2 className="text-3xl font-semibold text-foreground">
            Start scheduling smarter today
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of teams who save hours every week with AI-powered
            meeting scheduling.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          Trusted by 10,000+ teams worldwide
        </p>
      </div>

      {/* Right side - Form */}
      <div className="relative flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm">
            <div className="mb-8 flex flex-col items-center text-center lg:hidden">
              <Link href="/" className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                  <Calendar className="h-5 w-5 text-accent-foreground" />
                </div>
                <span className="text-xl font-semibold text-foreground">
                  Syncal
                </span>
              </Link>
            </div>

            <div className="mb-6 text-center lg:text-left">
              <h1 className="text-2xl font-semibold text-foreground">
                Accept your invitation
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Accept your invitation by following one of the providers below
              </p>
            </div>

            <div className="w-full flex justify-center align-middle text-center items-center">
              <Button
                className="h-11"
                onClick={() => {
                  window.location.href = `http://localhost:3001/api/core/v1/auth/oauth/google?token=${token}`;
                }}
              >
                <IconBrandGoogle />
                Google
              </Button>
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              By creating an account, you agree to our{" "}
              <Link href="#" className="underline hover:text-foreground">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="underline hover:text-foreground">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
