import React, { useState, useEffect } from 'react';
import { ViewType, StreamType, UserProfile } from './types';
import { initialProfile } from './data/mockData';
import { ContentProvider } from './context/ContentContext';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout components
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { QuickSearchModal } from './components/layout/QuickSearchModal';
import { AuthModal } from './components/common/AuthModal';
import { StreamOnboardingModal } from './components/common/StreamOnboardingModal';
import { useAuth } from './context/AuthContext';

// Pages
import { LandingPage } from './components/pages/LandingPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { SubjectsPage } from './components/pages/SubjectsPage';
import { SubjectDetailPage } from './components/pages/SubjectDetailPage';
import { LessonsPage } from './components/pages/LessonsPage';
import { ExercisesPage } from './components/pages/ExercisesPage';
import { SummariesPage } from './components/pages/SummariesPage';
import { LessonPage } from './components/pages/LessonPage';
import { BacExamsPage } from './components/pages/BacExamsPage';
import { QuizPage } from './components/pages/QuizPage';
import { AiAssistantPage } from './components/pages/AiAssistantPage';
import { StudyPlannerPage } from './components/pages/StudyPlannerPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { LoginPage } from './components/pages/LoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';

function AppContent() {
  const { isRTL } = useLanguage();
  const { currentUser, isAdmin, showStreamOnboarding, completeStreamOnboarding } = useAuth();

  // Initialize view: unauthenticated users land on public landing page
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    const wasLoggedOut = typeof window !== 'undefined' && localStorage.getItem('bacnext_logged_out') === 'true';
    const savedUser = typeof window !== 'undefined' && localStorage.getItem('bacnext_current_user');
    if (wasLoggedOut || !savedUser) {
      return 'landing';
    }
    return 'dashboard';
  });

  const [currentStream, setCurrentStream] = useState<StreamType>('sciences_experimentales');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('maths');
  const [selectedLessonId, setSelectedLessonId] = useState<string | undefined>(undefined);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => ({
    ...initialProfile,
    name: '',
    avatar: '',
  }));

  const prevUserIdRef = React.useRef<string | null>(null);

  // Synchronize user profile with authenticated user & route to respective role dashboard
  useEffect(() => {
    if (currentUser) {
      setUserProfile((prev) => ({
        ...prev,
        name: currentUser.full_name,
        avatar: currentUser.avatar_url || prev.avatar,
        currentStream: currentUser.stream || prev.currentStream,
      }));
      if (currentUser.stream) {
        setCurrentStream(currentUser.stream);
      }

      // Automatically route on login / user switch:
      // - If role = student -> Student Dashboard ('dashboard')
      // - If role = admin -> Admin Dashboard ('admin')
      const isLoginOrSwitch = prevUserIdRef.current !== currentUser.id;
      prevUserIdRef.current = currentUser.id;

      if (isLoginOrSwitch) {
        if (currentUser.role === 'admin') {
          setCurrentView('admin');
        } else {
          setCurrentView('dashboard');
        }
      }
    } else {
      prevUserIdRef.current = null;
      // Complete Logout Cleanup: reset profile state to empty
      setUserProfile({
        ...initialProfile,
        name: '',
        avatar: '',
      });
      // Force user back to public landing page and reset URL/history
      if (currentView !== 'landing' && currentView !== 'login') {
        setCurrentView('landing');
        try {
          window.history.replaceState(null, '', '/');
        } catch {}
      }
    }
  }, [currentUser]);

  // Security guard: Prevent browser back-navigation to protected views when logged out
  useEffect(() => {
    const handlePopState = () => {
      if (!currentUser && currentView !== 'landing' && currentView !== 'login') {
        setCurrentView('landing');
        try {
          window.history.replaceState(null, '', '/');
        } catch {}
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser, currentView]);

  // Security guard: Non-admins cannot access admin route
  useEffect(() => {
    if (currentView === 'admin' && !isAdmin) {
      setCurrentView('dashboard');
    }
  }, [currentView, isAdmin]);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);

  // Keyboard shortcut for Command+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Central Navigation Handler with protected route checking
  const handleNavigate = (view: ViewType, payload?: any) => {
    if (!currentUser && view !== 'landing' && view !== 'login') {
      // Protected routes require sign in
      handleOpenAuth('login');
      setCurrentView('landing');
      try {
        window.history.replaceState(null, '', '/');
      } catch {}
      return;
    }

    if (payload?.subjectId) {
      setSelectedSubjectId(payload.subjectId);
    }
    if (payload?.lessonId) {
      setSelectedLessonId(payload.lessonId);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleStreamChange = (stream: StreamType) => {
    setCurrentStream(stream);
    setUserProfile((prev) => ({ ...prev, currentStream: stream }));
  };

  // Safe view resolution: unauthenticated users only see public views
  const isLoginPage = currentView === 'login';
  const isLanding = currentView === 'landing' || (!currentUser && !isLoginPage);
  const isAdminView = currentView === 'admin' && isAdmin;

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden transition-colors"
    >
      {isLoginPage ? (
        // AUTHENTICATION VIEW (Dedicated Login / Signup Page)
        <div className="flex-1 flex flex-col min-h-screen">
          <Navbar
            currentView={currentView}
            onNavigate={handleNavigate}
            currentStream={currentStream}
            onStreamChange={handleStreamChange}
            profile={userProfile}
            onOpenAuth={handleOpenAuth}
            onOpenSearch={() => setIsQuickSearchOpen(true)}
          />
          <main className="flex-1">
            <LoginPage
              onNavigate={handleNavigate}
              initialMode={authModalMode}
            />
          </main>
        </div>
      ) : isLanding ? (
        // LANDING PAGE VIEW (Optional presentation view)
        <div className="flex-1 flex flex-col min-h-screen">
          <Navbar
            currentView={currentView}
            onNavigate={handleNavigate}
            currentStream={currentStream}
            onStreamChange={handleStreamChange}
            profile={userProfile}
            onOpenAuth={handleOpenAuth}
            onOpenSearch={() => setIsQuickSearchOpen(true)}
          />
          <main className="flex-1">
            <LandingPage
              onNavigate={handleNavigate}
              currentStream={currentStream}
              onStreamSelect={handleStreamChange}
              onOpenAuth={handleOpenAuth}
            />
          </main>
        </div>
      ) : (
        // DESKTOP APPLICATION LAYOUT (Fixed Sidebar + Top Header + Main Content)
        <div className="flex-1 flex min-h-screen">
          {/* Desktop Fixed Left Sidebar */}
          <div className="hidden md:block fixed top-0 bottom-0 start-0 z-30 w-[260px]">
            <Sidebar
              currentView={currentView}
              onNavigate={handleNavigate}
              currentStream={currentStream}
              onStreamChange={handleStreamChange}
              profile={userProfile}
            />
          </div>

          {/* Main Area: Offset by sidebar width on desktop */}
          <div className="flex-1 flex flex-col min-w-0 md:ms-[260px] min-h-screen">
            {/* Sticky Top Header */}
            <Navbar
              currentView={currentView}
              onNavigate={handleNavigate}
              currentStream={currentStream}
              onStreamChange={handleStreamChange}
              profile={userProfile}
              onOpenAuth={handleOpenAuth}
              onOpenSearch={() => setIsQuickSearchOpen(true)}
            />

            {/* Scrollable Content Container */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto pb-24 md:pb-12">
              {isAdminView ? (
                <AdminDashboard onBackToStudent={() => handleNavigate('dashboard')} />
              ) : (
                <>
                  {currentView === 'dashboard' && (
                    <DashboardPage
                      onNavigate={handleNavigate}
                      currentStream={currentStream}
                      onStreamChange={handleStreamChange}
                      profile={userProfile}
                    />
                  )}

                  {currentView === 'subjects' && (
                    <SubjectsPage
                      onNavigate={handleNavigate}
                      currentStream={currentStream}
                      onStreamChange={handleStreamChange}
                    />
                  )}

                  {currentView === 'subject-detail' && (
                    <SubjectDetailPage
                      onNavigate={handleNavigate}
                      subjectId={selectedSubjectId}
                      currentStream={currentStream}
                    />
                  )}

                  {currentView === 'lessons' && (
                    <LessonsPage
                      onNavigate={handleNavigate}
                      currentStream={currentStream}
                    />
                  )}

                  {currentView === 'lesson' && (
                    <LessonPage
                      onNavigate={handleNavigate}
                      currentStream={currentStream}
                      lessonId={selectedLessonId}
                    />
                  )}

                  {currentView === 'exercises' && (
                    <ExercisesPage
                      onNavigate={handleNavigate}
                      currentStream={currentStream}
                    />
                  )}

                  {currentView === 'summaries' && (
                    <SummariesPage
                      onNavigate={handleNavigate}
                      currentStream={currentStream}
                    />
                  )}

                  {currentView === 'bac-exams' && (
                    <BacExamsPage
                      onNavigate={handleNavigate}
                      currentStream={currentStream}
                    />
                  )}

                  {currentView === 'quiz' && (
                    <QuizPage
                      onNavigate={handleNavigate}
                      currentStream={currentStream}
                    />
                  )}

                  {currentView === 'ai-assistant' && (
                    <AiAssistantPage
                      onNavigate={handleNavigate}
                      currentStream={currentStream}
                    />
                  )}

                  {currentView === 'planner' && (
                    <StudyPlannerPage
                      onNavigate={handleNavigate}
                      currentStream={currentStream}
                    />
                  )}

                  {currentView === 'profile' && (
                    <ProfilePage
                      onNavigate={handleNavigate}
                      profile={userProfile}
                      currentStream={currentStream}
                      onStreamChange={handleStreamChange}
                    />
                  )}
                </>
              )}
            </main>

            {/* Mobile Bottom Navigation (Visible on mobile only) */}
            <MobileNav currentView={currentView} onNavigate={handleNavigate} />
          </div>
        </div>
      )}

      {/* Global Command+K Quick Search Modal */}
      <QuickSearchModal
        isOpen={isQuickSearchOpen}
        onClose={() => setIsQuickSearchOpen(false)}
        onNavigate={handleNavigate}
        currentStream={currentStream}
      />

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        defaultStream={currentStream}
        onSuccess={(user) => {
          setIsAuthModalOpen(false);
          setUserProfile((prev) => ({
            ...prev,
            name: user.full_name,
            currentStream: user.stream,
          }));
          setCurrentStream(user.stream);
          handleNavigate('dashboard');
        }}
      />

      {/* Stream Onboarding Modal for new Google users */}
      <StreamOnboardingModal
        isOpen={showStreamOnboarding}
        defaultStream={currentStream}
        onSelectStream={async (stream) => {
          await completeStreamOnboarding(stream);
          handleStreamChange(stream);
          handleNavigate('dashboard');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ContentProvider>
            <AppContent />
          </ContentProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
