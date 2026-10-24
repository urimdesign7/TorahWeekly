import React, { useState } from 'react';
import { Volume2, CheckCircle2, RotateCcw, Delete, ArrowRight } from 'lucide-react';
import { HebrewWord, TorahVerse } from '../../types/torah';
import { HebrewSpeechSynthesizer } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface Day6DictationProps {
  verse: TorahVerse;
  onComplete: () => void;
  isCompleted: boolean;
}

// Hebrew Alef-Bet characters for virtual keypad
const HEBREW_KEYS = [
  'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י',
  'כ', 'ך', 'ל', 'מ', 'ם', 'נ', 'ן', 'ס', 'ע', 'פ',
  'ף', 'צ', 'ץ', 'ק', 'ר', 'ש', 'ת'
];

export const Day6Dictation: React.FC<Day6DictationProps> = ({
  verse,
  onComplete,
  isCompleted,
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedInput, setTypedInput] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [completedWordIndices, setCompletedWordIndices] = useState<number[]>([]);

  const targetWord = verse.words[currentWordIndex];

  const handlePlayTargetWord = () => {
    HebrewSpeechSynthesizer.speak(targetWord.hebrew, {
      rate: 0.8,
      phoneticFallback: targetWord.pronunciation,
    });
  };

  const handleKeyPress = (char: string) => {
    setTypedInput((prev) => prev + char);
    setFeedback(null);
  };

  const handleDelete = () => {
    setTypedInput((prev) => prev.slice(0, -1));
    setFeedback(null);
  };

  const checkAnswer = () => {
    const cleanInput = typedInput.trim().replace(/[\u0591-\u05C7]/g, ''); // strip niqqud for comparison if any
    const cleanTarget = targetWord.hebrewPlain.trim().replace(/[\u0591-\u05C7׃]/g, '');

    if (cleanInput === cleanTarget) {
      HebrewSpeechSynthesizer.playChime(523, 'triangle', 0.25);
      setFeedback({ isCorrect: true, message: '정답입니다!' });

      if (!completedWordIndices.includes(currentWordIndex)) {
        const nextCompleted = [...completedWordIndices, currentWordIndex];
        setCompletedWordIndices(nextCompleted);

        if (nextCompleted.length === verse.words.length && !isCompleted) {
          HebrewSpeechSynthesizer.playSuccessFanfare();
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
          onComplete();
        }
      }

      // Auto advance to next word after brief delay
      setTimeout(() => {
        if (currentWordIndex < verse.words.length - 1) {
          setCurrentWordIndex(currentWordIndex + 1);
          setTypedInput('');
          setFeedback(null);
        }
      }, 700);
    } else {
      HebrewSpeechSynthesizer.playFallbackChime();
      setFeedback({
        isCorrect: false,
        message: `철자가 다릅니다. 정답 자음: ${cleanTarget}`,
      });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-xs font-mono text-amber-400 font-semibold tracking-wider">
            DAY 6 훈련
          </span>
          <h3 className="text-lg font-bold text-slate-100">
            히브리어 철자 받아쓰기 (Dictation)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            발음과 의미 힌트를 듣고 가상 히브리어 자판 또는 키보드로 올바른 자음을 타이핑하세요.
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">받아쓰기 완료:</span>
          <span className="font-mono font-bold text-amber-400 tabular-nums">
            {completedWordIndices.length} / {verse.words.length} 단어
          </span>
        </div>
      </div>

      {/* Target Word Prompt Box */}
      <div className="max-w-xl mx-auto space-y-6">
        <div className="rounded-xl border border-amber-800/40 bg-slate-950 p-6 text-center space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
            <span>
              단어 #{currentWordIndex + 1} of {verse.words.length}
            </span>
            <span className="text-amber-400 font-mono">{targetWord.strongNumber}</span>
          </div>

          <div className="space-y-2">
            <p className="text-xl sm:text-2xl font-bold text-slate-100">
              "{targetWord.meaning}"
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-amber-300 font-semibold text-sm">
                [{targetWord.pronunciation}]
              </span>
              <button
                onClick={handlePlayTargetWord}
                className="p-1.5 rounded-full bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">어근: {targetWord.root}</p>
          </div>

          {/* User Input Display Area */}
          <div className="pt-2">
            <div
              dir="rtl"
              className="w-full min-h-[64px] rounded-xl border border-amber-500/50 bg-slate-900/80 px-4 py-2 flex items-center justify-center font-hebrew text-4xl text-amber-200 tracking-wider shadow-inner"
            >
              {typedInput || <span className="text-slate-600 text-sm font-sans">히브리어 자판으로 입력하세요</span>}
            </div>

            {feedback && (
              <div
                className={`mt-2 text-xs font-semibold ${
                  feedback.isCorrect ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {feedback.message}
              </div>
            )}
          </div>

          {/* Verification & Control buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg"
            >
              <Delete className="w-4 h-4" />
              <span>지우기</span>
            </button>
            <button
              onClick={checkAnswer}
              className="px-6 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm"
            >
              입력 검증
            </button>
          </div>
        </div>

        {/* Hebrew Virtual Keypad */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
          <span className="block text-center text-xs text-slate-500">
            가상 히브리어 알레프-베트 자판 (클릭하여 입력)
          </span>

          <div
            dir="rtl"
            className="grid grid-cols-9 sm:grid-cols-10 gap-1.5 text-center font-hebrew text-xl"
          >
            {HEBREW_KEYS.map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className="py-2 rounded-lg border border-slate-800 bg-slate-900 hover:border-amber-400 hover:bg-slate-800 text-amber-100 transition-colors active:scale-95 cursor-pointer"
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Pagination between words */}
        <div className="flex items-center justify-between text-xs">
          <button
            onClick={() => {
              if (currentWordIndex > 0) {
                setCurrentWordIndex(currentWordIndex - 1);
                setTypedInput('');
                setFeedback(null);
              }
            }}
            disabled={currentWordIndex === 0}
            className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 disabled:opacity-40"
          >
            이전 단어
          </button>

          <button
            onClick={() => {
              if (currentWordIndex < verse.words.length - 1) {
                setCurrentWordIndex(currentWordIndex + 1);
                setTypedInput('');
                setFeedback(null);
              }
            }}
            disabled={currentWordIndex === verse.words.length - 1}
            className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 disabled:opacity-40"
          >
            다음 단어
          </button>
        </div>
      </div>

      {isCompleted && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>6일차 철자 받아쓰기 훈련 통과 완료!</span>
          </div>
          <span className="text-xs text-emerald-400 font-mono">Completed</span>
        </div>
      )}
    </div>
  );
};
