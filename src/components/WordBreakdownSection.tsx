import React from 'react';
import { Volume2, Layers, Bookmark, ArrowUpRight } from 'lucide-react';
import { HebrewWord, TorahVerse } from '../types/torah';
import { HebrewSpeechSynthesizer } from '../utils/audio';

interface WordBreakdownSectionProps {
  verse: TorahVerse;
  onSelectWord: (word: HebrewWord) => void;
  favoritedWordIds: string[];
  onToggleFavoriteWord: (wordId: string) => void;
}

export const WordBreakdownSection: React.FC<WordBreakdownSectionProps> = ({
  verse,
  onSelectWord,
  favoritedWordIds,
  onToggleFavoriteWord,
}) => {
  const handlePronounce = (word: HebrewWord, e: React.MouseEvent) => {
    e.stopPropagation();
    HebrewSpeechSynthesizer.speak(word.hebrew, {
      rate: 0.8,
      phoneticFallback: word.pronunciation,
    });
  };

  return (
    <section id="word-breakdown" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 font-display flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <span>히브리어 원어 단어별 정밀 분해 (Morphology)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {verse.reference} 구절을 구성하는 단어들의 3자음 어근(Shoresh)과 스트롱 사전 번호, 문법 형태
          </p>
        </div>
        <span className="text-xs text-amber-400 font-mono">
          총 {verse.words.length}개 원어 단어
        </span>
      </div>

      {/* Desktop / Tablet Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {verse.words.map((word, index) => {
          const isFavorited = favoritedWordIds.includes(word.id);

          return (
            <div
              key={word.id}
              onClick={() => onSelectWord(word)}
              className="group relative cursor-pointer rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 hover:border-amber-500/40 hover:bg-slate-850 transition-all flex flex-col justify-between space-y-3"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                <span className="text-xs font-mono font-semibold text-slate-500">
                  #{index + 1}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-medium text-emerald-400">
                    {word.strongNumber}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavoriteWord(word.id);
                    }}
                    title={isFavorited ? '보관됨' : '단어장 보관'}
                    className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                      isFavorited ? 'text-amber-400' : 'text-slate-500'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isFavorited ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Hebrew Word & Audio Button */}
              <div className="flex items-center justify-between gap-3">
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-100 group-hover:text-amber-200 transition-colors">
                    {word.meaning}
                  </p>
                  <p className="text-xs text-amber-300/80 font-medium mt-0.5">
                    [{word.pronunciation}] · {word.phoneticEn}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    dir="rtl"
                    className="font-hebrew text-2xl font-bold text-amber-200"
                  >
                    {word.hebrew}
                  </span>
                  <button
                    onClick={(e) => handlePronounce(word, e)}
                    title="원어 발음 듣기"
                    className="p-1.5 rounded-full bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Morphology Details */}
              <div className="pt-2 border-t border-slate-800/60 text-xs space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>어근 (Shoresh):</span>
                  <span className="font-hebrew text-amber-300 font-semibold">
                    {word.root}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>문법 분류:</span>
                  <span className="text-slate-300 text-right truncate max-w-[170px]">
                    {word.grammar}
                  </span>
                </div>
              </div>

              {/* Click to inspect prompt */}
              <div className="flex items-center justify-end text-[11px] text-slate-500 group-hover:text-amber-400 transition-colors">
                <span>상세 해설 보기</span>
                <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
