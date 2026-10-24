import React, { useState } from 'react';
import { Volume2, RotateCcw, Bookmark, BookOpen, Sparkles, Check, Copy, Loader2 } from 'lucide-react';
import { TorahPortion, HebrewWord } from '../types/torah';
import { HebrewSpeechSynthesizer } from '../utils/audio';

interface PortionHeroProps {
  portion: TorahPortion;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenSelector: () => void;
  onWordClick: (word: HebrewWord) => void;
  showNiqqud: boolean;
  onToggleNiqqud: () => void;
  showKoreanPhonetics: boolean;
  onTogglePhonetics: () => void;
  activeDay: number;
  onStartDayTraining: (day: number) => void;
  recitationVoice?: string;
  onVoiceChange?: (voice: string) => void;
}

export const PortionHero: React.FC<PortionHeroProps> = ({
  portion,
  isFavorite,
  onToggleFavorite,
  onOpenSelector,
  onWordClick,
  showNiqqud,
  onToggleNiqqud,
  showKoreanPhonetics,
  onTogglePhonetics,
  activeDay,
  onStartDayTraining,
  recitationVoice = 'Fenrir',
  onVoiceChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [repeatCount, setRepeatCount] = useState<number>(1);
  const [isCopied, setIsCopied] = useState(false);

  const handlePlayRecitation = () => {
    if (isPlaying || isLoadingAudio) {
      HebrewSpeechSynthesizer.stop();
      setIsPlaying(false);
      setIsLoadingAudio(false);
      return;
    }

    setIsLoadingAudio(true);
    let currentIteration = 0;

    const playNext = () => {
      currentIteration++;
      HebrewSpeechSynthesizer.speak(portion.memoryVerse.hebrewWithNiqqud, {
        rate: playbackSpeed,
        voice: recitationVoice,
        phoneticFallback: portion.memoryVerse.koreanPronunciation,
        onStart: () => {
          setIsLoadingAudio(false);
          setIsPlaying(true);
        },
        onEnd: () => {
          if (currentIteration < repeatCount) {
            setTimeout(playNext, 600);
          } else {
            setIsPlaying(false);
            setIsLoadingAudio(false);
          }
        },
        onError: () => {
          setIsPlaying(false);
          setIsLoadingAudio(false);
        },
      });
    };

    playNext();
  };

  const handleCopyVerse = () => {
    const textToCopy = `${portion.memoryVerse.reference}\n${portion.memoryVerse.hebrewWithNiqqud}\n(${portion.memoryVerse.koreanPronunciation})\n${portion.memoryVerse.koreanTranslation}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-amber-900/30 bg-slate-900 shadow-2xl">
      {/* Background Graphic with Measured Scrim */}
      <div className="absolute inset-0 z-0 opacity-25 mix-blend-luminosity">
        <img
          src="/src/assets/images/torah_scroll_parchment_1792805401689.jpg"
          alt="Torah Scroll"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
      </div>

      <div className="relative z-10 p-6 md:p-10 space-y-8">
        {/* Top Metadata Line - Unboxed typography */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-amber-300/80">
            <span className="font-semibold text-amber-200">
              {portion.bookKorean} 제{portion.portionNumber}주차
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{portion.torahReference}</span>
            {portion.haftarahReference && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>하프타라: {portion.haftarahReference}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleFavorite}
              title={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
              className={`p-2 rounded-lg border transition-colors ${
                isFavorite
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                  : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={onOpenSelector}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>포션 변경</span>
            </button>
          </div>
        </div>

        {/* Portion Title Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-amber-100 font-display">
                {portion.nameKorean}
              </h1>
              <span className="text-2xl sm:text-3xl font-hebrew text-amber-400/90 dir-rtl">
                {portion.nameHebrew}
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              {portion.themeSummary}
            </p>
          </div>

          {/* Controls Bar for Audio & Text toggles */}
          <div className="lg:col-span-4 flex flex-col gap-3 justify-end items-start lg:items-end">
            <div className="flex items-center gap-2 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
              <button
                onClick={onToggleNiqqud}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  showNiqqud
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                모음(니쿠드) {showNiqqud ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={onTogglePhonetics}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  showKoreanPhonetics
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                한글발음 {showKoreanPhonetics ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>음성:</span>
              <select
                value={recitationVoice}
                onChange={(e) => onVoiceChange?.(e.target.value)}
                className="bg-slate-900 text-amber-300 border border-slate-700 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="Fenrir">펜리르 (장엄 제사장 음성)</option>
                <option value="Zephyr">제피르 (차분 경건 음성)</option>
                <option value="Kore">코레 (선명 맑은 여성 음성)</option>
                <option value="Charon">카론 (중후 고대 독송)</option>
              </select>

              <span className="ml-1">속도:</span>
              <button
                onClick={() => setPlaybackSpeed(0.75)}
                className={`px-2 py-0.5 rounded ${playbackSpeed === 0.75 ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30' : 'hover:text-slate-200'}`}
              >
                0.75x
              </button>
              <button
                onClick={() => setPlaybackSpeed(1.0)}
                className={`px-2 py-0.5 rounded ${playbackSpeed === 1.0 ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30' : 'hover:text-slate-200'}`}
              >
                1.0x
              </button>
              <button
                onClick={() => setPlaybackSpeed(1.25)}
                className={`px-2 py-0.5 rounded ${playbackSpeed === 1.25 ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30' : 'hover:text-slate-200'}`}
              >
                1.25x
              </button>

              <span className="ml-1">반복:</span>
              <button
                onClick={() => setRepeatCount(repeatCount === 1 ? 3 : repeatCount === 3 ? 5 : 1)}
                className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 hover:bg-slate-700"
              >
                {repeatCount}회
              </button>
            </div>
          </div>
        </div>

        {/* Central Memory Scripture Scrollboard */}
        <div className="rounded-xl border border-amber-700/40 bg-gradient-to-b from-amber-950/20 to-slate-950/80 p-6 md:p-8 backdrop-blur-sm space-y-6">
          <div className="flex items-center justify-between border-b border-amber-800/30 pb-3">
            <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-amber-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>핵심 암송 원어 구절 · {portion.memoryVerse.reference}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyVerse}
                className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors px-2 py-1 rounded bg-slate-900/60 border border-slate-800"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? '복사됨' : '구절 복사'}</span>
              </button>

              <button
                onClick={handlePlayRecitation}
                disabled={isLoadingAudio}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isPlaying
                    ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-900/30'
                    : isLoadingAudio
                    ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50 cursor-wait'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                }`}
              >
                {isLoadingAudio ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    <span>원어 음성 준비 중...</span>
                  </>
                ) : isPlaying ? (
                  <>
                    <Volume2 className="w-4 h-4 animate-bounce" />
                    <span>낭독 정지 ({repeatCount > 1 ? `${repeatCount}회 반복` : '재생 중'})</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>원어 낭독</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Hebrew Word-by-Word Interactive Display (RTL) */}
          <div
            dir="rtl"
            className="flex flex-wrap items-center justify-start gap-x-3 gap-y-4 py-2 font-hebrew text-2xl sm:text-3xl md:text-4xl leading-relaxed text-amber-100 select-none"
          >
            {portion.memoryVerse.words.map((word) => (
              <button
                key={word.id}
                onClick={() => onWordClick(word)}
                className="group relative cursor-pointer px-2 py-1 rounded-lg border border-transparent hover:border-amber-500/40 hover:bg-amber-500/10 transition-all text-right"
              >
                <span className="block font-medium">
                  {showNiqqud ? word.hebrew : word.hebrewPlain}
                </span>

                {showKoreanPhonetics && (
                  <span
                    dir="ltr"
                    className="block text-xs font-normal text-amber-400/80 group-hover:text-amber-200 mt-1"
                  >
                    {word.pronunciation}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Korean & English Translation */}
          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <p className="text-base sm:text-lg font-medium text-slate-100 leading-snug">
              {portion.memoryVerse.koreanTranslation}
            </p>
            <p className="text-xs sm:text-sm text-slate-400 italic">
              {portion.memoryVerse.englishTranslation}
            </p>
          </div>
        </div>

        {/* Quick CTA to today's study step */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="text-amber-300 font-medium">오늘의 권장 코스:</span>
            <span>{activeDay}일차 훈련 단계 진행 중</span>
          </div>

          <button
            onClick={() => onStartDayTraining(activeDay)}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{activeDay}일차 훈련 바로가기</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};
