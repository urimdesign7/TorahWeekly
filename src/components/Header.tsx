import React from 'react';
import { Scroll, PlusCircle, BookOpen, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenPortionSelector: () => void;
  onOpenCustomModal: () => void;
  onScrollToSection: (sectionId: string) => void;
  streakDays: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPortionSelector,
  onOpenCustomModal,
  onScrollToSection,
  streakDays,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text wordmark with subtle iconography */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Scroll className="h-5 w-5" />
          </div>
          <a
            href="#"
            className="text-lg font-bold tracking-tight text-amber-50 font-display whitespace-nowrap hover:text-amber-300 transition-colors"
          >
            Torah Hebrew Memory
          </a>
        </div>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={onOpenPortionSelector}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-amber-400/80" />
            <span>토라포션 선택</span>
          </button>
          <button
            onClick={() => onScrollToSection('weekly-routine')}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
          >
            주간 7일 훈련
          </button>
          <button
            onClick={() => onScrollToSection('word-breakdown')}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
          >
            원어 단어 분해
          </button>
          <button
            onClick={() => onScrollToSection('study-progress')}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <span>암송 통계 ({streakDays}일 연속)</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCustomModal}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>암송 구절 추가</span>
          </button>
        </div>
      </div>
    </header>
  );
};
