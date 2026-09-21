import React, { useState } from 'react';
import { ViewType, StreamType, ChatMessage } from '../../types';
import { sampleChatMessages } from '../../data/mockData';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Sparkles,
  Send,
  Bot,
  User,
  PlusCircle,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Copy,
  Check,
  RotateCcw,
  Compass,
  ArrowRight,
} from 'lucide-react';

interface AiAssistantPageProps {
  onNavigate: (view: ViewType, payload?: any) => void;
  currentStream: StreamType;
}

export const AiAssistantPage: React.FC<AiAssistantPageProps> = ({
  onNavigate,
  currentStream,
}) => {
  const { t, isRTL, language } = useLanguage();
  const isArabic = language === 'ar';

  const [messages, setMessages] = useState<ChatMessage[]>(sampleChatMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<
    'conversation' | 'explication' | 'exercices' | 'resume' | 'conseils'
  >('conversation');

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    // Simulate intelligent educational BAC response
    setTimeout(() => {
      let aiText = "Voici l'analyse détaillée adaptée au programme officiel du BAC Algérien :";
      let formula: string | undefined = undefined;
      let points: string[] = [];
      let suggestions: string[] = [];

      const lower = text.toLowerCase();

      if (lower.includes('dériv') || lower.includes('tangente') || lower.includes('variat')) {
        aiText = "En analyse mathématique pour le BAC, la dérivée te donne le comportement dynamique de ta fonction :";
        formula = "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}";
        points = [
          "**Étape 1** : Toujours préciser l'ensemble de dérivabilité D_f' avant tout calcul (points attribués au barème officiel).",
          "**Étape 2** : Calculer f'(x) puis factoriser au maximum pour déterminer le signe sans ambiguïté.",
          "**Étape 3** : Dresser le tableau de variations complet avec les limites aux bornes et les valeurs exactes des extrema."
        ];
        suggestions = [
          "Comment dériver f(x) = (2x + 1) · e^(-x) ?",
          "Que faire si la dérivée ne s'annule pas ?",
          "Rappelle-moi la formule de l'équation de la tangente."
        ];
      } else if (lower.includes('limite') || lower.includes('asymptote')) {
        aiText = "Pour lever une indétermination (forme indéterminée) au BAC :";
        formula = "\\lim_{x \\to +\\infty} \\frac{e^x}{x^n} = +\\infty \\quad \\text{(croissances comparées)}";
        points = [
          "**Astuce 1** : Mettre en facteur le terme prépondérant au numérateur et au dénominateur.",
          "**Astuce 2** : Utiliser l'expression conjuguée s'il y a des racines carrées.",
          "**Astuce 3** : Ne jamais oublier d'interpréter géométriquement les limites en termes d'asymptotes horizontales (y = b) ou verticales (x = a)."
        ];
        suggestions = [
          "Exemple d'asymptote oblique",
          "Théorème d'encadrement (Théorème des Gendarmes)"
        ];
      } else if (lower.includes('svt') || lower.includes('protéine') || lower.includes('immun')) {
        aiText = "Pour l'épreuve de SVT au BAC (Sciences Expérimentales) :";
        points = [
          "La démarche scientifique exige la structure : **Constat / Saisie de données ➔ Interprétation déductive ➔ Déduction / Bilan synthétique**.",
          "En immunologie, veille à bien distinguer la réponse humorale (Lymphocytes B et anticorps) de la réponse cellulaire (Lymphocytes T cytotoxiques).",
          "Toujours accompagner tes conclusions d'un schéma fonctionnel légendé et titré."
        ];
        suggestions = [
          "Schéma bilan de la synthèse des protéines",
          "Comment réussir l'exercice 3 de SVT (8 points) ?"
        ];
      } else {
        aiText = `J'ai bien reçu ta question. Dans le cadre de ta préparation au BAC en filière ${currentStream === 'sciences_experimentales' ? 'Sciences Expérimentales' : 'Mathématiques'}, voici la méthode préconisée :`;
        points = [
          "**Rigueur méthodologique** : Justifie chaque étape avec les théorèmes au programme (TVI, Dérivabilité, Théorème de Gauss/Bézout en Maths).",
          "**Gestion du temps** : Alloue 45 minutes par exercice de 5 points lors des épreuves de 3h30 à 4h30.",
          "**Rédaction** : Une présentation aérée avec des résultats encadrés maximise les points attribués par les correcteurs nationaux."
        ];
        suggestions = [
          "Fais-moi un résumé du chapitre Suites",
          "Donne-moi un exercice typique de BAC avec corrigé"
        ];
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        formula,
        points,
        suggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  };

  const handleModeClick = (mode: typeof activeMode, defaultPrompt: string) => {
    setActiveMode(mode);
    handleSendMessage(defaultPrompt);
  };

  const handleNewConversation = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: isArabic
          ? "تم بدء محادثة جديدة. ما هو المفهوم أو التمرين أو المسألة التي تريد مناقشتها والتدرب عليها؟"
          : "Nouvelle session d'assistance démarrée. Quelle notion, exercice ou démonstration du BAC souhaites-tu travailler ensemble ?",
        suggestions: [
          isArabic ? "اشرح لي مبرهنة القيم المتوسطة" : "Explique-moi le Théorème des Valeurs Intermédiaires",
          isArabic ? "كيفية حل معادلة تفاضلية في الفيزياء؟" : "Comment résoudre une équation différentielle en Physique ?",
          isArabic ? "نصائح وإرشادات لمنهجية الإجابة" : "Conseils pour rédiger l'épreuve de Philosophie"
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="space-y-6 pb-16" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isArabic ? 'المساعد الذكي للبكالوريا' : 'Assistant IA'}
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white uppercase tracking-wider">
              Beta
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            {isArabic
              ? 'مساعدك الشخصي للفهم والتحليل وليس الحفظ السطحي فقط'
              : 'Ton assistant pour comprendre, pas seulement mémoriser.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {isArabic ? 'مخصص لشعبة:' : 'Calibré sur :'}{' '}
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              {currentStream === 'sciences_experimentales'
                ? (isArabic ? 'علوم تجريبية' : 'Sciences Expérimentales')
                : (isArabic ? 'رياضيات' : 'Mathématiques')}
            </span>
          </span>
        </div>
      </div>

      {/* Main Two-Column AI Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        
        {/* SIDEBAR: Topics & Modes */}
        <div className="lg:col-span-4 rounded-3xl p-5 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-xs h-fit space-y-4 transition-colors">
          <button
            onClick={handleNewConversation}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isArabic ? 'محادثة جديدة' : 'Nouvelle conversation'}</span>
          </button>

          <div className="space-y-1 text-xs">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-3 py-1 uppercase tracking-wider">
              {isArabic ? 'أنماط المساعدة' : "Modes d'apprentissage"}
            </div>

            <button
              onClick={() => handleModeClick('explication', isArabic ? "اشرح لي طريقة الاشتقاق بشكل مبسط ومفهوم." : "Explique-moi la méthode de dérivation d'une manière simple et intuitive.")}
              className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-colors cursor-pointer ${
                activeMode === 'explication'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/30 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{isArabic ? 'شرح المفاهيم' : 'Explications'}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isArabic ? 'استيعاب المعنى الهندسي والتطبيقي للنظريات' : 'Comprendre le sens intuitif des théorèmes'}
                </div>
              </div>
            </button>

            <button
              onClick={() => handleModeClick('exercices', isArabic ? "ساعدني في حل تمرين نموذجي حول المتتاليات العددية." : "Aide-moi à résoudre un exercice type BAC sur les suites géométriques.")}
              className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-colors cursor-pointer ${
                activeMode === 'exercices'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/30 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{isArabic ? 'حل التمارين خطوة بخطوة' : "Résolution d'exercices"}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isArabic ? 'توجيه منهجي تدريجي دون حرق الحل' : 'Guider pas à pas sans donner la réponse brute'}
                </div>
              </div>
            </button>

            <button
              onClick={() => handleModeClick('resume', isArabic ? "لخص لي أهم قوانين درس الكهرباء RC و RL." : "Fais-moi un résumé condensé du cours d'électrocinétique (RC et RL).")}
              className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-colors cursor-pointer ${
                activeMode === 'resume'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/30 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{isArabic ? 'ملخصات الدروس' : 'Résumé de cours'}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isArabic ? 'بطاقات مراجعة سريعة والقوانين الأساسية' : 'Fiches de révision express et formules clés'}
                </div>
              </div>
            </button>

            <button
              onClick={() => handleModeClick('conseils', isArabic ? "ما هي أهم النصائح لإدارة الوقت في الامتحان؟" : "Quels sont les meilleurs conseils pour gérer son temps lors des épreuves du BAC ?")}
              className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-colors cursor-pointer ${
                activeMode === 'conseils'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/30 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Compass className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{isArabic ? 'نصائح وتوجيهات' : 'Conseils'}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isArabic ? 'منهجية ورقة الإجابة والتحكم في التوتر' : "Méthodologie d'épreuve et gestion du stress"}
                </div>
              </div>
            </button>
          </div>

          {/* Assistant Note */}
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
            <div className="text-indigo-800 dark:text-indigo-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{isArabic ? 'ضمان بيداغوجي' : 'Garantie Pédagogique'}</span>
            </div>
            <p className="leading-relaxed">
              {isArabic
                ? 'يعتمد المساعد طريقة سقراط التفاعلية: يطرح أسئلة توجيهية لتمكينك من استنتاج الحل بنفسك وترسيخه في الذاكرة.'
                : "L'IA BacNext applique la méthode socratique : elle t'amène à déduire la solution pour consolider ta mémoire à long terme."}
            </p>
          </div>
        </div>

        {/* CHAT INTERFACE */}
        <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between overflow-hidden transition-colors">
          
          {/* Chat Messages Log */}
          <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto max-h-[580px]">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 text-left ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isUser
                        ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-xs'
                        : 'bg-indigo-50 dark:bg-[#131B2E] border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-3 relative group ${
                      isUser
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>

                    {/* Formula snippet if provided */}
                    {msg.formula && (
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#050814] border border-indigo-200 dark:border-indigo-500/30 font-mono text-indigo-700 dark:text-cyan-300 text-xs sm:text-sm overflow-x-auto">
                        {msg.formula}
                      </div>
                    )}

                    {/* Bullet Points */}
                    {msg.points && msg.points.length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                        {msg.points.map((pt: string, idx: number) => (
                          <div key={idx} className="text-slate-700 dark:text-slate-300 text-xs flex items-start gap-2">
                            <span className="text-indigo-500 dark:text-indigo-400 shrink-0 font-bold">•</span>
                            <span dangerouslySetInnerHTML={{ __html: pt.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-white font-semibold">$1</strong>') }} />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Copy action & Timestamp */}
                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 dark:text-slate-400">
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copié</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copier</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Suggested follow-up chips */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-1.5">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {isArabic ? 'أسئلة مقترحة:' : 'Questions suggérées :'}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestions.map((sug: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => handleSendMessage(sug)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-500/25 text-[11px] text-indigo-700 dark:text-indigo-300 text-left transition-colors cursor-pointer"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-[#131B2E] border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 font-medium">
                    {isArabic ? 'المساعد يجهز الإجابة...' : "L'assistant prépare sa réponse pédagogique..."}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-50/70 dark:bg-[#080d1a] border-t border-slate-200 dark:border-slate-800 transition-colors">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isArabic ? 'اطرح سؤالك حول البرنامج أو التمارين...' : 'Pose ta question sur le programme (ex: Comment dériver ln(x) ?)...'}
                className="flex-1 py-3 px-4 text-xs sm:text-sm rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />

              <button
                type="submit"
                disabled={!inputValue.trim()}
                className={`p-3 rounded-2xl text-white transition-all ${
                  inputValue.trim()
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md shadow-indigo-600/20 hover:opacity-90 cursor-pointer'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                <Send className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </form>

            <div className="mt-2 text-[10px] text-center text-slate-500 dark:text-slate-400">
              {isArabic
                ? 'يعتمد المساعد بدقة على المناهج الوزارية والكتب المدرسية الرسمية 2026/2027.'
                : "L'IA BacNext s'appuie strictement sur les manuels scolaires et les arrêtés ministériels 2026/2027."}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
