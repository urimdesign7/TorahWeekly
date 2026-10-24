import React, { useState, useEffect } from 'react';
import { CheckCircle2, RotateCcw, HelpCircle, Check, X } from 'lucide-react';
import { HebrewWord, TorahVerse } from '../../types/torah';
import { HebrewSpeechSynthesizer } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface Day3ClozeProps {
  verse: TorahVerse;
  onComplete: () => void;
  isCompleted: boolean;
}

type DifficultyLevel = 1 | 2 | 3 | 4;

export const Day3Cloze: React.FC<Day3ClozeProps> = ({
  verse,
  onComplete,
  isCompleted,
}) => {
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const [blankIndices, setBlankIndices] = useState<number[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number | null>(null);

  // Generate blank indices based on difficulty level
  useEffect(() => {
    resetChallenge(level);
  }, [level, verse]);

  const resetChallenge = (currentLevel: DifficultyLevel) => {
    const totalWords = verse.words.length;
    let numBlanks = 1;
    if (currentLevel === 1) {
      numBlanks = Math.max(1, Math.round(totalWords * 0.25));
    } else if (currentLevel === 2) {
      numBlanks = Math.max(2, Math.round(totalWords * 0.5));
    } else if (currentLevel === 3) {
      numBlanks = Math.max(3, Math.round(totalWords * 0.75));
    } else {
      numBlanks = totalWords; // 100%
    }

    // Pick spaced indices
    const indices: number[] = [];
    const step = totalWords / numBlanks;
    for (let i = 0; i < numBlanks; i++) {
      const idx = Math.min(totalWords - 1, Math.floor(i * step + (currentLevel % 2)));
      if (!indices.includes(idx)) {
        indices.push(idx);
      }
    }
    // ensure at least 1 index
    if (indices.length === 0 && totalWords > 0) {
      indices.push(0);
    }

    setBlankIndices(indices);
    setUserAnswers({});
    setIsSubmitted(false);
    setScore(null);
    setShowHint(false);
  };

  const selectOption = (blankIndex: number, selectedWord: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [blankIndex]: selectedWord,
    }));
  };

  const handleCheck = () => {
    let correct = 0;
    blankIndices.forEach((idx) => {
      const target = verse.words[idx];
      const answer = userAnswers[idx];
      if (answer === target.hebrew || answer === target.hebrewPlain) {
        correct++;
      }
    });

    const calculatedScore = Math.round((correct / blankIndices.length) * 100);
    setScore(calculatedScore);
    setIsSubmitted(true);

    if (calculatedScore >= 80) {
      HebrewSpeechSynthesizer.playSuccessFanfare();
      if (!isCompleted) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
        onComplete();
      }
    } else {
      HebrewSpeechSynthesizer.playFallbackChime();
    }
  };

  // Missing options pool for blanks (shuffled)
  const availableOptions: HebrewWord[] = React.useMemo(() => {
    const options = blankIndices.map((idx) => verse.words[idx]);
    return [...options].sort(() => Math.random() - 0.5);
  }, [blankIndices, verse]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-xs font-mono text-amber-400 font-semibold tracking-wider">
            DAY 3 훈련
          </span>
          <h3 className="text-lg font-bold text-slate-100">
            점진적 빈칸 채우기 훈련 (Cloze Test)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            점차 빈칸이 늘어나는 4단계 난이도에 도전하여 원문을 정확하게 인출하세요.
          </p>
        </div>

        {/* Level Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          {([1, 2, 3, 4] as DifficultyLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                level === lvl
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              레벨 {lvl} ({lvl === 1 ? '25%' : lvl === 2 ? '50%' : lvl === 3 ? '75%' : '100%'})
            </button>
          ))}
        </div>
      </div>

      {/* Main Hebrew Verse with Blanks */}
      <div className="rounded-xl border border-amber-900/40 bg-slate-950 p-6 md:p-8 space-y-6 text-center">
        <div
          dir="rtl"
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-5 font-hebrew text-2xl sm:text-3xl text-amber-100"
        >
          {verse.words.map((word, idx) => {
            const isBlank = blankIndices.includes(idx);
            const userAnswer = userAnswers[idx];
            const isCorrect = userAnswer === word.hebrew || userAnswer === word.hebrewPlain;

            if (!isBlank) {
              return (
                <span key={word.id} className="px-2 py-1">
                  {word.hebrew}
                </span>
              );
            }

            return (
              <div key={word.id} className="inline-flex flex-col items-center">
                <span
                  className={`min-w-[100px] sm:min-w-[120px] px-3 py-1.5 rounded-lg border text-center transition-all ${
                    isSubmitted
                      ? isCorrect
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-rose-500 bg-rose-500/20 text-rose-300'
                      : userAnswer
                      ? 'border-amber-400 bg-amber-400/10 text-amber-200'
                      : 'border-dashed border-amber-500/40 bg-slate-900/60 text-slate-500'
                  }`}
                >
                  {userAnswer ? (
                    userAnswer
                  ) : (
                    <span className="text-xs font-sans text-slate-500">
                      [{word.meaning}]
                    </span>
                  )}
                </span>

                {isSubmitted && !isCorrect && (
                  <span className="text-xs text-emerald-400 font-sans mt-1">
                    정답: {word.hebrew}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Word Options Selection Bank */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>빈칸에 들어갈 단어 조각을 클릭하여 채우세요:</span>
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHint ? '힌트 닫기' : '의미 힌트 보기'}</span>
            </button>
          </div>

          <div
            dir="rtl"
            className="flex flex-wrap items-center justify-center gap-2.5 font-hebrew text-xl"
          >
            {verse.words.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  // Find the first unfilled blank
                  const firstEmptyBlank = blankIndices.find((idx) => !userAnswers[idx]);
                  if (firstEmptyBlank !== undefined) {
                    selectOption(firstEmptyBlank, w.hebrew);
                  }
                }}
                className="px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-800/80 hover:border-amber-400/80 hover:bg-slate-700 text-amber-200 transition-all text-center group cursor-pointer"
              >
                <span>{w.hebrew}</span>
                {showHint && (
                  <span
                    dir="ltr"
                    className="block text-[11px] font-sans text-slate-400 group-hover:text-amber-300"
                  >
                    {w.meaning}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Evaluation and Action Controls */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => resetChallenge(level)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>다시 시도</span>
          </button>

          <button
            onClick={handleCheck}
            disabled={Object.keys(userAnswers).length === 0}
            className="px-6 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
          >
            정답 확인하기
          </button>
        </div>

        {/* Score Display */}
        {score !== null && (
          <div
            className={`p-4 rounded-xl border text-center ${
              score >= 80
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
            }`}
          >
            <p className="text-base font-bold">
              {score >= 80 ? '훌륭합니다! 정답률 ' : '조금만 더 힘내세요! 정답률 '}
              <span className="font-mono">{score}%</span>
            </p>
            <p className="text-xs text-slate-300 mt-1">
              {score >= 80
                ? '다음 난이도에 도전하거나 다음 날짜 훈련으로 넘어가세요.'
                : '틀린 단어를 확인하고 다시 한번 시도해보세요.'}
            </p>
          </div>
        )}
      </div>

      {isCompleted && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>3일차 빈칸 채우기 훈련 통과 완료!</span>
          </div>
          <span className="text-xs text-emerald-400 font-mono">Passed</span>
        </div>
      )}
    </div>
  );
};
