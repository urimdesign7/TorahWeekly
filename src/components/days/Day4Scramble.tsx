import React, { useState, useEffect } from 'react';
import { Shuffle, RotateCcw, CheckCircle2, ArrowRight } from 'lucide-react';
import { HebrewWord, TorahVerse } from '../../types/torah';
import { HebrewSpeechSynthesizer } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface Day4ScrambleProps {
  verse: TorahVerse;
  onComplete: () => void;
  isCompleted: boolean;
}

export const Day4Scramble: React.FC<Day4ScrambleProps> = ({
  verse,
  onComplete,
  isCompleted,
}) => {
  const [availableWords, setAvailableWords] = useState<HebrewWord[]>([]);
  const [placedWords, setPlacedWords] = useState<HebrewWord[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({
    type: null,
    text: '',
  });

  useEffect(() => {
    resetScramble();
  }, [verse]);

  const resetScramble = () => {
    const shuffled = [...verse.words].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    setPlacedWords([]);
    setStatusMessage({ type: null, text: '' });
  };

  const handlePlaceWord = (word: HebrewWord) => {
    setAvailableWords((prev) => prev.filter((w) => w.id !== word.id));
    setPlacedWords((prev) => [...prev, word]);
    setStatusMessage({ type: null, text: '' });
    HebrewSpeechSynthesizer.playChime(350, 'sine', 0.15);
  };

  const handleRemoveWord = (word: HebrewWord) => {
    setPlacedWords((prev) => prev.filter((w) => w.id !== word.id));
    setAvailableWords((prev) => [...prev, word]);
    setStatusMessage({ type: null, text: '' });
  };

  const checkOrder = () => {
    if (placedWords.length !== verse.words.length) {
      setStatusMessage({
        type: 'error',
        text: `아직 ${verse.words.length - placedWords.length}개의 단어가 남아 있습니다.`,
      });
      return;
    }

    const isCorrect = placedWords.every(
      (word, idx) => word.id === verse.words[idx].id
    );

    if (isCorrect) {
      HebrewSpeechSynthesizer.playSuccessFanfare();
      setStatusMessage({
        type: 'success',
        text: '정답입니다! 히브리어 원문의 어순(오른쪽→왼쪽)을 완벽하게 맞추셨습니다.',
      });
      if (!isCompleted) {
        confetti({ particleCount: 75, spread: 70, origin: { y: 0.7 } });
        onComplete();
      }
    } else {
      HebrewSpeechSynthesizer.playFallbackChime();
      setStatusMessage({
        type: 'error',
        text: '어순이 일치하지 않는 단어가 있습니다. 순서를 다시 확인해보세요.',
      });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-xs font-mono text-amber-400 font-semibold tracking-wider">
            DAY 4 훈련
          </span>
          <h3 className="text-lg font-bold text-slate-100">
            히브리어 어순 조립 퍼즐 (RTL Reorder)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            오른쪽에서 왼쪽(RTL)으로 읽는 성경 어순에 맞게 단어 조각을 클릭하여 올바른 순서대로 배열하세요.
          </p>
        </div>

        <button
          onClick={resetScramble}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>단어 섞기</span>
        </button>
      </div>

      {/* Scripture Reference & Meaning Reminder */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs sm:text-sm text-slate-300 space-y-1">
        <span className="text-amber-400 font-semibold">{verse.reference}</span>
        <p className="font-medium text-slate-100">{verse.koreanTranslation}</p>
      </div>

      {/* Target Placement Area (Right-to-Left) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>배열된 문장 영역 (우측부터 채워집니다):</span>
          <span className="text-amber-400 font-mono tabular-nums">
            {placedWords.length} / {verse.words.length} 단어
          </span>
        </div>

        <div
          dir="rtl"
          className="min-h-[110px] rounded-xl border-2 border-dashed border-amber-600/40 bg-slate-950/90 p-4 flex flex-wrap items-center justify-start gap-3 font-hebrew text-2xl text-amber-100"
        >
          {placedWords.length === 0 ? (
            <div
              dir="ltr"
              className="w-full text-center text-slate-500 text-xs font-sans py-4"
            >
              아래 단어 보관함에서 첫 단어부터 순서대로 클릭하세요 (오른쪽→왼쪽)
            </div>
          ) : (
            placedWords.map((word, idx) => (
              <button
                key={word.id}
                onClick={() => handleRemoveWord(word)}
                title="클릭하여 되돌리기"
                className="group px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-200 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-300 transition-all text-center cursor-pointer"
              >
                <span>{word.hebrew}</span>
                <span
                  dir="ltr"
                  className="block text-[11px] font-sans text-amber-400/80 group-hover:text-rose-300"
                >
                  #{idx + 1}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Available Word Pool (Click to place) */}
      <div className="space-y-2 pt-2">
        <span className="text-xs text-slate-400 px-1">선택 가능한 단어 조각:</span>
        <div
          dir="rtl"
          className="flex flex-wrap items-center justify-center gap-2.5 p-4 rounded-xl bg-slate-950 border border-slate-800 font-hebrew text-2xl"
        >
          {availableWords.length === 0 ? (
            <div
              dir="ltr"
              className="text-xs font-sans text-slate-500 py-2"
            >
              모든 단어가 문장 영역에 배치되었습니다. [어순 확인하기]를 누르세요.
            </div>
          ) : (
            availableWords.map((word) => (
              <button
                key={word.id}
                onClick={() => handlePlaceWord(word)}
                className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800/90 hover:border-amber-400 hover:bg-slate-700 text-amber-100 transition-all cursor-pointer shadow-sm active:scale-95 text-center group"
              >
                <span>{word.hebrew}</span>
                <span
                  dir="ltr"
                  className="block text-[11px] font-sans text-slate-400 group-hover:text-amber-300"
                >
                  {word.meaning}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Action and Feedback */}
      <div className="pt-2 flex flex-col items-center gap-3">
        <button
          onClick={checkOrder}
          disabled={placedWords.length === 0}
          className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-md transition-all"
        >
          어순 검증하기
        </button>

        {statusMessage.type && (
          <div
            className={`w-full p-3.5 rounded-xl text-center text-xs sm:text-sm font-semibold border ${
              statusMessage.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
            }`}
          >
            {statusMessage.text}
          </div>
        )}
      </div>

      {isCompleted && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>4일차 히브리어 어순 조립 훈련 완료!</span>
          </div>
          <span className="text-xs text-emerald-400 font-mono">Completed</span>
        </div>
      )}
    </div>
  );
};
