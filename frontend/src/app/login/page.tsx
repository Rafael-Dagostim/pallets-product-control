"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UnderlineInput } from "@/components/shared/underline-input";
import { PalletLogo } from "@/components/shared/pallet-logo";
import { authService } from "@/services/auth.service";
import { setTokens } from "@/lib/api";
import { maskCPF, unmask } from "@/lib/masks";

export default function LoginPage() {
  const router = useRouter();
  const [document, setDocument] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authService.login(unmask(document), password);
      router.push("/production");
    } catch {
      setError("Credenciais inválidas. Verifique seus dados.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left panel - brand */}
      <div className="bg-secondary flex flex-col items-center justify-center px-8 py-12 md:w-2/5 md:min-h-screen relative overflow-hidden">
        <div className="relative z-10 text-center">
          <PalletLogo className="w-56 md:w-72 mx-auto" variant="full" />
        </div>

        {/* Decorative waves (desktop only) */}
        <div className="hidden md:block absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 400 200" className="w-full" preserveAspectRatio="none">
            <path
              d="M0,100 Q100,50 200,120 T400,80 L400,200 L0,200 Z"
              fill="#3D2E22"
            />
            <path
              d="M0,140 Q100,90 200,150 T400,120 L400,200 L0,200 Z"
              fill="#8B7355"
              opacity="0.6"
            />
            <path
              d="M0,170 Q100,140 200,180 T400,160 L400,200 L0,200 Z"
              fill="#B8860B"
              opacity="0.3"
            />
          </svg>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 md:py-0">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Bem-vindo
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
              Acesse sua conta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <UnderlineInput
              icon={<User className="w-5 h-5" />}
              placeholder="CPF"
              value={document}
              onChange={(e) => setDocument(maskCPF(e.target.value))}
              required
              autoComplete="username"
              inputMode="numeric"
              maxLength={14}
            />

            <UnderlineInput
              icon={<Lock className="w-5 h-5" />}
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full py-6 text-base font-bold uppercase tracking-widest rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Login"}
            </Button>
          </form>
        </div>

        <footer className="absolute bottom-4 md:static md:mt-16 text-sm text-muted-foreground">
          Develop by{" "}
          <span className="text-primary font-bold">Rafael Dagostim</span>
        </footer>
      </div>
    </div>
  );
}
