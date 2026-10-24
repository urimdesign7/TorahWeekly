import React from 'react';
import { X, Volume2, Bookmark, BookOpen, Layers } from 'lucide-react';
import { HebrewWord } from '../types/torah';
import { HebrewSpeechSynthesizer } from '../utils/audio';

interface WordInspectorModalProps {
  word: HebrewWord | null;
  onClose: () => void;
  isWordFavorited: boolean;
  onToggleWordFavorite: (wordId: string) => void;
}

export const WordInspectorModal: React.FC<WordInspectorModalProps> = ({
  word,
  onClose,
  isWordFavorited,
  onToggleWordFavorite,
}) => {
  if (!word) return null;

  const handlePronounce = () => {
    HebrewSpeechSynthesizer.speak(word.hebrew, {
      rate: 0.8,
      phoneticFallback: word.pronunciation,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-amber-600/40 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <Layers className="w-4 h-4" />
            <span>히브리어 어근 & 형태론 분해</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Word Hero Card */}
        <div className="p-6 space-y-6">
          <div className="text-center space-y-3 bg-amber-950/15 border border-amber-800/20 rounded-xl p-6">
            <div className="flex items-center justify-center gap-4">
              <span
                dir="rtl"
                className="text-5xl font-bold font-hebrew text-amber-200"
              >
                {word.hebrew}
              </span>
              <button
                onClick={handlePronounce}
                title="단어 발음 듣기"
                className="p-2.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-transform active:scale-95"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-amber-300">
              <span className="font-semibold">발음: [{word.pronunciation}]</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">{word.phoneticEn}</span>
            </div>

            <p className="text-xl font-bold text-slate-100">
              {word.meaning}
            </p>
          </div>

          {/* Morphological Breakdown Table */}
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">어근 (Shoresh)</span>
              <span className="font-semibold text-amber-300 font-hebrew text-base">
                {word.root}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">스트롱 사전 번호</span>
              <span className="font-mono font-medium text-emerald-400">
                {word.strongNumber}
              </span>
            </div>

            <div className="flex items-start justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">문법 형태</span>
              <span className="font-medium text-slate-200 text-right">
                {word.grammar}
              </span>
            </div>

            {word.breakdownNote && (
              <div className="pt-2">
                <span className="block text-slate-400 text-xs mb-1">어원 및 묵상 해설</span>
                <p className="text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 leading-relaxed text-xs sm:text-sm">
                  {word.breakdownNote}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => onToggleWordFavorite(word.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                isWordFavorited
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                  : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isWordFavorited ? 'fill-amber-400' : ''}`} />
              <span>{isWordFavorited ? '단어장에 보관됨' : '단어장에 보관'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
