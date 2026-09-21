import React, { useState, useEffect } from 'react';
import { StreamType, UserAccount } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { X, Check, ArrowRight, ShieldCheck, Mail, Lock, User, AlertCircle, Sparkles } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
  initialMode?: 'login' | 'signup';
  defaultStream?: StreamType;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  defaultStream = 'sciences_experimentales',
}) => {
  const { login, signup, loginWithGoogle } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const isArabic = language === 'ar';

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedStream, setSelectedStream] = useState<StreamType>(defaultStream);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setGoogleNotice(null);
      if (initialMode === 'login' && !email) {
        setEmail('admin@bacnext.dz');
        setPassword('password123');
      }
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setGoogleNotice(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        // Validation: confirm password
        if (password !== confirmPassword) {
          setErrorMsg(t.auth.passwordsDontMatch);
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setErrorMsg(isArabic ? 'كلمة المرور يجب أن لا تقل عن 6 أحرف.' : 'Le mot de passe doit contenir au moins 6 caractères.');
          setLoading(false);
          return;
        }

        // Strict student registration only
        const result = await signup({
          fullName: fullName.trim() || (isArabic ? 'تلميذ' : 'Élève'),
          email: email.trim(),
          password,
          stream: selectedStream,
          language,
        });

        if (!result.success) {
          setErrorMsg(result.error || t.auth.invalidCredentials);
          setLoading(false);
          return;
        }

        if (result.user) {
          onSuccess(result.user);
        }
      } else {
        // Login mode
        const result = await login(email.trim(), password);
        if (!result.success) {
          setErrorMsg(result.error || t.auth.invalidCredentials);
          setLoading(false);
          return;
        }

        if (result.user) {
          onSuccess(result.user);
        }
      }

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setGoogleNotice(null);
    setGoogleLoading(true);

    try {
      const res = await loginWithGoogle();
      if (!res.success && res.error) {
        setGoogleNotice(res.error);
        setErrorMsg(res.error);
      }
      // If success, Supabase redirects the browser directly to Google OAuth consent screen
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la connexion Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  const fillQuickAccount = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('password123');
    setMode('login');
    setErrorMsg(null);
    setGoogleNotice(null);
  };

  return (
    <div
      id="auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#131B2E] border border-[#E2E8F0] dark:border-slate-800 shadow-2xl p-6 sm:p-7 my-8 transition-colors">
        {/* Close Button */}
        <button
          id="auth-modal-close"
          type="button"
          onClick={onClose}
          className={`absolute top-4 ${
            isRTL ? 'left-4' : 'right-4'
          } p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer`}
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand & Header */}
        <div className="mb-5">
          <BrandLogo size="sm" showTagline={false} />
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3.5">
            {mode === 'signup' ? t.auth.signupTitle : t.auth.loginTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'signup' ? t.auth.signupSubtitle : t.auth.loginSubtitle}
          </p>
        </div>

        {/* Tab switch: Connexion vs Inscription */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mb-5">
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
                ? 'bg-white dark:bg-[#131B2E] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
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
                ? 'bg-white dark:bg-[#131B2E] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t.nav.signup}
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google Configuration Notice Helper (if Supabase credentials or provider are missing) */}
        {googleNotice && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs space-y-1">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">
                  {isArabic ? 'تنبيه إعدادات Google OAuth في Supabase:' : 'Info Supabase Google OAuth :'}
                </div>
                <div className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                  {googleNotice}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* REGISTER: Full Name */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.auth.fullName}
              </label>
              <div className="relative">
                <User
                  className={`w-4 h-4 text-slate-400 dark:text-slate-500 absolute top-3 ${
                    isRTL ? 'right-3' : 'left-3'
                  }`}
                />
                <input
                  id="auth-input-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.auth.fullNamePlaceholder}
                  className={`w-full py-2 text-xs sm:text-sm rounded-xl bg-[#F8FAFC] dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all ${
                    isRTL ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
                  }`}
                  required
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.auth.email}
            </label>
            <div className="relative">
              <Mail
                className={`w-4 h-4 text-slate-400 dark:text-slate-500 absolute top-3 ${
                  isRTL ? 'right-3' : 'left-3'
                }`}
              />
              <input
                id="auth-input-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.emailPlaceholder}
                className={`w-full py-2 text-xs sm:text-sm rounded-xl bg-[#F8FAFC] dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all ${
                  isRTL ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
                }`}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.auth.password}
            </label>
            <div className="relative">
              <Lock
                className={`w-4 h-4 text-slate-400 dark:text-slate-500 absolute top-3 ${
                  isRTL ? 'right-3' : 'left-3'
                }`}
              />
              <input
                id="auth-input-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.passwordPlaceholder}
                className={`w-full py-2 text-xs sm:text-sm rounded-xl bg-[#F8FAFC] dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all ${
                  isRTL ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
                }`}
                required
              />
            </div>
          </div>

          {/* REGISTER: Confirm Password */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.auth.confirmPassword}
              </label>
              <div className="relative">
                <Lock
                  className={`w-4 h-4 text-slate-400 dark:text-slate-500 absolute top-3 ${
                    isRTL ? 'right-3' : 'left-3'
                  }`}
                />
                <input
                  id="auth-input-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.auth.confirmPassword}
                  className={`w-full py-2 text-xs sm:text-sm rounded-xl bg-[#F8FAFC] dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all ${
                    isRTL ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
                  }`}
                  required
                />
              </div>
            </div>
          )}

          {/* REGISTER: BAC Stream Selector */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.auth.chooseStream}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="signup-stream-sci"
                  onClick={() => setSelectedStream('sciences_experimentales')}
                  className={`p-2.5 rounded-xl border ${
                    isRTL ? 'text-right' : 'text-left'
                  } transition-all cursor-pointer ${
                    selectedStream === 'sciences_experimentales'
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/50 border-emerald-500 text-emerald-950 dark:text-emerald-300 ring-1 ring-emerald-500/20 shadow-2xs'
                      : 'bg-[#F8FAFC] dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">🔬</span>
                    {selectedStream === 'sciences_experimentales' && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <div className="text-xs font-bold mt-1 text-slate-900 dark:text-white">
                    {t.common.streamSciShort}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">SVT • Maths • Physique</div>
                </button>

                <button
                  type="button"
                  id="signup-stream-math"
                  onClick={() => setSelectedStream('mathematiques')}
                  className={`p-2.5 rounded-xl border ${
                    isRTL ? 'text-right' : 'text-left'
                  } transition-all cursor-pointer ${
                    selectedStream === 'mathematiques'
                      ? 'bg-blue-50/70 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 text-blue-950 dark:text-blue-300 ring-1 ring-blue-600/20 shadow-2xs'
                      : 'bg-[#F8FAFC] dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">📐</span>
                    {selectedStream === 'mathematiques' && (
                      <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="text-xs font-bold mt-1 text-slate-900 dark:text-white">
                    {t.common.streamMathShort}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Maths coeff 7</div>
                </button>
              </div>

              {/* Security info banner: role is strictly student */}
              <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{t.auth.adminNotice}</span>
              </div>
            </div>
          )}

          {/* Primary Submit Button: [ Se connecter ] or [ Créer mon compte ] */}
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full mt-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
          >
            <span>
              {loading
                ? t.common.loading
                : mode === 'signup'
                ? t.auth.signupBtn
                : t.auth.loginBtn}
            </span>
            <ArrowRight
              className={`w-4 h-4 ${
                isRTL ? 'rotate-180' : ''
              }`}
            />
          </button>
        </form>

        {/* OR / OU / أو Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative px-3 bg-white dark:bg-[#131B2E] text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {t.auth.orDivider}
          </div>
        </div>

        {/* [ Continue with Google ] Button */}
        <button
          id="google-login-btn"
          type="button"
          disabled={googleLoading}
          onClick={handleGoogleSignIn}
          className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 active:scale-[0.99] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60"
        >
          {/* Official Google 'G' multicolor SVG icon */}
          <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
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
          <span>{t.auth.continueWithGoogle}</span>
        </button>

        {/* Switch Link between Login & Register */}
        <div className="mt-4 text-center">
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
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline cursor-pointer"
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
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline cursor-pointer"
              >
                {t.auth.switchLoginLink}
              </button>
            </p>
          )}
        </div>

        {/* Quick test accounts helper */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mb-2 flex items-center justify-between">
            <span>{isArabic ? 'حسابات تجريبية سريعة:' : 'Comptes de test rapide :'}</span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400">mdp: password123</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="quick-login-admin"
              type="button"
              onClick={() => fillQuickAccount('admin@bacnext.dz')}
              className="px-2 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100/70 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>👑</span>
              <span>Admin (Yahia)</span>
            </button>
            <button
              id="quick-login-student"
              type="button"
              onClick={() => fillQuickAccount('etudiant@bacnext.dz')}
              className="px-2 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100/70 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>🎓</span>
              <span>Étudiant (Yaya)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
