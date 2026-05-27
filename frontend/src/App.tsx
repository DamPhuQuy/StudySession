import { useState } from 'react';
import { UploadForm } from './components/UploadForm';
import { Quiz } from './components/Quiz';
import type { Session } from './types';
import { GraduationCap } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  return (
    <div className="min-h-screen flex flex-col relative bg-bg-dark text-gray-200">
      {/* Navigation Header */}
      <header className="relative z-10 w-full glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
        <div 
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => setSession(null)}
        >
          <div className="p-2 bg-brand-500 rounded-xl text-white group-hover:scale-105 transition-transform duration-200 shadow-md glow-brand">
            <GraduationCap className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <span className="text-lg md:text-xl font-extrabold font-display tracking-tight text-white group-hover:text-brand-400 transition-colors">
              Study<span className="text-brand-400">Session</span>
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white border border-transparent hover:border-white/10 transition flex items-center justify-center"
            title="GitHub Repository"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center py-6 md:py-12 relative overflow-hidden">
        {!session ? (
          <UploadForm onSession={setSession} />
        ) : (
          <Quiz questions={session.questions} onBack={() => setSession(null)} />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-6 text-center text-xs text-gray-500 border-t border-white/5">
        <p>© {new Date().getFullYear()} StudySession. Thiết kế hướng tới trải nghiệm học tập đỉnh cao.</p>
      </footer>
    </div>
  );
}
