"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/shared/form-fields";
import { PalletLogo } from "@/components/shared/pallet-logo";
import { authService } from "@/services/auth.service";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authService.login(loginId, password);
      router.push("/production");
    } catch {
      setError("Credenciais inválidas. Verifique seus dados.");
      toast.error("Não foi possível entrar");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="bg-secondary flex flex-col items-center justify-center px-8 py-12 md:w-2/5 md:min-h-screen relative overflow-hidden">
        <div className="relative z-10 text-center">
          <PalletLogo className="w-56 md:w-72 mx-auto" variant="full" />
        </div>
        <div className="hidden md:block absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 400 200" className="w-full" preserveAspectRatio="none">
            <path d="M0,100 Q100,50 200,120 T400,80 L400,200 L0,200 Z" fill="#3D2E22" />
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

      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 md:py-0">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Bem-vindo
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
              Acesse sua conta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login">Login</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="login"
                  type="text"
                  placeholder="EX: RAFA123"
                  className="pl-9 uppercase"
                  maxLength={20}
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value.toUpperCase())}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <PasswordInput
                id="password"
                leftIcon={<Lock className="size-4" />}
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className={cn("text-sm text-destructive text-center")}>{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>

        <footer className="absolute bottom-4 md:static md:mt-16 text-sm text-muted-foreground">
          Develop by <span className="text-primary font-semibold">Rafael Dagostim</span>
        </footer>
      </div>
    </div>
  );
}
