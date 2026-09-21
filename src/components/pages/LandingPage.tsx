import React from 'react';
import { ViewType, StreamType } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  ArrowRight,
  BookOpen,
  FileCheck2,
  FileText,
  BookmarkCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: ViewType, payload?: any) => void;
  currentStream: StreamType;
  onStreamSelect: (stream: StreamType) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  currentStream,
  onStreamSelect,
  onOpenAuth,
}) => {
  const { t, isRTL, language } = useLanguage();
  const isArabic = language === 'ar';

  const handleSelectStreamAndStart = (stream: StreamType) => {
    onStreamSelect(stream);
    onNavigate('dashboard');
  };

  const pillars = [
    {
      id: 'lessons' as ViewType,
      icon: BookOpen,
      iconColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200/60 dark:border-blue-800/60',
      title: isArabic ? 'الدروس' : 'Cours',
      description: isArabic ? 'تعلم الدروس خطوة بخطوة وفق البرنامج الرسمي.' : 'Apprends les cours étape par étape selon le programme.',
      actionText: isArabic ? 'تصفح الدروس' : 'Consulter les cours',
    },
    {
      id: 'exercises' as ViewType,
      icon: FileCheck2,
      iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/60 dark:border-emerald-800/60',
      title: isArabic ? 'التمارين' : 'Exercices',
      description: isArabic ? 'طبّق ما تعلمته وتدرّب مع تمارين متدرجة الصعوبة.' : 'Applique tes connaissances et entraîne-toi avec des séries ciblées.',
      actionText: isArabic ? 'تصفح التمارين' : 'Résoudre des exercices',
    },
    {
      id: 'summaries' as ViewType,
      icon: FileText,
      iconColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200/60 dark:border-purple-800/60',
      title: isArabic ? 'الملخصات' : 'Résumés',
      description: isArabic ? 'راجع أهم القوانين والنقاط الأساسية بسرعة وتركيز.' : 'Révise les points clés et formules essentielles en un coup d’œil.',
      actionText: isArabic ? 'تصفح الملخصات' : 'Voir les résumés',
    },
    {
      id: 'bac-exams' as ViewType,
      icon: BookmarkCheck,
      iconColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200/60 dark:border-amber-800/60',
      title: isArabic ? 'مواضيع البكالوريا' : 'Sujets BAC',
      description: isArabic ? 'تدرّب على مواضيع السنوات السابقة مع الحلول النموذجية.' : 'Entraîne-toi sur les annales officielles avec corrigés détaillés.',
      actionText: isArabic ? 'مواضيع البكالوريا' : 'Voir les sujets',
    },
  ];

  const whyPoints = [
    {
      title: isArabic ? 'مجاني 100%' : '100% Gratuit',
      desc: isArabic ? 'منصة مفتوحة لجميع التلاميذ بدون أي اشتراكات أو رسوم مخفية.' : 'Accès libre et ouvert à tous les élèves sans frais.',
      icon: Zap,
    },
    {
      title: isArabic ? 'مخصص للعلوم والرياضيات' : 'Centré Sciences & Maths',
      desc: isArabic ? 'تركيز كامل على شعبتي العلوم التجريبية والرياضيات فقط لضمان الجودة.' : 'Concentration exclusive sur les deux filières phares.',
      icon: GraduationCap,
    },
    {
      title: isArabic ? 'بدون تشتيت' : 'Zéro distraction',
      desc: isArabic ? 'واجهة بسيطة وسريعة بدون إعلانات مزعجة تتيح لك التركيز في دراستك.' : 'Interface épurée et rapide, pensée pour étudier efficacement.',
      icon: ShieldCheck,
    },
    {
      title: isArabic ? 'وفق منهاج الجزائر' : 'Programme officiel algérien',
      desc: isArabic ? 'تنظيم دقيق للمواد والمعاملات المعتمدة في امتحان شهادة البكالوريا.' : 'Structuré selon les coefficients et chapitres officiels du BAC.',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="relative bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 overflow-hidden transition-colors" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Background subtle mesh decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[480px] pointer-events-none overflow-hidden -z-10 bg-dots-light opacity-60" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-24 space-y-28">
        {/* =========================================================================
            1. HERO SECTION
           ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pt-4">
          <div className="lg:col-span-7 space-y-6 text-start">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
              <span>{isArabic ? 'منصة مجانية 100% لتلاميذ البكالوريا' : 'Plateforme 100% gratuite pour le BAC'}</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.14]">
              {isArabic ? (
                <>
                  طريقك نحو التفوق في{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">
                    البكالوريا
                  </span>{' '}
                  يبدأ هنا.
                </>
              ) : (
                <>
                  Votre chemin vers{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">
                    l'excellence au BAC
                  </span>{' '}
                  commence ici.
                </>
              )}
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              {isArabic
                ? 'دروس، تمارين، ملخصات، ومواضيع البكالوريا لشعبتي العلوم التجريبية والرياضيات.'
                : 'Cours, exercices, résumés et sujets officiels du BAC pour les filières Sciences Expérimentales et Mathématiques.'}
            </p>

            {/* Main Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                id="hero-start-study-btn"
                onClick={() => onNavigate('dashboard')}
                className="py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
              >
                <span>{isArabic ? 'ابدأ المراجعة الآن' : 'Commencer à réviser'}</span>
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>

              <button
                id="hero-login-btn"
                onClick={() => onOpenAuth('login')}
                className="py-3 px-5 rounded-xl bg-white dark:bg-[#131B2E] hover:bg-slate-50 dark:hover:bg-[#1A243B] text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-white font-semibold text-sm border border-blue-200 dark:border-blue-800/60 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isArabic ? 'تسجيل الدخول' : 'Connexion'}</span>
              </button>

              <button
                id="hero-choose-stream-btn"
                onClick={() => {
                  const el = document.getElementById('landing-streams');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else onNavigate('dashboard');
                }}
                className="py-3 px-5 rounded-xl bg-white dark:bg-[#131B2E] hover:bg-slate-50 dark:hover:bg-[#1A243B] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold text-sm border border-slate-300 dark:border-slate-700 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isArabic ? 'اختر شعبتك' : 'Choisir ta filière'}</span>
              </button>
            </div>
          </div>

          {/* Right: Clean Modern Workspace Card */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="w-full max-w-md bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/50 p-6 space-y-5 transition-colors">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 ml-1">bacnext.dz</span>
                </div>
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 px-2.5 py-0.5 rounded-full">
                  BAC 2026
                </span>
              </div>

              {/* Math card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1A243B] border border-slate-200/70 dark:border-slate-700/80 space-y-1.5 font-mono text-xs">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-sans font-semibold tracking-wider">
                  {isArabic ? 'الرياضيات • الدوال الأسية' : 'Mathématiques • Fonctions exponentielles'}
                </div>
                <div className="text-slate-900 dark:text-white font-semibold text-sm">
                  f'(x) = e^x \cdot \ln(x) + \frac{'{e^x}'}{'{x}'}
                </div>
                <div className="text-blue-600 dark:text-blue-400 font-medium">
                  \lim_{'{x \\to +\\infty}'} \frac{'{e^x}'}{'{x^n}'} = +\\infty
                </div>
              </div>

              {/* Two Column Preview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1A243B] border border-slate-200/70 dark:border-slate-700/80 space-y-1">
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {isArabic ? 'الفيزياء' : 'Physique'}
                  </div>
                  <div className="text-xs font-mono text-slate-800 dark:text-slate-200">
                    u_C(t) + RC \frac{'{du_C}'}{'{dt}'} = E
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 pt-0.5">
                    \tau = R \cdot C
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 flex flex-col justify-between">
                  <div className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    {isArabic ? 'التقدم الإجمالي' : 'Progression'}
                  </div>
                  <div className="text-2xl font-extrabold text-blue-900 dark:text-blue-200">
                    68%
                  </div>
                  <div className="w-full bg-blue-200/60 dark:bg-blue-900/60 h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-blue-600 dark:bg-blue-400 h-full rounded-full w-[68%]" />
                  </div>
                </div>
              </div>

              {/* Fast Pillar Links Preview */}
              <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="text-center py-1.5 rounded-lg bg-slate-50 dark:bg-[#1A243B] text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-transparent dark:border-slate-750">
                  {isArabic ? 'دروس' : 'Cours'}
                </div>
                <div className="text-center py-1.5 rounded-lg bg-slate-50 dark:bg-[#1A243B] text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-transparent dark:border-slate-750">
                  {isArabic ? 'تمارين' : 'Exercices'}
                </div>
                <div className="text-center py-1.5 rounded-lg bg-slate-50 dark:bg-[#1A243B] text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-transparent dark:border-slate-750">
                  {isArabic ? 'ملخصات' : 'Résumés'}
                </div>
                <div className="text-center py-1.5 rounded-lg bg-slate-50 dark:bg-[#1A243B] text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-transparent dark:border-slate-750">
                  {isArabic ? 'بكالوريا' : 'BAC'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. STREAM SELECTION ("اختر شعبتك")
           ========================================================================= */}
        <section id="landing-streams" className="space-y-8 scroll-mt-24">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isArabic ? 'اختر شعبتك' : 'Choisis ta filière'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isArabic
                ? 'انقر على شعبتك للدخول المباشر إلى المواد والدروس المخصصة.'
                : 'Sélectionne ta filière pour accéder immédiatement aux matières correspondantes.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {/* Card 1: Sciences Expérimentales */}
            <div
              id="stream-card-sciences"
              onClick={() => handleSelectStreamAndStart('sciences_experimentales')}
              role="button"
              tabIndex={0}
              className={`p-7 rounded-2xl bg-white dark:bg-[#131B2E] border transition-all cursor-pointer text-start space-y-4 shadow-sm hover:shadow-md ${
                currentStream === 'sciences_experimentales'
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">🔬</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                  {isArabic ? 'شعبة العلوم التجريبية' : 'Sciences Expérimentales'}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isArabic ? 'العلوم التجريبية' : 'Sciences Expérimentales'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {isArabic
                    ? 'علوم الطبيعة والحياة (معامل 6) • العلوم الفيزيائية (معامل 6) • الرياضيات (معامل 5)'
                    : 'SVT (Coeff 6) • Physique-Chimie (Coeff 6) • Mathématiques (Coeff 5)'}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                <span>{isArabic ? 'ابدأ المراجعة بهذه الشعبة' : 'Choisir cette filière'}</span>
                <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Card 2: Mathématiques */}
            <div
              id="stream-card-maths"
              onClick={() => handleSelectStreamAndStart('mathematiques')}
              role="button"
              tabIndex={0}
              className={`p-7 rounded-2xl bg-white dark:bg-[#131B2E] border transition-all cursor-pointer text-start space-y-4 shadow-sm hover:shadow-md ${
                currentStream === 'mathematiques'
                  ? 'border-purple-500 ring-2 ring-purple-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">📐</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                  {isArabic ? 'شعبة الرياضيات' : 'Mathématiques'}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isArabic ? 'الرياضيات' : 'Mathématiques'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {isArabic
                    ? 'الرياضيات (معامل 7) • العلوم الفيزيائية (معامل 6) • علوم الطبيعة والحياة (معامل 2)'
                    : 'Mathématiques (Coeff 7) • Physique-Chimie (Coeff 6) • SVT (Coeff 2)'}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
                <span>{isArabic ? 'ابدأ المراجعة بهذه الشعبة' : 'Choisir cette filière'}</span>
                <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. FOUR MAIN PILLARS SECTION
           ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {isArabic ? 'المحتوى التعليمي الأساسي' : 'Contenu Essentiel'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isArabic ? 'أركان المنصة الأربعة' : 'Les 4 Piliers de BacNext'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isArabic
                ? 'كل ما تحتاجه للتحضير متوفر في أربعة أقسام واضحة وسهلة الوصول.'
                : 'Tout ce dont tu as besoin réuni en 4 catégories fondamentales.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.id}
                  onClick={() => onNavigate(pillar.id)}
                  role="button"
                  tabIndex={0}
                  className="p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer flex flex-col justify-between text-start group"
                >
                  <div className="space-y-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${pillar.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <span>{pillar.actionText}</span>
                    <ArrowRight className={`w-3.5 h-3.5 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            4. WHY BACNEXT?
           ========================================================================= */}
        <section className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-8 transition-colors">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isArabic ? 'لماذا BacNext؟' : 'Pourquoi choisir BacNext ?'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isArabic
                ? 'صُممت المنصة لتكون رفيقك اليومي في المراجعة حتى يوم الامتحان.'
                : 'Conçue pour être ton espace de révision quotidien jusqu’au jour du BAC.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <div key={index} className="space-y-2.5 text-start">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {point.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {point.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            5. CALL TO ACTION
           ========================================================================= */}
        <section className="p-10 sm:p-14 rounded-3xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-700 dark:from-blue-900 dark:via-blue-800 dark:to-indigo-900 text-white text-center space-y-6 shadow-xl shadow-blue-600/15 border border-transparent dark:border-blue-500/20">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {isArabic ? 'جاهز تبدأ المراجعة؟' : 'Prêt à commencer tes révisions ?'}
            </h2>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              {isArabic
                ? 'انضم الآن مجانًا وابدأ في مراجعة دروسك والتحضير للبكالوريا بثقة وتنظيم.'
                : 'Accède gratuitement à toutes les ressources et commence à préparer ton BAC avec rigueur.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="cta-start-free-btn"
              onClick={() => onNavigate('dashboard')}
              className="py-3 px-8 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              {isArabic ? 'ابدأ الآن مجانًا' : 'Commencer gratuitement'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
