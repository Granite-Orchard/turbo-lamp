"use client";

import Image from "next/image";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Calendar, Check } from "lucide-react";
import Link from "next/link";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { registerSchema } from "@/lib/schemas";
import { Register } from "@/lib/types";
import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const benefits = [
  "14-day free trial, no credit card required",
  "Unlimited meetings and calendar syncs",
  "AI-powered scheduling suggestions",
  "Works with Google, Outlook & more",
];

type Actions = {
  registerAction: (data: Register) => Promise<unknown>;
};

export default function RegisterClient({ actions }: { actions: Actions }) {
  const router = useRouter();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  async function onSubmit(data: z.infer<typeof registerSchema>) {
    try {
      await actions.registerAction({
        username: data.username,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      router.push("/dashboard");
    } catch (error) {
      toast.error(error as string);
      return;
    }

    toast.error("Failed to register user. Please try again.");
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
        <Link href="/" className="mb-6 flex items-center gap-2">
          <Image src="/veen-logo.svg" alt="Veen logo" width={100} height={29} />
        </Link>

        <div className="max-w-md">
          <h2 className="text-3xl font-semibold text-foreground">
            Start scheduling smarter today
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of teams who save hours every week with AI-powered
            meeting scheduling.
          </p>
          <ul className="mt-8 flex flex-col gap-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20">
                  <Check className="h-3.5 w-3.5 text-accent" />
                </div>
                <span className="text-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-muted-foreground">
          Trusted by 10,000+ teams worldwide
        </p>
      </div>

      {/* Right side - Form */}
      <div className="relative flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm">
            <div className="mb-8 flex flex-col items-center text-center lg:hidden">
              <Link href="/" className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                  <Calendar className="h-5 w-5 text-accent-foreground" />
                </div>
                <span className="text-xl font-semibold text-foreground">
                  Veen
                </span>
              </Link>
            </div>

            <div className="mb-6 text-center lg:text-left">
              <h1 className="text-2xl font-semibold text-foreground">
                Create your account
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Get started with your 14-day free trial
              </p>
            </div>

            <form
              id="register"
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FieldGroup>
                <Controller
                  name="username"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="username">Work Email</FieldLabel>
                      <Input
                        {...field}
                        id="username"
                        type="email"
                        aria-invalid={fieldState.invalid}
                        className="bg-secondary/50"
                        placeholder="hello@world.com"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Input
                        {...field}
                        id="password"
                        type="password"
                        placeholder="Enter Your Password"
                        className="bg-secondary/50"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="confirmPassword"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="confirmPassword">
                        Confirm Password
                      </FieldLabel>
                      <Input
                        {...field}
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm Your Password"
                        className="bg-secondary/50"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
              <Field orientation="horizontal">
                <Button className="w-full" type="submit" form="register">
                  Create Account
                </Button>
              </Field>
            </form>

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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card/50 px-4 text-sm text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-11"
                onClick={() => {
                  window.location.href = `http://localhost:3001/api/core/v1/auth/oauth/register/google`;
                }}
              >
                <IconBrandGoogle />
                Google
              </Button>
              <Button
                variant="outline"
                className="h-11"
                onClick={() => {
                  window.location.href = `http://localhost:3001/api/core/v1/auth/oauth/register/github`;
                }}
              >
                <IconBrandGithub />
                GitHub
              </Button>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-foreground transition-colors hover:text-accent"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
