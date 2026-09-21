import React, { useState } from 'react';
import { StreamType } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface StreamOnboardingModalProps {
  isOpen: boolean;
  onSelectStream: (stream: StreamType) => void;
  defaultStream?: StreamType;
}

export const StreamOnboardingModal: React.FC<StreamOnboardingModalProps> = ({
  isOpen,
  onSelectStream,
  defaultStream = 'sciences_experimentales',
}) => {
  const { t, isRTL, language } = useLanguage();
  const isArabic = language === 'ar';

  const [selected, setSelected] = useState<StreamType>(defaultStream);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setIsSubmitting(true);
    onSelectStream(selected);
  };

  return (
    <div
      id="stream-onboarding-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#131B2E] border border-[#E5EAF2] dark:border-slate-800 shadow-2xl p-6 sm:p-8 text-center space-y-6 animate-in zoom-in-95 duration-200 transition-colors">
        {/* BacNext Brand Emblem */}
        <div className="flex justify-center">
          <BrandLogo size="md" showTagline={false} />
        </div>

        {/* Welcome Header */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.auth.streamOnboardingTitle}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {t.auth.streamOnboardingSubtitle}
          </p>
        </div>

        {/* The Two Streams */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          {/* Option 1: Sciences Expérimentales */}
          <button
            type="button"
            id="onboarding-stream-sci"
            onClick={() => setSelected('sciences_experimentales')}
            className={`p-5 rounded-2xl border text-start transition-all cursor-pointer relative flex flex-col justify-between ${
              selected === 'sciences_experimentales'
                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-start justify-between w-full">
              <span className="text-3xl">🔬</span>
              {selected === 'sciences_experimentales' ? (
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              ) : (
                <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600" />
              )}
            </div>
            <div className="mt-4">
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {isArabic ? 'العلوم التجريبية' : 'Sciences Expérimentales'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isArabic ? 'علوم الطبيعة والحياة • رياضيات • فيزياء' : 'SVT (coeff 6) • Maths • Physique'}
              </div>
            </div>
          </button>

          {/* Option 2: Mathématiques */}
          <button
            type="button"
            id="onboarding-stream-math"
            onClick={() => setSelected('mathematiques')}
            className={`p-5 rounded-2xl border text-start transition-all cursor-pointer relative flex flex-col justify-between ${
              selected === 'mathematiques'
                ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-600 shadow-xs ring-2 ring-blue-600/20'
                : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-start justify-between w-full">
              <span className="text-3xl">📐</span>
              {selected === 'mathematiques' ? (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              ) : (
                <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600" />
              )}
            </div>
            <div className="mt-4">
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {isArabic ? 'الرياضيات' : 'Mathématiques'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isArabic ? 'رياضيات معامل 7 • فيزياء معامل 6' : 'Maths (coeff 7) • Physique (coeff 6)'}
              </div>
            </div>
          </button>
        </div>

        {/* Security / Info Note */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            {isArabic
              ? 'يمكنك تغيير شعبتك في أي وقت لاحقًا من شريط التبديل العلوي.'
              : 'Tu pourras toujours changer de filière à tout moment depuis la barre supérieure.'}
          </span>
        </div>

        {/* Confirmation CTA */}
        <button
          id="onboarding-confirm-btn"
          type="button"
          disabled={isSubmitting}
          onClick={handleConfirm}
          className="w-full py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>{t.auth.streamOnboardingConfirm}</span>
          <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
};
