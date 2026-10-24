import React, { useState } from 'react';
import { X, Search, CheckCircle2, Bookmark, BookOpen, Sparkles } from 'lucide-react';
import { TorahPortion, PortionProgress } from '../types/torah';

interface PortionSelectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  portions: TorahPortion[];
  currentPortionId: string;
  onSelectPortion: (portion: TorahPortion) => void;
  progressMap: Record<string, PortionProgress>;
}

export const PortionSelectorDrawer: React.FC<PortionSelectorDrawerProps> = ({
  isOpen,
  onClose,
  portions,
  currentPortionId,
  onSelectPortion,
  progressMap,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<string>('all');

  if (!isOpen) return null;

  const filteredPortions = portions.filter((p) => {
    const matchesSearch =
      p.nameKorean.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameHebrew.includes(searchQuery) ||
      p.memoryVerse.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.themeSummary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBook = selectedBook === 'all' || p.book === selectedBook;

    return matchesSearch && matchesBook;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100 font-display">
              토라포션 성경 구절 선택
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="포션 이름, 성경 구절, 주제 검색..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500/60 focus:outline-none"
            />
          </div>

          {/* Book Filter segmented buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: '전체' },
              { id: 'Genesis', label: '창세기' },
              { id: 'Exodus', label: '출애굽기' },
              { id: 'Leviticus', label: '레위기' },
              { id: 'Numbers', label: '민수기' },
              { id: 'Deuteronomy', label: '신명기' },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBook(b.id)}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedBook === b.id
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/40'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Portions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredPortions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              검색 조건에 맞는 토라포션이 없습니다.
            </div>
          ) : (
            filteredPortions.map((portion) => {
              const isSelected = portion.id === currentPortionId;
              const progress = progressMap[portion.id];
              const isMastered = progress?.isMastered;
              const completedDaysCount = progress
                ? Object.values(progress.days).filter((d) => d.completed).length
                : 0;

              return (
                <button
                  key={portion.id}
                  onClick={() => {
                    onSelectPortion(portion);
                    onClose();
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/10 ring-1 ring-amber-400/40'
                      : 'border-slate-800/80 bg-slate-900/60 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-amber-400">
                          {portion.bookKorean} 제{portion.portionNumber}주
                        </span>
                        {isMastered && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>완송</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 mt-0.5">
                        {portion.nameKorean}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {portion.memoryVerse.reference} · {portion.memoryVerse.koreanTranslation}
                      </p>
                    </div>

                    <span
                      dir="rtl"
                      className="font-hebrew text-lg font-bold text-amber-300/80 shrink-0"
                    >
                      {portion.nameHebrew}
                    </span>
                  </div>

                  {/* Progress indicator */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-500">
                    <span>암송 훈련 진행도</span>
                    <span className="font-mono text-amber-400">
                      {completedDaysCount} / 7일 완료
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
