import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Preencha todos os campos"); return; }
    if (password.length < 6) { toast.error("A senha deve ter pelo menos 6 caracteres"); return; }

    setSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes("Invalid login")) toast.error("E-mail ou senha incorretos");
          else if (error.message.includes("Email not confirmed")) toast.error("Confirme seu e-mail antes de entrar");
          else toast.error(error.message);
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) {
          if (error.message.includes("already registered")) toast.error("Este e-mail já está cadastrado");
          else toast.error(error.message);
        } else {
          toast.success("Cadastro realizado! Verifique seu e-mail para confirmar.");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto p-3 rounded-xl bg-primary w-fit">
            <BarChart3 className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">KevQuest</CardTitle>
          <CardDescription>{isLogin ? "Entre na sua conta" : "Crie sua conta"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full font-display" disabled={submitting}>
              {submitting ? "Aguarde..." : isLogin ? "Entrar" : "Cadastrar"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button type="button" className="text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Entre"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
