import React, { useState } from 'react';
import { ViewType, StreamType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Check,
  GraduationCap,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

interface LoginPageProps {
  onNavigate: (view: ViewType) => void;
  initialMode?: 'login' | 'signup';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigate,
  initialMode = 'login',
}) => {
  const { login, signup } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const isArabic = language === 'ar';

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedStream, setSelectedStream] = useState<StreamType>('sciences_experimentales');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);

  // Google button labels strictly as mandated:
  const googleButtonLabel =
    language === 'ar'
      ? 'المتابعة باستخدام Google'
      : language === 'en'
      ? 'Continue with Google'
      : 'Continuer avec Google';

  // Call official Supabase Google OAuth
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setGoogleNotice(null);
    setGoogleLoading(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        setGoogleNotice(
          language === 'ar'
            ? 'تنبيه: يتطلب تفعيل Google OAuth إعداد VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY.'
            : 'Note : La connexion Google nécessite les clés Supabase VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.'
        );
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        setErrorMsg(error.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la connexion Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setGoogleNotice(null);

    if (!email.trim() || !password) {
      setErrorMsg(
        isArabic
          ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور.'
          : 'Veuillez saisir votre email et mot de passe.'
      );
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          setErrorMsg(isArabic ? 'يرجى إدخال الاسم الكامل.' : 'Veuillez renseigner votre nom complet.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg(t.auth.passwordsDontMatch);
          setLoading(false);
          return;
        }

        const result = await signup({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          stream: selectedStream,
          language: language as any,
        });

        if (!result.success) {
          setErrorMsg(result.error || t.auth.invalidCredentials);
          setLoading(false);
          return;
        }

        onNavigate(result.user?.role === 'admin' ? 'admin' : 'dashboard');
      } else {
        const result = await login(email.trim(), password);
        if (!result.success) {
          setErrorMsg(result.error || t.auth.invalidCredentials);
          setLoading(false);
          return;
        }

        onNavigate(result.user?.role === 'admin' ? 'admin' : 'dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Top Header: Logo + Back to Landing */}
        <div className="flex items-center justify-between">
          <BrandLogo size="sm" />
          <button
            id="back-to-landing-btn"
            type="button"
            onClick={() => onNavigate('landing')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
            <span>{isArabic ? 'الرئيسية' : 'Accueil'}</span>
          </button>
        </div>

        {/* Title and Subtitle */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {mode === 'login'
              ? isArabic
                ? 'تسجيل الدخول إلى حسابك'
                : 'Connexion à votre compte'
              : isArabic
              ? 'إنشاء حساب جديد'
              : 'Créer un compte étudiant'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'login'
              ? isArabic
                ? 'أدخل بيانات حسابك للمتابعة والتحضير للبكالوريا.'
                : 'Accédez à vos cours, exercices et résumés de BAC 2026.'
              : isArabic
              ? 'انضم إلى منصة باك نكست مجانًا وابدأ المراجعة.'
              : 'Rejoignez gratuitement la plateforme officielle de révision.'}
          </p>
        </div>

        {/* Mode Selector Tabs (Login / Register) */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            id="auth-tab-login"
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
              setGoogleNotice(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t.nav.login}
          </button>

          <button
            id="auth-tab-signup"
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
              setGoogleNotice(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t.nav.signup}
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google OAuth Notice */}
        {googleNotice && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">{googleNotice}</div>
          </div>
        )}

        {/* Form: Email & Password */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Sign up: Full Name */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.auth.fullName}
              </label>
              <input
                id="signup-fullname-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={isArabic ? 'مثال: أمين بلقاسم' : 'Ex: Amine Belkacem'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#162032] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.auth.email}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute start-3.5 top-3" />
              <input
                id="login-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.nom@bacnext.dz"
                className="w-full ps-10 pe-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#162032] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.auth.password}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute start-3.5 top-3" />
              <input
                id="login-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full ps-10 pe-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#162032] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Sign up: Confirm Password & Stream */}
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.auth.confirmPassword}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute start-3.5 top-3" />
                  <input
                    id="signup-confirm-password-input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full ps-10 pe-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#162032] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.auth.chooseStream}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStream('sciences_experimentales')}
                    className={`p-2.5 rounded-xl border text-start transition-all cursor-pointer ${
                      selectedStream === 'sciences_experimentales'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-1 ring-blue-600'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-[#162032]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">🔬</span>
                      {selectedStream === 'sciences_experimentales' && (
                        <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="text-xs font-bold mt-1 text-slate-900 dark:text-slate-100">
                      {t.common.streamSciShort}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStream('mathematiques')}
                    className={`p-2.5 rounded-xl border text-start transition-all cursor-pointer ${
                      selectedStream === 'mathematiques'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-1 ring-blue-600'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-[#162032]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">📐</span>
                      {selectedStream === 'mathematiques' && (
                        <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="text-xs font-bold mt-1 text-slate-900 dark:text-slate-100">
                      {t.common.streamMathShort}
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Login / Signup Primary Button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'signup' ? t.auth.signupBtn : t.auth.loginBtn}
                </span>
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
        </form>

        {/* OR / OU Divider */}
        <div className="relative my-3 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative px-3 bg-white dark:bg-[#111827] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {t.auth.orDivider}
          </div>
        </div>

        {/* Google Login Button - Mandated: Clearly visible with Google icon & exact labels */}
        <button
          id="google-login-btn"
          type="button"
          disabled={googleLoading}
          onClick={handleGoogleSignIn}
          className="w-full py-3 px-4 rounded-xl bg-white dark:bg-[#162032] hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 active:scale-[0.99] text-slate-700 dark:text-slate-200 font-bold text-sm shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60"
        >
          {googleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          ) : (
            <>
              {/* Official Google 'G' Multicolor SVG Icon */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleButtonLabel}</span>
            </>
          )}
        </button>

        {/* Registration Link / Login Link Switch */}
        <div className="text-center pt-2">
          {mode === 'login' ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.auth.switchSignupPrompt}{' '}
              <button
                type="button"
                id="switch-to-signup-link"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setGoogleNotice(null);
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
              >
                {t.auth.switchSignupLink}
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.auth.switchLoginPrompt}{' '}
              <button
                type="button"
                id="switch-to-login-link"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setGoogleNotice(null);
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
              >
                {t.auth.switchLoginLink}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
