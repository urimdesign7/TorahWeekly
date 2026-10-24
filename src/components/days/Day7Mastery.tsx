import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Award, CheckCircle2, Volume2, Save, Sparkles, BookOpen } from 'lucide-react';
import { TorahPortion } from '../../types/torah';
import { HebrewSpeechSynthesizer, VoiceRecorder } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface Day7MasteryProps {
  portion: TorahPortion;
  onComplete: (notes: string, recordingUrl?: string) => void;
  isCompleted: boolean;
  savedNotes?: string;
  isPortionMastered: boolean;
}

export const Day7Mastery: React.FC<Day7MasteryProps> = ({
  portion,
  onComplete,
  isCompleted,
  savedNotes = '',
  isPortionMastered,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecord, setIsPlayingRecord] = useState(false);
  const [notes, setNotes] = useState(savedNotes);
  const [checklist, setChecklist] = useState({
    reading: false,
    roots: false,
    fullRecall: false,
  });

  const [micError, setMicError] = useState<string | null>(null);

  const recorderRef = useRef<VoiceRecorder>(new VoiceRecorder());
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const startRecord = async () => {
    setMicError(null);
    const success = await recorderRef.current.start();
    if (success) {
      setIsRecording(true);
      setRecordedAudioUrl(null);
    } else {
      setMicError('마이크 권한을 허용해주세요.');
    }
  };

  const stopRecord = async () => {
    if (!isRecording) return;
    try {
      const url = await recorderRef.current.stop();
      setIsRecording(false);
      setRecordedAudioUrl(url);
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const playRecordedAudio = () => {
    if (!recordedAudioUrl) return;
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    const audio = new Audio(recordedAudioUrl);
    audioElementRef.current = audio;
    setIsPlayingRecord(true);
    audio.play();
    audio.onended = () => setIsPlayingRecord(false);
  };

  const playNativeRecitation = () => {
    HebrewSpeechSynthesizer.speak(portion.memoryVerse.hebrewWithNiqqud, {
      rate: 1.0,
      phoneticFallback: portion.memoryVerse.koreanPronunciation,
    });
  };

  const handleFinalMastery = () => {
    HebrewSpeechSynthesizer.playSuccessFanfare();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
    });
    onComplete(notes, recordedAudioUrl || undefined);
  };

  return (
    <div className="rounded-2xl border border-amber-600/50 bg-gradient-to-b from-slate-900 to-amber-950/20 p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-xs font-mono text-amber-400 font-semibold tracking-wider">
            DAY 7 · SHABBAT 안식일
          </span>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>최종 음성 암송 & 샤밧 묵상 (Mastery)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            한 주간 마음에 새긴 거룩한 말씀을 목소리로 녹음하고, 주님의 은혜를 묵상 노트에 기록하세요.
          </p>
        </div>

        {isPortionMastered && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>토라포션 암송 마스터 달성</span>
          </div>
        )}
      </div>

      {/* Voice Recording Lab */}
      <div className="rounded-xl border border-amber-800/40 bg-slate-950 p-6 space-y-5">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
          <span className="font-semibold text-amber-300">
            나의 히브리어 육성 낭독 녹음기
          </span>
          <button
            onClick={playNativeRecitation}
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>원어 표준 발음 듣기</span>
          </button>
        </div>

        {micError && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
            {micError}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
          {!isRecording ? (
            <button
              onClick={startRecord}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg transition-transform active:scale-95"
            >
              <Mic className="w-4 h-4" />
              <span>암송 녹음 시작하기</span>
            </button>
          ) : (
            <button
              onClick={stopRecord}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-200 text-slate-950 hover:bg-white animate-pulse shadow-lg"
            >
              <Square className="w-4 h-4 fill-slate-950" />
              <span>녹음 중단 및 저장</span>
            </button>
          )}

          {recordedAudioUrl && (
            <button
              onClick={playRecordedAudio}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                isPlayingRecord
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                  : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>{isPlayingRecord ? '재생 중...' : '내 녹음 재생'}</span>
            </button>
          )}
        </div>

        <p className="text-center text-xs text-slate-500">
          마이크 버튼을 누르고 보지 않고 히브리어 원문을 소리 내어 암송해보세요.
        </p>
      </div>

      {/* Self-Checklist */}
      <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
        <span className="block text-xs font-semibold text-slate-300">
          자가 암송 완성 점검 (Self-Audit)
        </span>

        <div className="space-y-2 text-xs sm:text-sm">
          <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={checklist.reading}
              onChange={(e) => setChecklist({ ...checklist, reading: e.target.checked })}
              className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500/30"
            />
            <span>히브리어 모음 부호(니쿠드)를 보지 않고도 정확한 발음으로 낭독할 수 있다.</span>
          </label>

          <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={checklist.roots}
              onChange={(e) => setChecklist({ ...checklist, roots: e.target.checked })}
              className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500/30"
            />
            <span>구절 내 핵심 단어들의 3자음 어근(Shoresh)과 뜻을 분해할 수 있다.</span>
          </label>

          <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={checklist.fullRecall}
              onChange={(e) => setChecklist({ ...checklist, fullRecall: e.target.checked })}
              className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500/30"
            />
            <span>한국어 의미를 떠올리며 처음부터 끝까지 막힘없이 완송할 수 있다.</span>
          </label>
        </div>
      </div>

      {/* Shabbat Meditation Note */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-amber-300">
            샤밧 안식일 묵상 & 영적 적용 노트
          </span>
          <span className="text-slate-500">자동 저장</span>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="이번 주간 암송한 말씀이 내 삶에 주신 은혜와 감동, 다짐을 기록하세요..."
          rows={4}
          className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
        />
      </div>

      {/* Final Action Button */}
      <div className="pt-2 flex flex-col items-center gap-3">
        <button
          onClick={handleFinalMastery}
          className="flex items-center gap-2 px-8 py-3 text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-xl shadow-lg transition-transform active:scale-95"
        >
          <Award className="w-5 h-5" />
          <span>이번 주 토라포션 암송 마스터 인증하기</span>
        </button>
      </div>

      {isCompleted && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>축하합니다! 7일차 완송과 샤밧 묵상을 온전히 완수하셨습니다.</span>
          </div>
          <span className="text-xs text-emerald-400 font-mono">Master Completed</span>
        </div>
      )}
    </div>
  );
};
