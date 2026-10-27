import { useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AlertCircle, Apple, ArrowRight, Home, Mail, Menu, UserRound } from 'lucide-react';
import { useDemoAuth } from '@/hooks/useDemoAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AccessPage() {
  const { session, login } = useDemoAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (session) return <Navigate to="/host" replace />;

  const continueDemo = (value: string) => {
    if (!value.trim()) {
      setError('Ingresa tu correo electrónico para continuar.');
      return;
    }
    setError(null);
    login(value.trim());
    navigate('/host');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    continueDemo(email);
  };

  const handleSocialDemo = (provider: string) => {
    continueDemo(`${provider}@aloja-te.bo`);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(120deg,#f8fbff_0%,#dceeff_48%,#75aef7_100%)] text-ink-primary">
      <header className="h-[74px] border-b border-slate-200/80 bg-white/95">
        <div className="mx-auto flex h-full max-w-[1320px] items-center justify-between px-6 sm:px-10">
          <a href="/acceso" className="flex items-center gap-2.5" aria-label="Aloja-Te inicio">
            <span className="relative flex h-10 w-10 items-center justify-center text-brand-primary">
              <Home className="h-10 w-10 stroke-[2.5]" />
              <span className="absolute top-[15px] flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-primary text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
            </span>
            <span className="text-[27px] font-bold tracking-[-0.04em] text-brand-primary">Aloja-Te</span>
          </a>
          <div className="flex items-center gap-3">
            <button aria-label="Perfil" className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-ink-primary transition hover:bg-brand-light hover:text-brand-primary">
              <UserRound className="h-5 w-5" />
            </button>
            <button aria-label="Menú" className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-ink-primary transition hover:bg-brand-light hover:text-brand-primary">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-74px)] items-center justify-center px-4 py-12 sm:px-6">
        <section className="w-full max-w-[534px] -translate-y-12 scale-[0.675] origin-center rounded-[26px] bg-white px-6 py-10 shadow-[0_20px_45px_rgba(35,91,160,0.16)] sm:px-8 sm:py-12">
          <div className="mx-auto max-w-[466px] text-center">
            <div className="flex items-center justify-center gap-2 text-brand-primary">
              <span className="relative flex h-12 w-12 items-center justify-center">
                <Home className="h-12 w-12 stroke-[2.4]" />
                <span className="absolute top-[18px] flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
              </span>
              <span className="text-[34px] font-bold tracking-[-0.05em]">Aloja-Te</span>
            </div>
            <h1 className="mt-8 text-[28px] font-bold tracking-[-0.03em] text-[#14295a] sm:text-[30px]">Inicia sesión o regístrate</h1>
            <p className="mt-2 text-[17px] text-[#8ba1c5]">Te damos la bienvenida a Aloja-Te</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
              <Input
                aria-label="Número de teléfono o correo electrónico"
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Número de teléfono o correo electrónico"
                leftIcon={<Mail className="h-5 w-5" />}
                className="h-[58px] rounded-xl border-[#b9c9e1] px-4 text-[16px] placeholder:text-[#7184a7]"
                autoComplete="email"
              />

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" fullWidth size="lg" rightIcon={<ArrowRight className="h-5 w-5" />} className="h-[54px] rounded-xl bg-[#2376f2] text-[17px] shadow-[0_7px_14px_rgba(35,118,242,0.2)] hover:bg-brand-hover">
                Continuar
              </Button>
            </form>

            <div className="my-7 flex items-center gap-4 text-sm text-[#60759a]">
              <span className="h-px flex-1 bg-[#d8e1ee]" />
              <span>o</span>
              <span className="h-px flex-1 bg-[#d8e1ee]" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button onClick={() => handleSocialDemo('google')} className="flex h-[58px] items-center justify-center gap-3 rounded-xl border border-[#cbd7e8] bg-white text-[14px] font-semibold text-slate-900 transition hover:border-brand-primary hover:bg-brand-light">
                <span className="text-xl font-bold text-[#4285f4]">G</span>
                Continuar con Google
              </button>
              <button onClick={() => handleSocialDemo('apple')} className="flex h-[58px] items-center justify-center gap-3 rounded-xl border border-[#cbd7e8] bg-white text-[14px] font-semibold text-slate-900 transition hover:border-brand-primary hover:bg-brand-light">
                <Apple className="h-5 w-5 fill-current" />
                Continuar con Apple
              </button>
            </div>

            <p className="mt-8 text-[13px] leading-5 text-[#8ba1c5]">
              Al continuar, aceptas nuestros <a href="#terminos" className="font-semibold text-brand-primary hover:underline">Términos de uso</a> y nuestra<br className="hidden sm:block" /> <a href="#privacidad" className="font-semibold text-brand-primary hover:underline">Política de privacidad.</a>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
