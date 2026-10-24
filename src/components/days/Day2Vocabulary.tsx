import React, { useState } from 'react';
import { Volume2, CheckCircle2, RotateCw, ArrowLeft, ArrowRight, Bookmark } from 'lucide-react';
import { HebrewWord, TorahVerse } from '../../types/torah';
import { HebrewSpeechSynthesizer } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface Day2VocabularyProps {
  verse: TorahVerse;
  onComplete: () => void;
  isCompleted: boolean;
}

export const Day2Vocabulary: React.FC<Day2VocabularyProps> = ({
  verse,
  onComplete,
  isCompleted,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredWordIds, setMasteredWordIds] = useState<string[]>([]);

  const currentWord: HebrewWord = verse.words[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handlePronounce = (e: React.MouseEvent) => {
    e.stopPropagation();
    HebrewSpeechSynthesizer.speak(currentWord.hebrew, {
      rate: 0.8,
      phoneticFallback: currentWord.pronunciation,
    });
  };

  const markMastered = () => {
    if (!masteredWordIds.includes(currentWord.id)) {
      const nextList = [...masteredWordIds, currentWord.id];
      setMasteredWordIds(nextList);

      if (nextList.length === verse.words.length && !isCompleted) {
        HebrewSpeechSynthesizer.playSuccessFanfare();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
        onComplete();
      }
    }

    goToNext();
  };

  const goToNext = () => {
    setIsFlipped(false);
    if (currentIndex < verse.words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const goToPrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(verse.words.length - 1);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-xs font-mono text-amber-400 font-semibold tracking-wider">
            DAY 2 훈련
          </span>
          <h3 className="text-lg font-bold text-slate-100">
            단어 & 어근(Shoresh) 플래시카드
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            카드를 클릭하여 뒤집으며 단어의 뜻과 3자음 어근, 문법 형태를 암기하세요.
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">단어 마스터:</span>
          <span className="font-mono font-bold text-amber-400 tabular-nums">
            {masteredWordIds.length} / {verse.words.length}개
          </span>
        </div>
      </div>

      {/* Flashcard Area */}
      <div className="max-w-xl mx-auto space-y-4">
        <div
          onClick={handleFlip}
          className="relative min-h-[300px] w-full cursor-pointer select-none rounded-2xl border border-amber-700/40 bg-gradient-to-b from-slate-900 to-slate-950 p-8 shadow-xl transition-all duration-300 hover:border-amber-500/60 flex flex-col justify-between"
        >
          {/* Card Top Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              단어 {currentIndex + 1} of {verse.words.length}
            </span>
            <div className="flex items-center gap-1 text-amber-400/80">
              <RotateCw className="w-3.5 h-3.5" />
              <span>클릭하여 {isFlipped ? '앞면 보기' : '해설 보기'}</span>
            </div>
          </div>

          {/* Card Content: Front vs Back */}
          {!isFlipped ? (
            <div className="my-auto text-center space-y-4 py-4">
              <div className="flex items-center justify-center gap-3">
                <span
                  dir="rtl"
                  className="text-5xl sm:text-6xl font-bold font-hebrew text-amber-200"
                >
                  {currentWord.hebrew}
                </span>
                <button
                  onClick={handlePronounce}
                  className="p-2.5 rounded-full bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-transform active:scale-95"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              <div className="text-amber-300/80 text-sm font-medium">
                [{currentWord.pronunciation}] · {currentWord.phoneticEn}
              </div>
            </div>
          ) : (
            <div className="my-auto space-y-3 py-2 text-left">
              <div className="text-center pb-2 border-b border-slate-800">
                <p className="text-2xl font-bold text-slate-100">
                  {currentWord.meaning}
                </p>
                <span className="text-xs text-amber-400 font-mono">
                  {currentWord.strongNumber}
                </span>
              </div>

              <div className="space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">3자음 어근:</span>
                  <span className="font-semibold text-amber-300 font-hebrew">
                    {currentWord.root}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">문법 형태:</span>
                  <span className="text-slate-200">{currentWord.grammar}</span>
                </div>
                {currentWord.breakdownNote && (
                  <p className="text-xs text-slate-400 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 mt-2">
                    {currentWord.breakdownNote}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Card Bottom status */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs">
            <span
              className={
                masteredWordIds.includes(currentWord.id)
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-500'
              }
            >
              {masteredWordIds.includes(currentWord.id) ? '✓ 암기 완료' : '미암기'}
            </span>
            <span className="text-slate-500">
              {verse.reference}
            </span>
          </div>
        </div>

        {/* Card Navigation & Mastery Controls */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={goToPrev}
            className="p-2.5 rounded-lg border border-slate-800 bg-slate-800/40 text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={goToNext}
              className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800/60 hover:bg-slate-700 rounded-lg transition-colors"
            >
              다음 단어
            </button>
            <button
              onClick={markMastered}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>암기 완료 (+1)</span>
            </button>
          </div>

          <button
            onClick={goToNext}
            className="p-2.5 rounded-lg border border-slate-800 bg-slate-800/40 text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isCompleted && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>2일차 모든 단어와 어근 암기를 완수했습니다!</span>
          </div>
          <span className="text-xs text-emerald-400 font-mono">Mastered</span>
        </div>
      )}
    </div>
  );
};
