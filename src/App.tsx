import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PortionHero } from './components/PortionHero';
import { WeeklyScheduleNav } from './components/WeeklyScheduleNav';
import { WordInspectorModal } from './components/WordInspectorModal';
import { PortionSelectorDrawer } from './components/PortionSelectorDrawer';
import { CustomVerseModal } from './components/CustomVerseModal';
import { WordBreakdownSection } from './components/WordBreakdownSection';
import { StudyProgressSection } from './components/StudyProgressSection';

import { Day1Reading } from './components/days/Day1Reading';
import { Day2Vocabulary } from './components/days/Day2Vocabulary';
import { Day3Cloze } from './components/days/Day3Cloze';
import { Day4Scramble } from './components/days/Day4Scramble';
import { Day5Recall } from './components/days/Day5Recall';
import { Day6Dictation } from './components/days/Day6Dictation';
import { Day7Mastery } from './components/days/Day7Mastery';

import { DayIndex, HebrewWord, TorahPortion, UserStats } from './types/torah';
import { HebrewSpeechSynthesizer } from './utils/audio';
import {
  getAllPortions,
  getPortionProgress,
  getStoredProgress,
  getUserStats,
  saveDayProgress,
  savePortionNotes,
  toggleFavoritePortion,
  saveCustomPortion,
  getStoredSettings,
  saveStoredSettings,
} from './utils/storage';

