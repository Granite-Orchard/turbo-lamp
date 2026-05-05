"use client";

import { useRouter } from "next/navigation";

import { Login } from "@/lib/types";

import { loginSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

type Actions = {
  loginAction: (data: Login) => Promise<unknown>;
};

export default function LoginClient({ actions }: { actions: Actions }) {
  const router = useRouter();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    try {
      await actions.loginAction({
        username: data.username,
        password: data.password,
      });

      router.push("/dashboard");
    } catch (error) {
      toast.error(error as string);
      return;
    }

    toast.error("Failed to sign in. Please try again.");
  }
  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-800 w-800 -translate-x-1/2 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <Link href="/" className="mb-6 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                <Calendar className="h-5 w-5 text-accent-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">
                Syncal
              </span>
            </Link>
            <h1 className="text-2xl font-semibold text-foreground">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <form
            id="login"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FieldGroup>
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="username">Email</FieldLabel>
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
                    <div className="flex justify-between">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Link
                        href="/forgot-password"
                        className="text-sm text-muted-foreground transition-colors hover:text-accent"
                      >
                        Forgot password?
                      </Link>
                    </div>
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
            </FieldGroup>
            <Field orientation="horizontal">
              <Button className="w-full" type="submit" form="login">
                Sign In
              </Button>
            </Field>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card/50 px-4 text-sm text-muted-foreground">
                or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-11"
              onClick={() => {
                window.location.href = `http://localhost:3001/api/core/v1/auth/oauth/google`;
              }}
            >
              <IconBrandGoogle />
              Google
            </Button>
            <Button
              variant="outline"
              className="h-11"
              onClick={() => {
                window.location.href = `http://localhost:3001/api/core/v1/auth/oauth/github`;
              }}
            >
              <IconBrandGithub />
              GitHub
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link
              href="/register"
              className="font-medium text-foreground transition-colors hover:text-accent"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
