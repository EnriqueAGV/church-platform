import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";

import { CreateEditorForm } from "./create-editor-form";

export default async function UsuariosPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/");

  const { users } = await auth.api.listUsers({
    headers: await headers(),
    query: { limit: 200, sortBy: "createdAt", sortDirection: "asc" },
  });

  return (
    <main className="min-h-screen bg-cream px-4 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Editores</h1>
          <Link href="/" className="text-sm underline">
            Volver
          </Link>
        </header>

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 font-semibold">Crear editor</h2>
          <CreateEditorForm />
        </section>

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 font-semibold">Usuarios ({users.length})</h2>
          <ul className="divide-y divide-neutral-200 text-sm">
            {users.map((user) => (
              <li key={user.id} className="flex justify-between py-2">
                <span>
                  {user.name} · {user.email}
                </span>
                <span className="text-neutral-500">{user.role ?? "user"}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
