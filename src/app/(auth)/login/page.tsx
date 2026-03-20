"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email o contraseña incorrectos");
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
      {/* Header */}
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
          <h2 className="text-xl font-bold text-gray-900 mb-6">Iniciar sesión</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="••••••••"
              required
              autoComplete="current-password"
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <Button type="submit" loading={loading} fullWidth className="mt-2">
              Entrar
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-brand-600 font-semibold hover:underline">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>

        {/* Demo hint */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Demo: usa cualquier email y contraseña para registrarte primero
          </p>
        </div>
      </div>
    </div>
  );
}
