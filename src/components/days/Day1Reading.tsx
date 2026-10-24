import React, { useState } from 'react';
import { Volume2, CheckCircle, RotateCcw, Sparkles } from 'lucide-react';
import { TorahVerse } from '../../types/torah';
import { HebrewSpeechSynthesizer } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface Day1ReadingProps {
  verse: TorahVerse;
  onComplete: () => void;
  isCompleted: boolean;
}

export const Day1Reading: React.FC<Day1ReadingProps> = ({
  verse,
  onComplete,
  isCompleted,
}) => {
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [readCount, setReadCount] = useState<number>(0);
  const [targetCount] = useState<number>(5);
  const [isPlayingFull, setIsPlayingFull] = useState(false);

  const handlePlayWord = (index: number) => {
    setActiveWordIndex(index);
    const word = verse.words[index];
    HebrewSpeechSynthesizer.speak(word.hebrew, {
      rate: 0.8,
      phoneticFallback: word.pronunciation,
      onEnd: () => setActiveWordIndex(null),
      onError: () => setActiveWordIndex(null),
    });
  };

  const handlePlayFullVerse = () => {
    setIsPlayingFull(true);
    HebrewSpeechSynthesizer.speak(verse.hebrewWithNiqqud, {
      rate: 0.8,
      phoneticFallback: verse.koreanPronunciation,
      onStart: () => setIsPlayingFull(true),
      onEnd: () => {
        setIsPlayingFull(false);
        incrementRead();
      },
      onError: () => setIsPlayingFull(false),
    });
  };

  const incrementRead = () => {
    const nextCount = readCount + 1;
    setReadCount(nextCount);
    if (nextCount >= targetCount && !isCompleted) {
      HebrewSpeechSynthesizer.playSuccessFanfare();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      onComplete();
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-xs font-mono text-amber-400 font-semibold tracking-wider">
            DAY 1 훈련
          </span>
          <h3 className="text-lg font-bold text-slate-100">
            원어 낭독 & 음절 발음 훈련
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            단어를 클릭하여 개별 발음을 듣고, 성경 전체 문장을 최소 5회 소리 내어 낭독하세요.
          </p>
        </div>

        {/* Read Count Target Tracker */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="block text-xs text-slate-400">낭독 목표</span>
            <span className="font-mono text-base font-bold text-amber-400 tabular-nums">
              {readCount} / {targetCount}회
            </span>
          </div>

          <button
            onClick={incrementRead}
            className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
          >
            +1회 낭독 완료
          </button>
        </div>
      </div>

      {/* Main Interactive Verse Block with Syllables */}
      <div className="rounded-xl border border-amber-900/40 bg-slate-950 p-6 md:p-8 space-y-6 text-center">
        <div
          dir="rtl"
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-6 font-hebrew text-3xl sm:text-4xl text-amber-100"
        >
          {verse.words.map((word, idx) => {
            const isWordActive = activeWordIndex === idx;
            return (
              <button
                key={word.id}
                onClick={() => handlePlayWord(idx)}
                className={`relative px-3 py-2 rounded-xl border transition-all text-center group cursor-pointer ${
                  isWordActive
                    ? 'border-amber-400 bg-amber-400/20 scale-105 shadow-md'
                    : 'border-slate-800 bg-slate-900/40 hover:border-amber-500/40 hover:bg-amber-500/10'
                }`}
              >
                <span className="block">{word.hebrew}</span>
                <span
                  dir="ltr"
                  className="block text-xs font-normal text-amber-300/80 group-hover:text-amber-200 mt-1 font-sans"
                >
                  {word.pronunciation}
                </span>
                <span
                  dir="ltr"
                  className="block text-[11px] text-slate-400 group-hover:text-slate-300 font-sans"
                >
                  {word.meaning}
                </span>
              </button>
            );
          })}
        </div>

        {/* Full Verse Recitation Button */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handlePlayFullVerse}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              isPlayingFull
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isPlayingFull ? '낭독 중...' : '전체 구절 천천히 듣기'}</span>
          </button>
        </div>
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>1일차 원어 낭독 훈련을 성공적으로 마쳤습니다!</span>
          </div>
          <span className="text-xs text-emerald-400 font-mono">Completed</span>
        </div>
      )}
    </div>
  );
};
