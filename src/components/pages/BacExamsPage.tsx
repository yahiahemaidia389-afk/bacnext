import React, { useState } from 'react';
import { ViewType, StreamType, BacExam } from '../../types';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { EmptyState } from '../common/EmptyState';
import {
  BookmarkCheck,
  Search,
  Download,
  ExternalLink,
  CheckCircle2,
  FileText,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface BacExamsPageProps {
  onNavigate: (view: ViewType, payload?: any) => void;
  currentStream: StreamType;
}

export const BacExamsPage: React.FC<BacExamsPageProps> = ({
  onNavigate,
  currentStream,
}) => {
  const { bacExams, subjects, role } = useContent();
  const { t, isRTL, language } = useLanguage();
  const isArabic = language === 'ar';

  const [activeStream, setActiveStream] = useState<StreamType>(currentStream);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect available years dynamically
  const publishedExams = bacExams.filter((b) => b.published);
  const availableYears = Array.from(new Set(publishedExams.map((e) => e.year))).sort((a, b) => b - a);

  // Available subjects for the active stream
  const activeSubjects = subjects.filter((s) => s.streams.includes(activeStream));

  const filteredExams = publishedExams.filter((exam) => {
    // Stream filter
    if (exam.stream !== activeStream) return false;

    // Year filter
    if (selectedYear !== 'all' && exam.year.toString() !== selectedYear) return false;

    // Subject filter
    if (selectedSubjectId !== 'all' && exam.subjectId !== selectedSubjectId) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const sub = subjects.find((s) => s.id === exam.subjectId);
      const subName = sub ? (sub.name + ' ' + sub.arabicName).toLowerCase() : '';
      const matchTitle = exam.title.toLowerCase().includes(q);
      const matchYear = exam.year.toString().includes(q);
      if (!matchTitle && !subName.includes(q) && !matchYear) return false;
    }

    return true;
  });

  const handleOpenPdf = (title: string, type: 'subject' | 'solution', url?: string) => {
    if (url && url.startsWith('http')) {
      window.open(url, '_blank');
      return;
    }
    // Clean preview document for demonstration
    const docWindow = window.open('', '_blank');
    if (docWindow) {
      docWindow.document.write(`
        <html dir="${isRTL ? 'rtl' : 'ltr'}">
          <head>
            <title>${title} - ${type === 'solution' ? (isArabic ? 'التصحيح النموذجي' : 'Corrigé Type') : (isArabic ? 'موضوع الامتحان' : 'Épreuve Officielle')} | BacNext</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; max-width: 800px; margin: 0 auto; }
              .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; }
              .badge { display: inline-block; padding: 4px 10px; background: #e0f2fe; color: #0369a1; border-radius: 6px; font-size: 12px; font-weight: bold; }
              .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <span class="badge">BacNext Exam Viewer</span>
              <h1>${title}</h1>
              <h3>${type === 'solution' ? (isArabic ? 'سلم التنقيط والتصحيح النموذجي الوزاري' : 'Corrigé Type et Barème Officiel') : (isArabic ? 'الموضوع الرسمي لشهادة البكالوريا' : 'Sujet Officiel du Baccalauréat')}</h3>
            </div>
            <div class="box">
              <p><strong>${isArabic ? 'الدورة:' : 'Session:'}</strong> ${title}</p>
              <p><strong>${isArabic ? 'الشعبة:' : 'Filière:'}</strong> ${activeStream === 'sciences_experimentales' ? 'العلوم التجريبية' : 'الرياضيات'}</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
              <p>${isArabic ? 'يحتوي هذا المستند على موضوع الامتحان الرسمي مع كافة الأسئلة والتمارين المقررة.' : 'Ce document contient l’énoncé officiel complet conforme au barème ministériel.'}</p>
            </div>
          </body>
        </html>
      `);
      docWindow.document.close();
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {isArabic ? 'مواضيع البكالوريا' : 'Sujets du BAC'}
            </h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isArabic
              ? 'مواضيع الدورات السابقة مع مواضيع وحلول PDF رسمية وسلم تنقيط معتمد.'
              : 'Annales officielles avec sujets et corrigés PDF conformes aux barèmes ministériels.'}
          </p>
        </div>

        {/* Stream Selector Pill */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold self-start sm:self-center">
          <button
            onClick={() => setActiveStream('sciences_experimentales')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeStream === 'sciences_experimentales'
                ? 'bg-white dark:bg-[#131B2E] text-blue-700 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {isArabic ? '🔬 علوم تجريبية' : '🔬 Sciences Exp.'}
          </button>
          <button
            onClick={() => setActiveStream('mathematiques')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeStream === 'mathematiques'
                ? 'bg-white dark:bg-[#131B2E] text-purple-700 dark:text-purple-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {isArabic ? '📐 رياضيات' : '📐 Maths'}
          </button>
        </div>
      </div>

      {/* Filter Options (Year, Subject, Search) */}
      <div className="space-y-3 bg-white dark:bg-[#131B2E] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        {/* Search */}
        <div className="relative">
          <Search className={`w-4 h-4 text-slate-400 dark:text-slate-500 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? 'ابحث عن دورة أو مادة أو موضوع...' : 'Rechercher une année, une matière...'}
            className={`w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${
              isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
            }`}
          />
        </div>

        {/* Year Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-400 dark:text-slate-500 font-bold shrink-0 px-1">{isArabic ? 'السنة:' : 'Année:'}</span>
          <button
            onClick={() => setSelectedYear('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
              selectedYear === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {isArabic ? 'جميع السنوات' : 'Toutes les années'}
          </button>
          {availableYears.map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr.toString())}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
                selectedYear === yr.toString()
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              BAC {yr}
            </button>
          ))}
        </div>

        {/* Subject Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-slate-400 dark:text-slate-500 font-bold shrink-0 px-1">{isArabic ? 'المادة:' : 'Matière:'}</span>
          <button
            onClick={() => setSelectedSubjectId('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
              selectedSubjectId === 'all'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {isArabic ? 'جميع المواد' : 'Toutes'}
          </button>
          {activeSubjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
                selectedSubjectId === sub.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isArabic ? sub.arabicName : sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Clear List of BAC Subjects */}
      {filteredExams.length === 0 ? (
        <EmptyState
          title={isArabic ? 'لا توجد مواضيع مطابقة' : 'Aucun sujet trouvé'}
          description={isArabic ? 'جرب اختيار سنة أخرى أو تغيير الشعبة.' : 'Essaie de sélectionner une autre année ou une autre filière.'}
          icon="document"
        />
      ) : (
        <div className="space-y-3">
          {filteredExams.map((exam) => {
            const subject = subjects.find((s) => s.id === exam.subjectId);
            const subjectTitle = isArabic && subject ? subject.arabicName : (subject?.name || 'Matière');
            const streamLabel =
              exam.stream === 'sciences_experimentales'
                ? (isArabic ? 'علوم تجريبية' : 'Sciences Exp.')
                : (isArabic ? 'رياضيات' : 'Mathématiques');

            return (
              <div
                key={exam.id}
                id={`bac-exam-card-${exam.id}`}
                className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-amber-300 dark:hover:border-amber-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Details (Year, Subject, Stream, Session) */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                      BAC {exam.year}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      {subjectTitle}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {streamLabel}
                    </span>
                    {exam.session && (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                        • {exam.session}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {exam.title}
                  </h3>
                </div>

                {/* Right: Explicit Subject PDF & Solution PDF buttons */}
                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                  {/* Subject PDF */}
                  <button
                    onClick={() => handleOpenPdf(exam.title, 'subject', exam.pdfUrl)}
                    className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    title={isArabic ? 'تحميل أو عرض موضوع الامتحان' : 'Consulter le sujet officiel'}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'موضوع PDF' : 'Sujet PDF'}</span>
                  </button>

                  {/* Solution PDF */}
                  <button
                    onClick={() => handleOpenPdf(exam.title, 'solution', exam.correctionUrl)}
                    className="py-2 px-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    title={isArabic ? 'تحميل أو عرض التصحيح النموذجي' : 'Consulter le corrigé officiel'}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{isArabic ? 'الحل النموذجي' : 'Corrigé PDF'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
