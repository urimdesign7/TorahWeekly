import React from 'react';
import { Volume2, Layers, FileText, Shuffle, EyeOff, Keyboard, Award, CheckCircle2 } from 'lucide-react';
import { DayIndex, PortionProgress } from '../types/torah';
import { DAYS_INFO } from '../data/torahPortions';

interface WeeklyScheduleNavProps {
  activeDay: DayIndex;
  onSelectDay: (day: DayIndex) => void;
  progress: PortionProgress;
}

const ICON_MAP = {
  Volume2,
  Layers,
  FileText,
  Shuffle,
  EyeOff,
  Keyboard,
  Award,
};

export const WeeklyScheduleNav: React.FC<WeeklyScheduleNavProps> = ({
  activeDay,
  onSelectDay,
  progress,
}) => {
  return (
    <div id="weekly-routine" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 font-display">
            한 주간 7일 암송 커리큘럼
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            청취에서 시작하여 어근 분석, 빈칸 인출, 어순 조립, 그리고 샤밧 완송까지 단계별 기억 시스템
          </p>
        </div>

        {/* Completion Progress Metric */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>
            주간 달성도:{' '}
            <strong className="text-amber-400 font-mono tabular-nums">
              {Object.values(progress.days).filter((d) => d.completed).length} / 7일
            </strong>
          </span>
          {progress.isMastered && (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>완송 달성</span>
            </span>
          )}
        </div>
      </div>

      {/* 7-Day Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {DAYS_INFO.map((item) => {
          const dayNum = item.day as DayIndex;
          const isActive = activeDay === dayNum;
          const isDone = progress.days[dayNum]?.completed;
          const IconComponent = ICON_MAP[item.icon as keyof typeof ICON_MAP] || Volume2;

          return (
            <button
              key={dayNum}
              onClick={() => onSelectDay(dayNum)}
              className={`relative flex flex-col items-start p-3.5 rounded-xl text-left border transition-all ${
                isActive
                  ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/5 ring-1 ring-amber-400/50'
                  : 'border-slate-800/80 bg-slate-900/60 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span
                  className={`text-xs font-mono font-bold ${
                    isActive ? 'text-amber-300' : 'text-slate-400'
                  }`}
                >
                  DAY {dayNum}
                </span>

                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <div
                    className={`p-1 rounded-md ${
                      isActive ? 'bg-amber-400/20 text-amber-300' : 'text-slate-500'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <span
                className={`text-xs sm:text-sm font-semibold leading-tight line-clamp-1 ${
                  isActive ? 'text-amber-100' : 'text-slate-300'
                }`}
              >
                {item.title.split(': ')[1]}
              </span>

              <span className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                {item.subtitle.split('&')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
