import React from 'react';
import { Award, Flame, Calendar, BookCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { TorahPortion, PortionProgress, UserStats } from '../types/torah';

interface StudyProgressSectionProps {
  portion: TorahPortion;
  progress: PortionProgress;
  userStats: UserStats;
}

export const StudyProgressSection: React.FC<StudyProgressSectionProps> = ({
  portion,
  progress,
  userStats,
}) => {
  const completedDaysCount = Object.values(progress.days).filter((d) => d.completed).length;
  const progressPercent = Math.round((completedDaysCount / 7) * 100);

  return (
    <section id="study-progress" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 font-display flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>암송 통계 & 토라포션 묵상 포인트</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            지속적인 말씀 암송 여정과 이번 주 토라포션의 핵심 영적 통찰
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Progress Metrics (4 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Streak Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>연속 암송</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-100 font-mono tabular-nums">
                {userStats.streakDays}
                <span className="text-sm font-sans text-slate-400 font-normal ml-1">일째</span>
              </p>
              <p className="text-[11px] text-slate-500">매일 말씀과 동행 중</p>
            </div>

            {/* Mastered Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <BookCheck className="w-4 h-4 text-emerald-400" />
                <span>완송한 포션</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-100 font-mono tabular-nums">
                {userStats.masteredPortionsCount}
                <span className="text-sm font-sans text-slate-400 font-normal ml-1">개</span>
              </p>
              <p className="text-[11px] text-slate-500">샤밧 최종 완송 기준</p>
            </div>
          </div>

          {/* Current Portion Weekly Completion Bar */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">
                현재 포션 주간 진도
              </span>
              <span className="text-amber-400 font-mono font-bold">
                {progressPercent}% ({completedDaysCount} / 7일)
              </span>
            </div>

            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>DAY 1: 낭독</span>
              <span>DAY 4: 어순</span>
              <span>DAY 7: 샤밧</span>
            </div>
          </div>
        </div>

        {/* Right Column: Key Theological Insights (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-amber-900/30 bg-slate-900/70 p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{portion.nameKorean}의 핵심 영적 통찰과 복음적 조명</span>
          </div>

          <div className="space-y-3">
            {portion.keyInsights.map((insight, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 font-mono font-bold text-xs mt-0.5">
                  {idx + 1}
                </span>
                <p>{insight}</p>
              </div>
            ))}
          </div>

          {portion.britChadashah && (
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="text-amber-400/90 font-medium">신약(브릿 하다샤) 연계 말씀:</span>
              <span className="text-slate-300 font-mono">{portion.britChadashah}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
