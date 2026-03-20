"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al crear la cuenta");
        return;
      }

      // Auto-login after registration
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Cuenta creada, pero no pudimos iniciar sesión. Prueba a entrar manualmente.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Algo salió mal. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 gradient-brand rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-300/40">
            <span className="text-4xl">🌿</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">PlantBee</h1>
          <p className="text-gray-500 mt-1">Tu jardín inteligente</p>
        </div>

        {/* Form */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Crea tu cuenta</h2>
          <p className="text-sm text-gray-500 mb-6">
            Empieza a cuidar tus plantas de forma inteligente
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              required
              autoComplete="name"
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              autoComplete="new-password"
              hint="Mínimo 6 caracteres"
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <Button type="submit" loading={loading} fullWidth className="mt-2">
              Crear cuenta gratis
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-brand-600 font-semibold hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6 px-4">
          Al registrarte aceptas que usamos tus datos para personalizar el cuidado de tus plantas.
        </p>
      </div>
    </div>
  );
}
