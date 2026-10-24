import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { HebrewWord, TorahVerse } from '../../types/torah';
import { HebrewSpeechSynthesizer } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface Day5RecallProps {
  verse: TorahVerse;
  onComplete: () => void;
  isCompleted: boolean;
}

export const Day5Recall: React.FC<Day5RecallProps> = ({
  verse,
  onComplete,
  isCompleted,
}) => {
  const [revealedWordIds, setRevealedWordIds] = useState<string[]>([]);

  const toggleRevealWord = (word: HebrewWord) => {
    if (revealedWordIds.includes(word.id)) {
      setRevealedWordIds((prev) => prev.filter((id) => id !== word.id));
    } else {
      setRevealedWordIds((prev) => [...prev, word.id]);
      HebrewSpeechSynthesizer.speak(word.hebrew, {
        rate: 1.0,
        phoneticFallback: word.pronunciation,
      });
    }
  };

  const revealAll = () => {
    setRevealedWordIds(verse.words.map((w) => w.id));
  };

  const hideAll = () => {
    setRevealedWordIds([]);
  };

  const handleSelfPass = () => {
    revealAll();
    HebrewSpeechSynthesizer.playSuccessFanfare();
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    onComplete();
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-xs font-mono text-amber-400 font-semibold tracking-wider">
            DAY 5 훈련
          </span>
          <h3 className="text-lg font-bold text-slate-100">
            가림판 연상 암송 (Conceal & Recall)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            한국어 번역을 보고 머릿속으로 히브리어 원어를 먼저 떠올린 뒤, 가림판을 하나씩 열어 일치 여부를 검증하세요.
          </p>
        </div>

        {/* Global Reveal / Hide toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={hideAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>모두 가리기</span>
          </button>
          <button
            onClick={revealAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 rounded-lg transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>모두 열기</span>
          </button>
        </div>
      </div>

      {/* Korean Prompt (Memory Anchor) */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-amber-950/20 via-slate-950 to-amber-950/20 border border-amber-800/30 text-center space-y-2">
        <span className="text-xs text-amber-400 font-semibold">
          {verse.reference} 번역 묵상 기준
        </span>
        <p className="text-lg sm:text-xl font-bold text-slate-100 leading-snug">
          "{verse.koreanTranslation}"
        </p>
        <p className="text-xs text-slate-400 italic">
          {verse.koreanPronunciation}
        </p>
      </div>

      {/* Interactive Curtain Grid (RTL) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>히브리어 구절 (가림판을 탭하여 정답 확인):</span>
          <span className="text-amber-400 font-mono tabular-nums">
            {revealedWordIds.length} / {verse.words.length} 열림
          </span>
        </div>

        <div
          dir="rtl"
          className="flex flex-wrap items-center justify-center gap-3 p-6 rounded-xl bg-slate-950 border border-slate-800/80 min-h-[160px]"
        >
          {verse.words.map((word, idx) => {
            const isRevealed = revealedWordIds.includes(word.id);

            return (
              <button
                key={word.id}
                onClick={() => toggleRevealWord(word)}
                className={`relative px-4 py-3 rounded-xl border transition-all text-center cursor-pointer select-none ${
                  isRevealed
                    ? 'border-amber-400/60 bg-amber-500/15 text-amber-100 shadow-md'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-800/80 text-slate-400'
                }`}
              >
                {isRevealed ? (
                  <>
                    <span className="block font-hebrew text-3xl font-bold">
                      {word.hebrew}
                    </span>
                    <span
                      dir="ltr"
                      className="block text-xs text-amber-300/80 mt-1 font-sans"
                    >
                      {word.pronunciation}
                    </span>
                    <span
                      dir="ltr"
                      className="block text-[11px] text-slate-400 font-sans"
                    >
                      {word.meaning}
                    </span>
                  </>
                ) : (
                  <div className="py-2 px-3 text-center">
                    <EyeOff className="w-5 h-5 mx-auto text-amber-500/60 mb-1" />
                    <span
                      dir="ltr"
                      className="block text-xs font-sans text-slate-400"
                    >
                      #{idx + 1} [{word.meaning}]
                    </span>
                    <span
                      dir="ltr"
                      className="block text-[10px] text-slate-500 font-sans"
                    >
                      터치하여 확인
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Completion CTA */}
      <div className="pt-2 flex flex-col items-center gap-3">
        <button
          onClick={handleSelfPass}
          className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>자신 있게 모두 연상 성공! (5일차 완료)</span>
        </button>
      </div>

      {isCompleted && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>5일차 가림판 연상 암송을 멋지게 통과했습니다!</span>
          </div>
          <span className="text-xs text-emerald-400 font-mono">Mastered</span>
        </div>
      )}
    </div>
  );
};
