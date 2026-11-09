"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "~/server/better-auth/client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const email = formData.get("email");
    const password = formData.get("password");
    const { error } = await authClient.signIn.email({
      email: typeof email === "string" ? email : "",
      password: typeof password === "string" ? password : "",
    });
    setPending(false);
    if (error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4">
      <form
        action={onSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-8 shadow"
      >
        <Image
          src="/brand/logo-primary.jpg"
          alt="Tabernáculo de Ilopango"
          width={1020}
          height={336}
          className="mx-auto h-auto w-56"
        />
        <h1 className="text-center text-2xl font-bold text-brand-dark">
          Iniciar sesión
        </h1>
        <label className="flex flex-col gap-1 text-sm">
          Correo
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded border border-neutral-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Contraseña
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="rounded border border-neutral-300 px-3 py-2"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-brand px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