export default function App() {
  const [portions, setPortions] = useState<TorahPortion[]>(() => getAllPortions());
  const [currentPortion, setCurrentPortion] = useState<TorahPortion>(() => portions[0]);
  
  // Default active day based on current day of week (Sunday=1 ... Saturday=7)
  const getTodayDayIndex = (): DayIndex => {
    const day = new Date().getDay(); // 0 is Sunday
    return (day === 0 ? 1 : (day + 1)) as DayIndex;
  };
  
  const [activeDay, setActiveDay] = useState<DayIndex>(getTodayDayIndex);
  const [progressMap, setProgressMap] = useState(() => getStoredProgress());
  const [userStats, setUserStats] = useState<UserStats>(() => getUserStats());
  const [settings, setSettings] = useState(() => getStoredSettings());
  
  // Modals & Drawers
  const [inspectorWord, setInspectorWord] = useState<HebrewWord | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Background precache audio for the active portion to guarantee instant playback
  useEffect(() => {
    if (currentPortion?.memoryVerse) {
      const wordsToCache = currentPortion.memoryVerse.words.map((w) => w.hebrew);
      HebrewSpeechSynthesizer.precache(
        [currentPortion.memoryVerse.hebrewWithNiqqud, ...wordsToCache],
        settings.recitationVoice || 'Fenrir'
      );
    }
  }, [currentPortion, settings.recitationVoice]);

  // Sync settings
  const toggleNiqqud = () => {
    const next = { ...settings, showNiqqud: !settings.showNiqqud };
    setSettings(next);
    saveStoredSettings(next);
  };

  const togglePhonetics = () => {
    const next = { ...settings, showKoreanPhonetics: !settings.showKoreanPhonetics };
    setSettings(next);
    saveStoredSettings(next);
  };

  const handleVoiceChange = (voice: string) => {
    const next = { ...settings, recitationVoice: voice };
    setSettings(next);
    saveStoredSettings(next);
  };

  const currentProgress = getPortionProgress(currentPortion.id);

  const handleCompleteDay = (day: DayIndex, statusData: { notes?: string; recordingUrl?: string } = {}) => {
    const updated = saveDayProgress(currentPortion.id, day, {
      notes: statusData.notes,
      recordingBlobUrl: statusData.recordingUrl,
    });
    setProgressMap((prev) => ({ ...prev, [currentPortion.id]: updated }));
    setUserStats(getUserStats());
  };

  const handleToggleFavorite = () => {
    toggleFavoritePortion(currentPortion.id);
    setProgressMap(getStoredProgress());
  };

  const handleToggleWordFavorite = (wordId: string) => {
    const currentFavs = userStats.favoriteWords || [];
    const isFav = currentFavs.includes(wordId);
    const nextFavs = isFav ? currentFavs.filter((id) => id !== wordId) : [...currentFavs, wordId];
    const updatedStats = { ...userStats, favoriteWords: nextFavs };
    setUserStats(updatedStats);
    try {
      localStorage.setItem('torah_memory_stats_v1', JSON.stringify(updatedStats));
    } catch {
      // ignore
    }
  };

  const handleSaveCustomPortion = (newPortion: TorahPortion) => {
    saveCustomPortion(newPortion);
    const all = getAllPortions();
    setPortions(all);
    setCurrentPortion(newPortion);
    setActiveDay(1);
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* 3-Zone Header Contract */}
      <Header
        onOpenPortionSelector={() => setIsSelectorOpen(true)}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
        onScrollToSection={scrollToSection}
        streakDays={userStats.streakDays}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 md:py-8 space-y-10">
        {/* Hero Section: Current Torah Portion & Scripture Scrollboard */}
        <PortionHero
          portion={currentPortion}
          isFavorite={!!currentProgress.favorite}
          onToggleFavorite={handleToggleFavorite}
          onOpenSelector={() => setIsSelectorOpen(true)}
          onWordClick={(word) => setInspectorWord(word)}
          showNiqqud={settings.showNiqqud}
          onToggleNiqqud={toggleNiqqud}
          showKoreanPhonetics={settings.showKoreanPhonetics}
          onTogglePhonetics={togglePhonetics}
          activeDay={activeDay}
          onStartDayTraining={(day) => {
            setActiveDay(day as DayIndex);
            scrollToSection('weekly-routine');
          }}
          recitationVoice={settings.recitationVoice || 'Fenrir'}
          onVoiceChange={handleVoiceChange}
        />

        {/* 7-Day Curriculum Navigation */}
        <WeeklyScheduleNav
          activeDay={activeDay}
          onSelectDay={(day) => setActiveDay(day)}
          progress={currentProgress}
        />

        {/* Active Day Training Sandbox Stage */}
        <section className="transition-all">
          {activeDay === 1 && (
            <Day1Reading
              verse={currentPortion.memoryVerse}
              onComplete={() => handleCompleteDay(1)}
              isCompleted={!!currentProgress.days[1]?.completed}
            />
          )}

          {activeDay === 2 && (
            <Day2Vocabulary
              verse={currentPortion.memoryVerse}
              onComplete={() => handleCompleteDay(2)}
              isCompleted={!!currentProgress.days[2]?.completed}
            />
          )}

          {activeDay === 3 && (
            <Day3Cloze
              verse={currentPortion.memoryVerse}
              onComplete={() => handleCompleteDay(3)}
              isCompleted={!!currentProgress.days[3]?.completed}
            />
          )}

          {activeDay === 4 && (
            <Day4Scramble
              verse={currentPortion.memoryVerse}
              onComplete={() => handleCompleteDay(4)}
              isCompleted={!!currentProgress.days[4]?.completed}
            />
          )}

          {activeDay === 5 && (
            <Day5Recall
              verse={currentPortion.memoryVerse}
              onComplete={() => handleCompleteDay(5)}
              isCompleted={!!currentProgress.days[5]?.completed}
            />
          )}

          {activeDay === 6 && (
            <Day6Dictation
              verse={currentPortion.memoryVerse}
              onComplete={() => handleCompleteDay(6)}
              isCompleted={!!currentProgress.days[6]?.completed}
            />
          )}

          {activeDay === 7 && (
            <Day7Mastery
              portion={currentPortion}
              onComplete={(notes, url) => handleCompleteDay(7, { notes, recordingUrl: url })}
              isCompleted={!!currentProgress.days[7]?.completed}
              savedNotes={currentProgress.days[7]?.notes || currentProgress.personalNotes}
              isPortionMastered={!!currentProgress.isMastered}
            />
          )}
        </section>

        {/* Word-by-Word Morphology Section */}
        <WordBreakdownSection
          verse={currentPortion.memoryVerse}
          onSelectWord={(word) => setInspectorWord(word)}
          favoritedWordIds={userStats.favoriteWords || []}
          onToggleFavoriteWord={handleToggleWordFavorite}
        />

        {/* Study Progress & Theological Insights Section */}
        <StudyProgressSection
          portion={currentPortion}
          progress={currentProgress}
          userStats={userStats}
        />
      </main>

      {/* Modals & Drawers */}
      <WordInspectorModal
        word={inspectorWord}
        onClose={() => setInspectorWord(null)}
        isWordFavorited={inspectorWord ? (userStats.favoriteWords || []).includes(inspectorWord.id) : false}
        onToggleWordFavorite={handleToggleWordFavorite}
      />

      <PortionSelectorDrawer
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        portions={portions}
        currentPortionId={currentPortion.id}
        onSelectPortion={(p) => {
          setCurrentPortion(p);
          setActiveDay(1);
        }}
        progressMap={progressMap}
      />

      <CustomVerseModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSavePortion={handleSaveCustomPortion}
      />

      {/* Quiet Respectful Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-hebrew text-base text-amber-400 font-bold">שַׁבָּת שָׁלוֹם</span>
            <span>·</span>
            <span>토라포션 히브리어 원어 암송 (Torah Hebrew Memory)</span>
          </div>
          <div>
            <span>매일 주님의 말씀을 심비에 새기는 7일간의 거룩한 여정</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
